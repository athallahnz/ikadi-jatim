// deno-lint-ignore no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// deno-lint-ignore no-import-prefix
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// deno-lint-ignore no-import-prefix
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

    // 1. Hitung total data yang perlu di-embed (status published=1, embedding is null)
    const { count: totalToProcess } = await supabase
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .is("embedding", null)
      .not("answer", "is", null);

    // 2. Inisialisasi Job record untuk tracking UI
    const { data: job, error: jobErr } = await supabase
      .from("vector_sync_jobs")
      .insert({
        status: "running",
        total_rows: totalToProcess || 0,
        processed_rows: 0,
      })
      .select().single();

    if (jobErr) throw jobErr;

    // 3. Background Processing (Asynchronous)
    const runSync = async () => {
      let processedCount = 0;
      const BATCH_SIZE = 25;

      try {
        while (true) {
          // Ambil batch data
          const { data: batch, error: fetchError } = await supabase
            .from("consultations")
            .select("id, title, question, answer")
            .is("embedding", null)
            .not("answer", "is", null)
            .limit(BATCH_SIZE)
            .order("id", { ascending: true });

          if (fetchError || !batch || batch.length === 0) break;

          // Mapping & Truncate Ketat (4000 karakter) agar tidak kena limit 8192 tokens
          const textsToEmbed = batch.map((item) => {
            const combined = `Judul: ${
              item.title || "Tanpa Judul"
            }\nPertanyaan: ${item.question}\nJawaban: ${item.answer}`;
            return combined.length > 4000
              ? combined.substring(0, 4000)
              : combined;
          });

          try {
            // Request embedding secara batch
            const embeddingRes = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: textsToEmbed,
            });

            // Siapkan payload update
            const updates = batch.map((item, i) => ({
              id: item.id,
              embedding: embeddingRes.data[i].embedding,
            }));

            // Simpan ke database
            const { error: upsertError } = await supabase.from("consultations")
              .upsert(updates);
            if (upsertError) throw upsertError;

            processedCount += batch.length;
          } catch (batchErr) {
            console.warn(
              "⚠️ Batch failed, retrying items individually...",
              batchErr,
            );

            // FALLBACK: Proses satu per satu jika batch gagal
            for (const item of batch) {
              try {
                const text =
                  `Judul: ${item.title}\nPertanyaan: ${item.question}\nJawaban: ${item.answer}`
                    .substring(0, 3500);
                const singleRes = await openai.embeddings.create({
                  model: "text-embedding-3-small",
                  input: text,
                });
                await supabase.from("consultations").update({
                  embedding: singleRes.data[0].embedding,
                }).eq("id", item.id);
              } catch (singleErr) {
                console.error(
                  `⏭️ Skipping ID ${item.id} permanently:`,
                  singleErr,
                );
                // Tandai dengan [] agar tidak ditarik lagi oleh query
                await supabase.from("consultations").update({ embedding: [] })
                  .eq("id", item.id);
              }
            }
            processedCount += batch.length;
          }

          // Update Progress ke tabel vector_sync_jobs secara realtime
          await supabase
            .from("vector_sync_jobs")
            .update({ processed_rows: processedCount })
            .eq("id", job.id);
        }

        // Tandai selesai
        await supabase.from("vector_sync_jobs").update({ status: "completed" })
          .eq("id", job.id);
      } catch (mainErr) {
        console.error("Critical Sync Error:", mainErr);
        await supabase.from("vector_sync_jobs").update({
          status: "failed",
          error_message: mainErr instanceof Error
            ? mainErr.message
            : "Kesalahan sistem tidak terduga",
        }).eq("id", job.id);
      }
    };

    // Jalankan fungsi asinkron tanpa await agar respon HTTP 200 segera dikirim
    runSync();

    return new Response(JSON.stringify({ jobId: job.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Terjadi kesalahan",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
