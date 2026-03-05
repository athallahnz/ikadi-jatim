import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Share2, Copy, Check } from "lucide-react";

/* ================= TYPES ================= */

type Category = {
  id?: string;
  name: string;
  slug: string;
};

type ArticleRow = {
  title: string;
  content: string;
  cover_url: string | null;
  created_at: string;
  categories: Category[] | Category | null;
};

type RelatedRow = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  created_at: string;
  categories: Category[] | Category | null;
};

type Article = {
  title: string;
  content: string;
  cover_url: string | null;
  created_at: string;
  category: Category | null;
};

type RelatedArticle = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  created_at: string;
  category: Category | null;
};

type Social = {
  id: string;
  platform: string;
  url: string;
  order_num: number;
};

type SettingsMap = Record<string, string>;

/* ================= ICON RENDER ================= */

function renderIcon(platform: string) {
  const p = platform.toLowerCase();

  if (p.includes("instagram")) return <i className="fa-brands fa-instagram" />;
  if (p.includes("facebook")) return <i className="fa-brands fa-facebook-f" />;
  if (p.includes("youtube")) return <i className="fa-brands fa-youtube" />;
  if (p.includes("twitter") || p.includes("x"))
    return <i className="fa-brands fa-x-twitter" />;
  if (p.includes("tiktok")) return <i className="fa-brands fa-tiktok" />;
  if (p.includes("linkedin")) return <i className="fa-brands fa-linkedin-in" />;

  return <i className="fa-solid fa-link" />;
}

/* ================= COMPONENT ================= */

