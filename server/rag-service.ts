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
- Di akhir jawaban, sertakan link rujukan: "Baca selengkapnya: [/konsultasi/[slug]](/konsultasi/[slug])"
- Tambahkan ID rujukan: "Ref: #[ID]"`;

export async function generateUstadzResponse(
    userMessage: string,
): Promise<AskUstadzResponse> {
    try {
        // 2. Embedding query user
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: userMessage,
        });
        const queryVector = embeddingResponse.data[0].embedding;

        // 3. Pencarian Vektor dengan Threshold yang lebih fleksibel
        const { data: matches, error: searchError } = await supabase.rpc(
            "match_consultations",
            {
                query_embedding: queryVector,
                match_threshold: 0.35, // Diturunkan sedikit agar lebih banyak konteks tertangkap
                match_count: 3,
            },
        );

        if (searchError) {
            throw new Error(`Supabase search error: ${searchError.message}`);
        }

        const relevantDocs =
            (matches || []) as (ConsultationMatch & { slug: string })[];

        // 4. Penanganan Out of Scope
        if (relevantDocs.length === 0) {
            return {
                answer:
                    "Terkait pertanyaan tersebut, saya belum menemukan referensi fatwa yang spesifik di database kami. Ada baiknya hal ini dikonsultasikan langsung dengan Ustadz kami melalui layanan chat admin.",
                sources: [],
                isOutOfScope: true,
            };
        }

        // 5. Menyusun Konteks yang menyertakan ID dan Slug untuk AI
        const contextString = relevantDocs
            .map((doc) => {
                // Fallback jika slug tidak ada agar tidak muncul 'undefined' di link
                const safeSlug = doc.slug || "artikel-tidak-ditemukan";
                return `[ID: ${doc.id}]
                [Slug: ${safeSlug}]
                Judul: ${doc.title}
                Pertanyaan: ${doc.question}
                Jawaban: ${doc.answer}`;
            })
            .join("\n\n---\n\n");

        // 6. Chat Completion dengan instruksi manusiawi
        const chatResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.5, // Sedikit dinaikkan dari 0.2 agar bahasa lebih luwes tapi tetap terkontrol
            presence_penalty: 0.6, // Mendorong AI untuk menggunakan variasi kata baru
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "system",
                    content:
                        `Berikut adalah database referensi yang bisa Anda gunakan:\n\n${contextString}\n\nIngat: Jawablah dengan gaya bahasa yang mengayomi. Jika ada rujukan, cantumkan Ref ID atau link slug di akhir jawaban.`,
                },
                { role: "user", content: userMessage },
            ],
        });

        const sources: ReferenceSource[] = relevantDocs.map((doc) => ({
            id: doc.id,
            title: doc.title,
            similarity_score: doc.similarity_score,
            slug: doc.slug, // Pastikan interface ReferenceSource sudah mendukung slug
        }));

        return {
            answer: chatResponse.choices[0].message.content ||
                "Maaf, saya kesulitan menyusun kalimat saat ini.",
            sources: sources,
            isOutOfScope: false,
        };
    } catch (err: unknown) {
        console.error("[ERROR] RAG Service failure:", err);

        if (err instanceof Error) {
            console.error("MESSAGE:", err.message);
            console.error("STACK:", err.stack);
        }

        throw err;
    }
}
