// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const type = url.searchParams.get("type");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  let data = null;
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
          desc: event.content.replace(/<[^>]*>?/gm, "").substring(0, 160),
          image: event.cover,
          url: event.scope === "daerah" 
               ? `${baseUrl}/kabar/daerah/${event.daerah_slug}/${event.slug}`
               : `${baseUrl}/kabar/jatim/${event.slug}`
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
          desc: article.content.replace(/<[^>]*>?/gm, "").substring(0, 160),
          image: article.cover_url,
          url: article.scope === "daerah"
               ? `${baseUrl}/kajian/daerah/${article.daerah_slug}/${article.slug}`
               : `${baseUrl}/kajian/jatim/${article.slug}`
        };
      }
    }
  } catch (e) {
    console.error("DB Error:", e);
  }

  const response = await fetch(`${baseUrl}/index.html`);
  let html = await response.text();

  if (data) {
    // BERSIHKAN SEMUA META TAG BAWAAN (Agar tidak bentrok)
    html = html.replace(/<title>.*?<\/title>/g, "");
    html = html.replace(/<meta property="og:url".*?\/>/g, "");
    html = html.replace(/<meta property="og:title".*?\/>/g, "");
    html = html.replace(/<meta property="og:image".*?\/>/g, "");
    html = html.replace(/<meta property="og:description".*?\/>/g, "");
    html = html.replace(/<meta name="description".*?\/>/g, "");

    const metaTags = `
      <title>${data.title} | IKADI Jatim</title>
      <meta property="og:title" content="${data.title}" />
      <meta property="og:description" content="${data.desc}..." />
      <meta property="og:image" content="${data.image}" />
      <meta property="og:url" content="${data.url}" />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="${data.image}" />
      <meta name="twitter:title" content="${data.title}" />
    `;
    
    // Suntikkan tepat setelah tag <head>
    html = html.replace("<head>", `<head>${metaTags}`);
  }

  return new Response(html, { 
    headers: { "Content-Type": "text/html; charset=UTF-8" } 
  });
});