export default function KajianDetail() {
  const { slug } = useParams();

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [settings, setSettings] = useState<SettingsMap>({});

  /* ================= FETCH ARTICLE ================= */

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      const { data } = await supabase
        .from("articles")
        .select(
          `
          title,
          content,
          cover_url,
          created_at,
          categories (
            id,
            name,
            slug
          )
        `,
        )
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (!data) return;

      const row = data as ArticleRow;

      const category = Array.isArray(row.categories)
        ? (row.categories[0] ?? null)
        : (row.categories ?? null);

      setArticle({
        title: row.title,
        content: row.content,
        cover_url: row.cover_url,
        created_at: row.created_at,
        category,
      });
    };

    fetchArticle();
  }, [slug]);

  /* ================= FETCH RELATED ================= */

  useEffect(() => {
    const fetchRelated = async () => {
      if (!article?.category?.slug) return;

      const { data } = await supabase
        .from("articles")
        .select(
          `
          id,
          title,
          slug,
          cover_url,
          created_at,
          categories!inner (
            id,
            name,
            slug
          )
        `,
        )
        .eq("published", true)
        .eq("categories.slug", article.category.slug)
        .neq("slug", slug)
        .limit(4);

      if (!data) return;

      const rows = data as RelatedRow[];

      const normalized: RelatedArticle[] = rows.map((r) => {
        const category = Array.isArray(r.categories)
          ? (r.categories[0] ?? null)
          : (r.categories ?? null);

        return {
          id: r.id,
          title: r.title,
          slug: r.slug,
          cover_url: r.cover_url,
          created_at: r.created_at,
          category,
        };
      });

      setRelated(normalized);
    };

    fetchRelated();
  }, [article, slug]);

  /* ================= FETCH GLOBAL ================= */

  useEffect(() => {
    const fetchGlobal = async () => {
      const { data: socialData } = await supabase
        .from("social_links")
        .select("*")
        .order("order_num", { ascending: true });

      if (socialData) setSocials(socialData);

      const { data: settingData } = await supabase
        .from("settings")
        .select("key, value");

      if (settingData) {
        const map = settingData.reduce<Record<string, string>>((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        setSettings(map);
      }
    };

    fetchGlobal();
  }, []);

  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!article)
    return (
      <section className="pt-24 pb-24 bg-background">
        <div className="container mx-auto py-12 animate-pulse space-y-6 max-w-3xl">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-80 bg-muted rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </section>
    );

  /* ================= RENDER ================= */

  return (
    <section className="pt-28 pb-24 bg-background relative">
      <div className="absolute inset-0 islamic-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto py-12 relative">
        <div className="grid lg:grid-cols-[1fr_400px] gap-16">
          {/* ================= MAIN ================= */}
          <div className="max-w-3xl">
            <div className="text-sm text-muted-foreground mb-4">
              <Link to="/kajian" className="hover:text-primary transition">
                Kajian
              </Link>
              /
              {article.category && (
                <Link
                  to={`/kajian/${article.category.slug}`}
                  className="hover:text-primary transition ml-1"
                >
                  {article.category.name}
                </Link>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              {/* COPY LINK */}
              <button
                onClick={handleCopy}
                className="w-9 h-9 flex items-center justify-center rounded-full 
               bg-muted hover:bg-primary hover:text-primary-foreground 
               transition"
                title="Salin Link"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>

              {/* WHATSAPP */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full 
               bg-muted hover:bg-primary hover:text-primary-foreground 
               transition text-base hover:bg-[#25D366] hover:text-white"
                title="Bagikan ke WhatsApp"
              >
                <i className="fa-brands fa-whatsapp" />
              </a>

              {/* X (Twitter) */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full 
               bg-muted hover:bg-primary hover:text-primary-foreground 
               transition text-base  hover:bg-black hover:text-white"
                title="Bagikan ke X"
              >
                <i className="fa-brands fa-x-twitter" />
              </a>
            </div>

            <div className="gold-divider mb-6" />

            <div className="text-sm text-muted-foreground mb-6">
              {new Date(article.created_at).toLocaleDateString()}
            </div>

            {article.cover_url && (
              <div className="overflow-hidden rounded-xl mb-8 group">
                <img
                  src={article.cover_url}
                  className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}

            <div
              className="
                prose dark:prose-invert max-w-none
                prose-headings:font-display
                prose-p:leading-relaxed
                prose-a:text-primary
                prose-strong:text-foreground
                prose-blockquote:border-l-4
                prose-blockquote:border-primary
                prose-blockquote:bg-muted/40
                prose-blockquote:px-4
                prose-blockquote:py-3
                prose-img:rounded-xl
              "
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* ================= SIDEBAR ================= */}
          <aside className="space-y-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="font-display font-semibold text-lg text-foreground/90 mb-5">
                Kajian Terkait
              </div>

              {related.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Tidak ada kajian terkait
                </div>
              ) : (
                <div className="space-y-5">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/kajian/${r.category?.slug}/${r.slug}`}
                      className="flex gap-4 group"
                    >
                      {r.cover_url ? (
                        <img
                          src={r.cover_url}
                          className="w-24 h-20 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-24 h-20 rounded-xl bg-muted flex items-center justify-center text-xs text-primary font-display text-center px-2">
                          Kajian
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground/90 leading-snug group-hover:text-primary transition line-clamp-2">
                          {r.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h4 className="font-display font-semibold text-lg text-foreground mb-4">
                Media Sosial
              </h4>

              <div className="flex gap-4 text-xl">
                {socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition"
                    title={social.platform}
                  >
                    {renderIcon(social.platform)}
                  </a>
                ))}
              </div>

              <p className="mt-6 text-xs font-bold text-accent uppercase tracking-widest">
                {settings.site_title}
              </p>
            </div>
          </aside>
        </div>
      </div>
      
      {/* ================= FLOATING SHARE (MOBILE) ================= */}
      <div className="lg:hidden fixed right-3 top-2/3 -translate-y-1/2 z-50">
        <div
          className="
    flex flex-col items-center gap-3
    px-2 py-3
    rounded-2xl
    bg-card/90 backdrop-blur-md
    border border-border
    shadow-lg animate-fade-in
  "
        >
          {/* COPY */}
          <button
            onClick={handleCopy}
            className="w-9 h-9 flex items-center justify-center rounded-full 
                 bg-muted hover:bg-primary hover:text-primary-foreground 
                 transition"
            title="Salin Link"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

          {/* WHATSAPP */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-full 
                 bg-muted hover:bg-primary hover:text-primary-foreground 
                 transition text-base"
            title="WhatsApp"
          >
            <i className="fa-brands fa-whatsapp" />
          </a>

          {/* X */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              shareUrl,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-full 
                 bg-muted hover:bg-primary hover:text-primary-foreground 
                 transition text-base"
            title="X"
          >
            <i className="fa-brands fa-x-twitter" />
          </a>
        </div>
      </div>
    </section>
  );
}
