import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

type ArticleOG = {
  title: string;
  content: string;
  cover_url: string | null;
};

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

  if (typeof slug !== "string") {
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

  const url = `https://ikadijatim.vercel.app/kajian/${slug}`;
  const image = data.cover_url ?? "";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta property="og:title" content="${data.title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${url}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${data.title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
</head>
<body>
Redirecting...
<script>window.location.href="/kajian/${slug}";</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
