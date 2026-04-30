// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface MetaData {
  title: string;
  desc: string;
  image: string;
  url: string;
}

serve(async (req) => {
  const url = new URL(req.url);
  const slugParam = url.searchParams.get("slug");
  const type = url.searchParams.get("type");

  if (!slugParam) {
    return new Response("Missing slug", { status: 400 });
  }

  // Ambil slug terakhir (handle /kategori/slug)
  const slugParts = slugParam.split("/");
  const slug = slugParts[slugParts.length - 1];

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  const baseUrl = "https://ikadijatim.org";
  let data: MetaData | null = null;

  try {
    if (type === "event") {
      const { data: event } = await supabase
        .from("events")
        .select("title, content, cover, slug, scope, daerah_slug")
        .eq("slug", slug)
        .maybeSingle();

      if (event) {
        data = {
          title: event.title,
          desc: cleanText(event.content),
          image: event.cover ?? "",
          url: event.scope === "daerah"
            ? `${baseUrl}/kabar/daerah/${event.daerah_slug}/${event.slug}`
            : `${baseUrl}/kabar/jatim/${event.slug}`,
        };
      }
    } else {
      const { data: article } = await supabase
        .from("articles")
        .select("title, content, cover_url, slug, scope, daerah_slug")
        .eq("slug", slug)
        .maybeSingle();

      if (article) {
        data = {
          title: article.title,
          desc: cleanText(article.content),
          image: article.cover_url ?? "",
          url: article.scope === "daerah"
            ? `${baseUrl}/kajian/daerah/${article.daerah_slug}/${article.slug}`
            : `${baseUrl}/kajian/${article.slug}`, // FIX: jangan pakai /jatim kalau tidak ada
        };
      }
    }
  } catch (e) {
    console.error("DB Error:", e);
  }

  // 🔍 DETEKSI BOT
  const ua = req.headers.get("user-agent") || "";
  const isBot =
    /facebookexternalhit|Twitterbot|WhatsApp|Slackbot|Discordbot|LinkedInBot|TelegramBot|bingbot|googlebot/i
      .test(
        ua,
      );

  // ❌ DATA TIDAK ADA
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  // 👤 USER BIASA → redirect langsung (tidak lihat HTML OG)
  if (!isBot) {
    return Response.redirect(data.url, 302);
  }

  // 🤖 BOT → kirim HTML OG
  const botHtml = buildHtml(data);

  return new Response(botHtml, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
});

/* ================= HELPERS ================= */

function cleanText(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 155);
}

function buildHtml(data: MetaData): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>${data.title} | IKADI Jatim</title>

<meta name="description" content="${data.desc}..." />

<meta property="og:title" content="${data.title}" />
<meta property="og:description" content="${data.desc}..." />
<meta property="og:image" content="${data.image}" />
<meta property="og:url" content="${data.url}" />
<meta property="og:type" content="article" />

<meta name="twitter:card" content="summary_large_image" />

</head>
<body>
<p>${data.title}</p>
</body>
</html>`;
}
