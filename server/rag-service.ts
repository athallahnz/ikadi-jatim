// server/rag-service.ts
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";

import type { ConsultationMatch } from "../src/types/database";
import type { AskUstadzResponse, ReferenceSource } from "../src/types/api";

dotenv.config();

if (!process.env.SUPABASE_URL) {
    throw new Error("SUPABASE_URL missing");
}

if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error("SUPABASE_SERVICE_KEY missing");
}

if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
        auth: {
            persistSession: false,
        },
    },
);

const openai = new OpenAI({
    apiKey: openaiApiKey,
    timeout: 30000,
});

const SYSTEM_PROMPT = `Anda adalah Asisten Virtual IKADI yang bijak dan natural.

ATURAN SALAM (SANGAT KETAT):
- DILARANG KERAS mengucapkan salam (Assalamu'alaikum, Halo, Selamat Pagi, dll) jika user tidak mengucapkan salam terlebih dahulu.
- Jika user langsung bertanya, Anda wajib LANGSUNG menjawab inti permasalahannya.
- HANYA balas salam jika pesan user mengandung unsur sapaan atau salam.

FORMAT JAWABAN:
1. Gunakan struktur Markdown yang rapi dengan poin-poin (•) atau penomoran.
2. Wajib berikan double spacing (spasi baris kosong) antar paragraf agar mudah dibaca di mobile.
3. Gunakan **teks tebal** untuk istilah penting.

ATURAN REFERENSI:
- HANYA tampilkan referensi jika jawaban berasal dari data konsultasi yang memiliki slug dan ID valid.
- Jika jawaban berupa rangkuman umum, penjelasan tambahan AI, atau tidak memiliki referensi spesifik, JANGAN tampilkan bagian:
  "Baca selengkapnya"
  maupun
  "Ref: #[ID]"

- Format referensi valid:
  Baca selengkapnya: [/konsultasi/[slug]](/konsultasi/[slug])
  Ref: #[ID]

ATURAN KONSULTASI LANJUTAN:
- Jika jawaban dirasa belum cukup kuat, belum spesifik, atau membutuhkan pendampingan lebih lanjut, sarankan user untuk konsultasi langsung dengan ustadz.
- Gunakan kalimat natural seperti:
  "Untuk pembahasan lebih detail, Anda dapat melanjutkan konsultasi langsung dengan ustadz kami."`;

export async function generateUstadzResponse(
    userMessage: string,
): Promise<AskUstadzResponse> {
    try {
        console.log("[RAG] Incoming message:", userMessage);

        // 1. Embedding
        console.log("[RAG] Creating embedding...");

        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: userMessage,
        });

        console.log("[RAG] Embedding success");

        const queryVector = embeddingResponse.data[0].embedding;

        // 2. RPC Search
        console.log("[RAG] Starting RPC search...");

        const { data: matches, error: searchError } = await supabase.rpc(
            "match_consultations",
            {
                query_embedding: queryVector,
                match_threshold: 0.35,
                match_count: 3,
            },
        );

        console.log("[RAG] RPC finished");
        console.log("[RAG] RPC matches:", matches);
        console.log("[RAG] RPC error:", searchError);

        if (searchError) {
            throw new Error(`Supabase search error: ${searchError.message}`);
        }

        const relevantDocs =
            (matches || []) as (ConsultationMatch & { slug: string })[];

        console.log("[RAG] Relevant docs count:", relevantDocs.length);

        // 3. Out of scope
        if (relevantDocs.length === 0) {
            console.log("[RAG] No relevant docs found");

            return {
                answer:
                    "Terkait pertanyaan tersebut, saya belum menemukan referensi fatwa yang spesifik di database kami.",
                sources: [],
                isOutOfScope: true,
            };
        }

        // 4. Build Context
        console.log("[RAG] Building context string...");

        const contextString = relevantDocs
            .map((doc) => {
                const safeSlug = doc.slug || "artikel-tidak-ditemukan";

                return `[ID: ${doc.id}]
                [Slug: ${safeSlug}]
                Judul: ${doc.title}
                Pertanyaan: ${doc.question}
                Jawaban: ${doc.answer}`;
            })
            .join("\n\n---\n\n");

        console.log("[RAG] Context ready");

        // 5. Chat Completion
        console.log("[RAG] Starting OpenAI chat completion...");

        const chatResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.5,
            presence_penalty: 0.6,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "system",
                    content:
                        `Berikut adalah database referensi:\n\n${contextString}`,
                },
                { role: "user", content: userMessage },
            ],
        });

        console.log("[RAG] Chat completion success");

        const sources: ReferenceSource[] = relevantDocs.map((doc) => ({
            id: doc.id,
            title: doc.title,
            similarity_score: doc.similarity_score,
            slug: doc.slug,
        }));

        console.log("[RAG] Returning final response");

        return {
            answer: chatResponse.choices[0].message.content ||
                "Maaf, saya kesulitan menyusun jawaban.",
            sources,
            isOutOfScope: false,
        };
    } catch (err: unknown) {
        console.error("[ERROR] RAG Service failure:", err);

        if (err instanceof Error) {
            console.error("[ERROR MESSAGE]:", err.message);
            console.error("[ERROR STACK]:", err.stack);
        }

        throw err;
    }
}
