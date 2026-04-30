import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Copy, Check, Calendar, Tag, Share2, BookOpen } from "lucide-react";
import { Helmet } from "react-helmet-async";

/* ================= TYPES ================= */

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Article = {
  id: string;
  title: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  category: Category;
};

type RelatedArticle = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  publish_at: string;
  category: Category;
};

type Social = {
  id: string;
  platform: string;
  url: string;
};

type SettingsMap = Record<string, string>;

interface SupabaseArticleRow {
  slug: string;
  id: string;
  title: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  categories: Category | Category[] | null;
}

/* ================= HELPERS ================= */

const DEFAULT_OG = "https://ikadijatim.org/default-og.jpg";

function stripHtml(html: string) {
  if (typeof window === "undefined") return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function getOptimizedImage(url?: string | null) {
  if (!url || !url.startsWith("http")) return DEFAULT_OG;
  return `${url}?width=1200&height=630&resize=cover`;
}

function buildArticleSchema({
  title,
  description,
  image,
  url,
  datePublished,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: [image],
    author: {
      "@type": "Organization",
      name: "IKADI Jawa Timur",
    },
    publisher: {
      "@type": "Organization",
      name: "IKADI Jawa Timur",
      logo: {
        "@type": "ImageObject",
        url: "https://ikadijatim.org/logo.png",
      },
    },
    datePublished,
    dateModified: datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

function renderIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return <i className="fa-brands fa-instagram" />;
  if (p.includes("facebook")) return <i className="fa-brands fa-facebook-f" />;
  if (p.includes("youtube")) return <i className="fa-brands fa-youtube" />;
  if (p.includes("twitter") || p.includes("x"))
    return <i className="fa-brands fa-x-twitter" />;
  if (p.includes("tiktok")) return <i className="fa-brands fa-tiktok" />;
  return <i className="fa-solid fa-link" />;
}

/* ================= COMPONENT ================= */

export default function KajianDetail() {
  const { slug } = useParams();

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  /* ================= FETCH ================= */

  const loadData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);

    try {
      const { data: artData, error } = await supabase
        .from("articles")
        .select(
          `
          id, title, content, cover_url, publish_at,
          categories ( id, name, slug )
        `,
        )
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error || !artData) throw error;

      const row = artData as unknown as SupabaseArticleRow;
      const rawCat = Array.isArray(row.categories)
        ? row.categories[0]
        : row.categories;

      const safeCategory: Category = {
        id: rawCat?.id || "default",
        name: rawCat?.name || "Umum",
        slug: rawCat?.slug || "umum",
      };

      const currentArticle: Article = {
        id: row.id,
        title: row.title,
        content: row.content,
        cover_url: row.cover_url,
        publish_at: row.publish_at,
        category: safeCategory,
      };

      setArticle(currentArticle);

      const { data: relData } = await supabase
        .from("articles")
        .select(
          `
          id, title, slug, cover_url, publish_at,
          categories!inner ( id, name, slug )
        `,
        )
        .eq("published", true)
        .eq("categories.slug", safeCategory.slug)
        .neq("slug", slug)
        .order("publish_at", { ascending: false })
        .limit(4);

      if (relData) {
        const raw = relData as unknown as SupabaseArticleRow[];

        setRelated(
          raw.map((r) => {
            const cat = Array.isArray(r.categories)
              ? r.categories[0]
              : r.categories;

            return {
              id: r.id,
              title: r.title,
              slug: r.slug,
              cover_url: r.cover_url,
              publish_at: r.publish_at,
              category: {
                id: cat?.id || "default",
                name: cat?.name || "Umum",
                slug: cat?.slug || "umum",
              },
            };
          }),
        );
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, [loadData]);

  useEffect(() => {
    const fetchGlobal = async () => {
      const { data: soc } = await supabase
        .from("social_links")
        .select("*")
        .order("order_num");
      if (soc) setSocials(soc);

      const { data: sett } = await supabase
        .from("settings")
        .select("key, value");
      if (sett) {
        setSettings(
          sett.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
        );
      }
    };
    fetchGlobal();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ================= RENDER ================= */

  if (loading) return <div className="pt-40 text-center">Loading...</div>;
  if (!article) return <div className="pt-40 text-center">Tidak ditemukan</div>;

  const seoDescription =
    stripHtml(article.content).substring(0, 160).trim() + "...";

  const image = getOptimizedImage(article.cover_url);

  const schema = buildArticleSchema({
    title: article.title,
    description: seoDescription,
    image,
    url: shareUrl,
    datePublished: article.publish_at,
  });

  return (
    <section className="pt-28 pb-24 bg-background">
      <Helmet>
        <title>{article.title} | IKADI Jatim</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={shareUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={image} />

        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="absolute inset-0 islamic-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto py-12 relative px-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-16">
          {/* ================= MAIN CONTENT ================= */}
          <div className="max-w-3xl">
            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/kajian" className="hover:text-primary transition">
                Kajian
              </Link>
              <span className="opacity-50">/</span>
              <Link
                to={`/kajian/${article.category.slug}`}
                className="text-primary font-medium hover:underline"
              >
                {article.category.name}
              </Link>
            </nav>

            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>

            {/* META & ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  {new Date(article.publish_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Tag size={14} className="text-primary" />
                  {article.category.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-white transition shadow-sm"
                  title="Salin Link"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(article.title + " " + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-[#25D366] hover:text-white transition shadow-sm"
                  title="Share WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp" />
                </a>
              </div>
            </div>

            {/* COVER IMAGE */}
            {article.cover_url && (
              <figure className="mb-10">
                <img
                  src={article.cover_url}
                  alt={article.title}
                  className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-md border border-border"
                />
              </figure>
            )}

            {/* ARTICLE CONTENT */}
            <div
              className="prose dark:prose-invert max-w-none prose-headings:font-display prose-p:leading-relaxed prose-img:rounded-xl prose-blockquote:border-primary prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* ================= SIDEBAR ================= */}
          <aside className="space-y-8">
            {/* RELATED BOX */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Kajian Terkait
              </h3>

              <div className="space-y-6">
                {related.length > 0 ? (
                  related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/kajian/${r.category.slug}/${r.slug}`}
                      className="flex gap-4 group"
                    >
                      <div className="w-20 h-20 flex-shrink-0 bg-muted rounded-xl overflow-hidden border border-border">
                        {r.cover_url ? (
                          <img
                            src={r.cover_url}
                            alt={r.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-primary uppercase font-bold text-center p-1">
                            Kajian
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold leading-snug group-hover:text-primary transition line-clamp-2 mb-1">
                          {r.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(r.publish_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Belum ada kajian serupa.
                  </p>
                )}
              </div>
            </div>

            {/* SOCIAL BOX */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
                <Share2 size={18} className="text-primary" /> Ikuti Kami
              </h3>
              <div className="flex flex-wrap gap-3">
                {socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-white transition shadow-sm text-lg"
                  >
                    {renderIcon(social.platform)}
                  </a>
                ))}
              </div>
              {settings.site_title && (
                <p className="mt-6 text-[10px] font-bold text-primary uppercase tracking-[0.2em] border-t pt-4 border-border">
                  {settings.site_title}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
