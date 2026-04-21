import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Sesuai instruksi: Menggunakan Interface yang spesifik & akurat
interface ArticleOG {
  title: string;
  content: string;
  cover_url: string | null;
}

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE as string,
);

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const slug = req.query.slug;
  const category = req.query.category;

  if (typeof slug !== "string" || typeof category !== "string") {
    res.status(404).send("Not found");
    return;
  }

  const { data, error } = await supabase
    .from("articles")
    .select("title, content, cover_url")
    .eq("slug", slug)
    .single<ArticleOG>();

  if (error || !data) {
    res.status(404).send("Not found");
    return;
  }

  const description = stripHtml(data.content).slice(0, 150) + "...";
  const image = data.cover_url ?? "https://ikadijatim.org/logo-ikadi.png"; // Fallback ke logo jika cover kosong

  // UPDATE: Mengarah ke domain .org
  const canonicalUrl = `https://ikadijatim.org/kajian/${category}/${slug}`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${data.title} | IKADI Jawa Timur</title>
<meta property="og:title" content="${data.title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${canonicalUrl}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${data.title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />

<link rel="canonical" href="${canonicalUrl}" />
</head>
<body>
Pindah halaman...
<script>
  // Redirect ke website utama di Jagoan Hosting
  window.location.href = "${canonicalUrl}";
</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
