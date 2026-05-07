// scripts/ingest-vectors.ts
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import ws from "ws";

dotenv.config();

// Definisi Interface Database yang akurat
interface ConsultationRow {
  id: number;
  title: string | null;
  question: string;
  answer: string;
  embedding: number[] | null;
}

// Interface untuk Update Payload
interface EmbeddingUpdate {
  id: number;
  embedding: number[];
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: {
    // @ts-expect-error: WebSocket types mismatch but functionally compatible
    transport: ws,
  },
  auth: {
    persistSession: false,
  },
});

const openai = new OpenAI({ apiKey: openaiApiKey });

const BATCH_SIZE = 100;

async function processEmbeddings(): Promise<void> {
  console.log("🚀 Memulai proses embedding untuk data baru...");
  let totalProcessed = 0;

  while (true) {
    const { data: consultations, error: fetchError } = await supabase
      .from("consultations")
      .select("id, title, question, answer")
      .is("embedding", null)
      .not("answer", "is", null)
      .limit(BATCH_SIZE)
      .order("id", { ascending: true })
      .returns<
        Pick<ConsultationRow, "id" | "title" | "question" | "answer">[]
      >();

    if (fetchError) {
      console.error("❌ Database Fetch Error:", fetchError.message);
      break;
    }

    if (!consultations || consultations.length === 0) {
      console.log("✅ Selesai! Tidak ada data baru untuk diproses.");
      break;
    }

    // 1. FILTER & TRUNCATE DATA
    // Kita perkecil limit karakter ke 8000 agar jauh di bawah limit 8192 TOKENS.
    const validConsultations = consultations.map((item) => {
      const combined = `Judul: ${
        item.title || "Tanpa Judul"
      }\nPertanyaan: ${item.question}\nJawaban: ${item.answer}`;

      // Jika teks terlalu panjang, kita potong paksa di 8000 karakter (~2000-3000 tokens)
      // Ini jauh lebih aman untuk menghindari error 400.
      const safeText = combined.length > 8000
        ? combined.substring(0, 8000)
        : combined;

      return {
        id: item.id,
        text: safeText,
      };
    });

    const textsToEmbed = validConsultations.map((c) => c.text);

    try {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textsToEmbed,
      });

      const updates: EmbeddingUpdate[] = validConsultations.map((
        item,
        index,
      ) => ({
        id: item.id,
        embedding: embeddingResponse.data[index].embedding,
      }));

      const { error: updateError } = await supabase
        .from("consultations")
        .upsert(updates, { onConflict: "id" });

      if (updateError) {
        console.error("⚠️ Bulk Update Error:", updateError.message);
        await new Promise((res) => setTimeout(res, 2000));
        continue;
      }

      totalProcessed += consultations.length;
      console.log(`✨ Progress: ${totalProcessed} baris berhasil diproses.`);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "status" in error) {
        const err = error as { status: number; message?: string };

        // JIKA TETAP ERROR 400 (Input terlalu panjang)
        if (err.status === 400) {
          console.warn(
            "⚠️ Batch gagal karena ada teks terlalu panjang. Memproses satu per satu...",
          );

          for (const item of validConsultations) {
            try {
              const res = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: item.text,
              });

              await supabase
                .from("consultations")
                .update({ embedding: res.data[0].embedding })
                .eq("id", item.id);
            } catch (singleErr) {
              // JIKA MASIH GAGAL, KITA SKIP DATA INI SECARA PERMANEN
              // Dengan cara mengisi embedding dengan array kosong atau menandainya agar tidak ditarik lagi
              console.error(
                `⏭️ ID ${item.id} Terlalu panjang untuk OpenAI. Skipping permanen...`,
              );

              // Opsi: Update dengan array kosong agar '.is("embedding", null)' tidak mengambilnya lagi
              await supabase
                .from("consultations")
                .update({ embedding: [] }) // Tandai sebagai sudah diproses (tapi gagal)
                .eq("id", item.id);
            }
          }
          continue;
        }

        if (err.status === 429) {
          console.log("⏳ Rate limit. Istirahat 30 detik...");
          await new Promise((res) => setTimeout(res, 30000));
          continue;
        }
      }

      console.error("❌ Unknown Error. Mencoba lagi dalam 5 detik...");
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  console.log("🏁 Selesai.");
  process.exit(0);
}

processEmbeddings();
