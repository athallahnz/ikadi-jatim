// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface MetaData {
  title: string;
  desc: string;
  image: string;
  url: string;
}

const BASE_URL = "https://ikadijatim.org";
const DEFAULT_OG = `${BASE_URL}/default-og.jpg`;

serve(async (req) => {
  const url = new URL(req.url);
  const slugParam = url.searchParams.get("slug");
  const type = url.searchParams.get("type");

  if (!slugParam) {
    return new Response("Missing slug", { status: 400 });
  }

  const slug = slugParam.split("/").pop();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  let data: MetaData | null = null;

  try {
    /* ================= EVENT ================= */
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
          image: resolveImage(event.cover),
          url:
            event.scope === "daerah"
              ? `${BASE_URL}/kabar/daerah/${event.daerah_slug}/${event.slug}`
              : `${BASE_URL}/kabar/jatim/${event.slug}`,
        };
      }
    }

    /* ================= ARTICLE ================= */
    else {
      const { data: article } = await supabase
        .from("articles")
        .select(`
          title,
          content,
          cover_url,
          slug,
          scope,
          daerah_slug,
          categories ( slug )
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (article) {
        const cat = Array.isArray(article.categories)
          ? article.categories[0]
          : article.categories;

        const categorySlug =
          cat?.slug && cat.slug !== "undefined" ? cat.slug : "umum";

        data = {
          title: article.title,
          desc: cleanText(article.content),
          image: resolveImage(article.cover_url),
          url:
            article.scope === "daerah"
              ? `${BASE_URL}/kajian/daerah/${article.daerah_slug}/${article.slug}`
              : `${BASE_URL}/kajian/${categorySlug}/${article.slug}`,
        };
      }
    }
  } catch (e) {
    console.error("DB Error:", e);
  }

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  /* ================= BOT ONLY ================= */
  const ua = req.headers.get("user-agent") || "";
  const isBot =
    /facebookexternalhit|Twitterbot|WhatsApp|Slackbot|Discordbot|LinkedInBot|TelegramBot|bingbot|googlebot/i.test(
      ua,
    );

  if (!isBot) {
    return new Response("Not allowed", { status: 403 });
  }

  /* ================= RESPONSE ================= */
  return new Response(buildHtml(data), {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
});

/* ================= HELPERS ================= */

function cleanText(html: string): string {
  const text = html
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.substring(0, 155) || "IKADI Jawa Timur";
}

function resolveImage(url?: string | null): string {
  if (!url || !url.startsWith("http")) return DEFAULT_OG;

  // WA-safe image
  return `${url}?width=1200&height=630&resize=cover`;
}

function buildHtml(data: MetaData): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(data.title)} | IKADI Jatim</title>

<meta name="description" content="${escapeHtml(data.desc)}" />

<meta property="og:title" content="${escapeHtml(data.title)}" />
<meta property="og:description" content="${escapeHtml(data.desc)}" />
<meta property="og:image" content="${data.image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:url" content="${data.url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="IKADI Jawa Timur" />

<meta name="twitter:card" content="summary_large_image" />

</head>
<body></body>
</html>`;
}

function escapeHtml(str: string = ""): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}