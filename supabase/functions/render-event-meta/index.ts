// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Interface yang ketat sesuai gambar schema
interface EventRow {
  title: string;
  content: string;
  cover: string | null;
  slug: string;
  scope: string;
  daerah_slug: string | null;
}

interface ArticleRow {
  title: string;
  content: string;
  cover_url: string | null;
  slug: string;
  scope: string;
  daerah_slug: string | null;
}

serve(async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const type = url.searchParams.get("type"); // 'event' atau 'article'

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  const meta = {
    title: "",
    description: "",
    image: "",
    fullUrl: "https://ikadijatim.org",
  };

  if (type === "event") {
    const { data: event } = await supabase
      .from("events")
      .select("title, content, cover, slug, scope, daerah_slug")
      .eq("slug", slug)
      .eq("published", true)
      .single() as { data: EventRow | null };

    if (event) {
      meta.title = event.title;
      meta.description = event.content.replace(/<[^>]*>?/gm, "").substring(
        0,
        150,
      );
      meta.image = event.cover ?? "";
      // Dynamic Routing sesuai schema
      meta.fullUrl += event.scope === "daerah"
        ? `/kabar/daerah/${event.daerah_slug}/${event.slug}`
        : `/kabar/jatim/${event.slug}`;
    }
  } else {
    const { data: article } = await supabase
      .from("articles")
      .select("title, content, cover_url, slug, scope, daerah_slug")
      .eq("slug", slug)
      .eq("published", true)
      .single() as { data: ArticleRow | null };

    if (article) {
      meta.title = article.title;
      meta.description = article.content.replace(/<[^>]*>?/gm, "").substring(
        0,
        150,
      );
      meta.image = article.cover_url ?? "";
      // Sesuai schema, articles juga punya scope dan daerah_slug
      meta.fullUrl += article.scope === "daerah"
        ? `/kajian/daerah/${article.daerah_slug}/${article.slug}`
        : `/kajian/jatim/${article.slug}`;
    }
  }

  // Ambil HTML dasar
  const response = await fetch("https://ikadijatim.org/index.html");
  let html = await response.text();

  if (meta.title) {
    const metaTags = `
      <title>${meta.title} | IKADI Jatim</title>
      <meta property="og:title" content="${meta.title}" />
      <meta property="og:description" content="${meta.description}..." />
      <meta property="og:image" content="${meta.image}" />
      <meta property="og:url" content="${meta.fullUrl}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${meta.title}" />
      <meta name="twitter:description" content="${meta.description}..." />
      <meta name="twitter:image" content="${meta.image}" />
    `;

    // Inject sebelum </head>
    html = html.replace("</head>", `${metaTags}</head>`);
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
});
