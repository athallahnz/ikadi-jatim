// scripts/ingest-vectors.ts
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: {
    // Menggunakan @ts-expect-error karena perbedaan definisi tipe antara ws dan SDK
    // @ts-expect-error: WebSocket types mismatch but functionally compatible
    transport: ws,
  },
  auth: {
    persistSession: false,
  }
});

const openai = new OpenAI({ apiKey: openaiApiKey });

interface UnprocessedConsultation {
  id: number;
  title: string | null;
  question: string;
  answer: string;
}

const BATCH_SIZE = 100;

async function processEmbeddings(): Promise<void> {
  console.log("🚀 Melanjutkan proses ingestion 10k+ baris...");

  let totalProcessed = 0;

  while (true) {
    const { data: consultations, error: fetchError } = await supabase
      .from("consultations")
      .select("id, title, question, answer")
      .is("embedding", null)
      .not("answer", "is", null)
      .limit(BATCH_SIZE)
      .order('id', { ascending: true })
      .returns<UnprocessedConsultation[]>();

    if (fetchError) {
      console.error("❌ Database Fetch Error:", fetchError.message);
      break;
    }

    if (!consultations || consultations.length === 0) {
      console.log("✅ Alhamdulillah! Semua data berhasil diproses.");
      break;
    }

    // Truncation ketat di 12.000 karakter agar jauh dari limit 8192 token OpenAI
    const textsToEmbed: string[] = consultations.map((item) => {
      const combined = `Judul: ${item.title || "Tanpa Judul"}\nPertanyaan: ${item.question}\nJawaban: ${item.answer}`;
      return combined.length > 12000 ? combined.substring(0, 12000) : combined;
    });

    try {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textsToEmbed,
      });

      const updates = consultations.map((item, index) => ({
        id: item.id,
        embedding: embeddingResponse.data[index].embedding,
      }));

      const { error: updateError } = await supabase
        .from("consultations")
        .upsert(updates, { onConflict: 'id' });

      if (updateError) {
        console.error("⚠️ Bulk Update Error:", updateError.message);
        // Jika gagal bulk, beri jeda dan coba lagi batch berikutnya
        await new Promise(res => setTimeout(res, 2000));
        continue;
      }

      totalProcessed += consultations.length;
      console.log(`✨ Progress: ${totalProcessed} baris baru diproses...`);

    } catch (apiError: unknown) {
      // Type guard untuk menangani error tanpa 'any'
      if (apiError && typeof apiError === 'object' && 'status' in apiError) {
        const err = apiError as { status: number; message?: string };
        
        if (err.status === 400) {
          console.error("❌ Batch mengandung teks terlalu panjang. Memproses satu per satu...");
          for (const item of consultations) {
            try {
              const text = `Judul: ${item.title}\nQ: ${item.question}\nA: ${item.answer}`.substring(0, 8000);
              const res = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
              await supabase.from("consultations").update({ embedding: res.data[0].embedding }).eq("id", item.id);
            } catch (singleErr) {
              console.error(`⏭️ ID ${item.id} gagal (skip).`);
            }
          }
          continue;
        }

        if (err.status === 429) {
          console.log("⏳ Rate limit. Istirahat 20 detik...");
          await new Promise(res => setTimeout(res, 20000));
          continue;
        }
      }

      console.error("❌ Network/Unknown Error. Mencoba kembali dalam 5 detik...");
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  console.log("🏁 Selesai.");
  process.exit(0);
}

processEmbeddings();