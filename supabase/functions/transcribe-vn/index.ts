// supabase/functions/transcribe-vn/index.ts
// deno-lint-ignore no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { audioUrl } = await req.json();

    if (!audioUrl) {
      throw new Error("Audio URL is required");
    }

    // 1. Download file audio dari Supabase Storage
    const audioResponse = await fetch(audioUrl);
    const blob = await audioResponse.blob();

    // 2. Siapkan FormData untuk OpenAI Whisper
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    formData.append("model", "whisper-1");
    formData.append("language", "id"); // Paksa ke Bahasa Indonesia agar lebih akurat

    const categories = [
      "Al-Qur'an",
      "Hadits",
      "Thaharah",
      "Sholat",
      "Puasa",
      "Zakat",
      "Haji & Umrah",
      "Makanan & Sembelihan",
      "Dzikir & Doa",
      "Fiqih Muamalah",
      "Pernikahan & Keluarga",
      "Waris",
      "Akhlaq",
      "Dakwah",
      "Seni & Gambar",
      "Jihad",
      "Aqidah",
    ];

    const religiousPrompt = `
  Konteks: Konsultasi Agama Islam Ikadi Jatim.
  Istilah: ${
      categories.join(", ")
    }, Assalamu'alaikum, ustadz, Bismillahirrohmanirrohim, 
  بسم الله الرحمن الرحيم, Alhamdulillah, الحمد لله, Masya Allah, ماشاء الله, 
  Insha Allah, إن شاء الله, jazakallahu khairan, جزاك الله خيرا.
`;

    formData.append("prompt", religiousPrompt);
    
    // 3. Panggil API OpenAI
    const whisperResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      },
    );

    const data = await whisperResponse.json();

    if (data.error) throw new Error(data.error.message);

    return new Response(
      JSON.stringify({ text: data.text }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: unknown) {
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
