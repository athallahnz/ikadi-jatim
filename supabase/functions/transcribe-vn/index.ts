// deno-lint-ignore no-import-prefix
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // =========================
  // HANDLE CORS
  // =========================
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    console.log("=== TRANSCRIBE FUNCTION START ===");

    // =========================
    // CHECK OPENAI KEY
    // =========================
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing");
    }

    // =========================
    // PARSE REQUEST BODY
    // =========================
    const body = await req.json();

    console.log("REQUEST BODY:", body);

    const { audioUrl } = body;

    if (!audioUrl) {
      throw new Error("Audio URL is required");
    }

    console.log("AUDIO URL:", audioUrl);

    // =========================
    // DOWNLOAD AUDIO FILE
    // =========================
    const audioResponse = await fetch(audioUrl);

    console.log(
      "AUDIO FETCH STATUS:",
      audioResponse.status,
    );

    if (!audioResponse.ok) {
      throw new Error(
        `Failed to fetch audio file: ${audioResponse.status}`,
      );
    }

    // =========================
    // CONVERT TO BLOB
    // =========================
    const blob = await audioResponse.blob();

    console.log("AUDIO SIZE:", blob.size);

    if (blob.size === 0) {
      throw new Error("Audio blob is empty");
    }

    // =========================
    // PREPARE FOR OPENAI
    // =========================
    const formData = new FormData();

    formData.append(
      "file",
      blob,
      "recording.webm",
    );

    formData.append("model", "whisper-1");

    formData.append("language", "id");

    // =========================
    // RELIGIOUS CONTEXT PROMPT
    // =========================
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
Konteks: Konsultasi Agama Islam IKADI Jatim.

Istilah:
${categories.join(", ")}

Ucapan umum:
Assalamu'alaikum,
ustadz,
Bismillahirrahmanirrahim,
Alhamdulillah,
Masya Allah,
Insya Allah,
jazakallahu khairan.

Tulisan Arab:
بسم الله الرحمن الرحيم
الحمد لله
ما شاء الله
إن شاء الله
جزاك الله خيرا
`;

    formData.append("prompt", religiousPrompt);

    console.log("CALLING OPENAI WHISPER API...");

    // =========================
    // CALL OPENAI WHISPER
    // =========================
    const whisperResponse = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      },
    );

    console.log(
      "WHISPER STATUS:",
      whisperResponse.status,
    );

    const data = await whisperResponse.json();

    console.log("WHISPER RESPONSE:", data);

    // =========================
    // HANDLE OPENAI ERROR
    // =========================
    if (!whisperResponse.ok) {
      throw new Error(
        data?.error?.message ||
          "Whisper transcription failed",
      );
    }

    if (!data.text) {
      throw new Error(
        "Whisper returned empty transcription",
      );
    }

    console.log("=== TRANSCRIBE SUCCESS ===");

    // =========================
    // SUCCESS RESPONSE
    // =========================
    return new Response(
      JSON.stringify({
        success: true,
        text: data.text,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: unknown) {
    console.error(
      "=== TRANSCRIBE ERROR ===",
      error,
    );

    const err = error as Error;

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
