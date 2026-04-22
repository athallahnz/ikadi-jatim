// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface MetaData {
  title: string;
  description: string;
  image: string;
  fullUrl: string;
}

serve(async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const type = url.searchParams.get("type"); // 'event' atau 'article'

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
        .eq("published", true)
        .maybeSingle();

      if (event) {
        data = {
          title: event.title,
          description: event.content.replace(/<[^>]*>?/gm, "").substring(0, 155),
          image: event.cover ?? "",
          fullUrl: event.scope === "daerah"
            ? `${baseUrl}/kabar/daerah/${event.daerah_slug}/${event.slug}`
            : `${baseUrl}/kabar/jatim/${event.slug}`,
        };
      }
    } else {
      const { data: article } = await supabase
        .from("articles")
        .select("title, content, cover_url, slug, scope, daerah_slug")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (article) {
        data = {
          title: article.title,
          description: article.content.replace(/<[^>]*>?/gm, "").substring(0, 155),
          image: article.cover_url ?? "",
          fullUrl: article.scope === "daerah"
            ? `${baseUrl}/kajian/daerah/${article.daerah_slug}/${article.slug}`
            : `${baseUrl}/kajian/jatim/${article.slug}`,
        };
      }
    }
  } catch (err) {
    console.error("Database Error:", err);
  }

  // Ambil HTML dasar dari hosting utama
  const response = await fetch(`${baseUrl}/index.html`);
  let html = await response.text();

  if (data) {
    // BERSIHKAN METADATA LAMA (Penting agar FB tidak bingung)
    html = html.replace(/<title>.*?<\/title>/g, "");
    html = html.replace(/<meta property="og:title".*?\/>/g, "");
    html = html.replace(/<meta property="og:description".*?\/>/g, "");
    html = html.replace(/<meta property="og:image".*?\/>/g, "");
    html = html.replace(/<meta property="og:url".*?\/>/g, "");
    html = html.replace(/<meta name="description".*?\/>/g, "");

    const metaTags = `
      <title>${data.title} | IKADI Jatim</title>
      <meta name="description" content="${data.description}..." />
      <meta property="og:title" content="${data.title}" />
      <meta property="og:description" content="${data.description}..." />
      <meta property="og:image" content="${data.image}" />
      <meta property="og:url" content="${data.fullUrl}" />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${data.title}" />
      <meta name="twitter:description" content="${data.description}..." />
      <meta name="twitter:image" content="${data.image}" />
    `;

    // Inject tepat setelah <head> agar dibaca paling awal
    html = html.replace("<head>", `<head>${metaTags}`);
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  });
});