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
  const slug = url.searchParams.get("slug");
  const type = url.searchParams.get("type");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  let data: MetaData | null = null;
  const baseUrl = "https://ikadijatim.org";

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
          desc: event.content.replace(/<[^>]*>?/gm, "").substring(0, 155),
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
          desc: article.content.replace(/<[^>]*>?/gm, "").substring(0, 155),
          image: article.cover_url ?? "",
          url: article.scope === "daerah"
            ? `${baseUrl}/kajian/daerah/${article.daerah_slug}/${article.slug}`
            : `${baseUrl}/kajian/jatim/${article.slug}`,
        };
      }
    }
  } catch (e) {
    console.error("DB Error:", e);
  }

  // OPTIMASI iOS: Jika data ditemukan, jangan fetch index.html.
  // Langsung kirim HTML minimalis khusus untuk crawler.
  if (data) {
    const botHtml = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} | IKADI Jatim</title>
    <meta name="description" content="${data.desc}..." />
    <meta property="og:title" content="${data.title}" />
    <meta property="og:description" content="${data.desc}..." />
    <meta property="og:image" content="${data.image}" />
    <meta property="og:url" content="${data.url}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${data.image}" />
    <meta name="twitter:title" content="${data.title}" />
    <meta http-equiv="refresh" content="0;url=${data.url}">
</head>
<body>
    <p>Sedang mengalihkan ke <a href="${data.url}">${data.title}</a></p>
</body>
</html>`;

    return new Response(botHtml, {
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }

  // Fallback: Jika data tidak ditemukan, baru fetch index.html asli
  const response = await fetch(`${baseUrl}/index.html`);
  const fallbackHtml = await response.text();

  return new Response(fallbackHtml, {
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  });
});
