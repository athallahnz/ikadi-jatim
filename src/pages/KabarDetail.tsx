import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

/* ================= TYPES ================= */

type KabarItem = {
  id: string;
  title: string;
  content: string;
  cover: string | null;
  display_date: string | null;
  slug: string;
  scope: string;
  daerah: string | null;
  daerah_slug: string | null;
  publish_at: string | null;
  author_id: string;
  admins?: { name: string | null }[];
};

type RelatedItem = {
  id: string;
  title: string;
  cover: string | null;
  display_date: string | null;
  slug: string;
  scope: string;
  daerah: string | null;
  daerah_slug: string | null;
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

export default function KabarDetail() {
  const { scope, slug } = useParams();

  const [artikel, setArtikel] = useState<KabarItem | null>(null);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [socials, setSocials] = useState<Social[]>([]);
  const [settings, setSettings] = useState<SettingsMap>({});

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ================= FETCH ================= */

  const loadData = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select(
          `
          id,title,content,cover,display_date,
          slug,scope,daerah,daerah_slug,publish_at,author_id,
          admins!events_author_id_fkey(name)
        `,
        )
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      setArtikel(data);

      const relQuery = supabase
        .from("events")
        .select("id,title,cover,display_date,slug,scope,daerah,daerah_slug")
        .eq("published", true)
        .neq("id", data.id)
        .eq("scope", data.scope)
        .order("publish_at", { ascending: false })
        .limit(4);

      const { data: rel } = await relQuery;
      setRelated(rel || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

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

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, [loadData]);

  /* ================= SKELETON ================= */

  if (loading) {
    return (
      <section className="pt-24 pb-24 bg-background">
        <div className="container mx-auto py-12 max-w-3xl animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-80 bg-muted rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </section>
    );
  }

  if (!artikel) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Berita Tidak Ditemukan</h2>
        <Button asChild variant="outline">
          <Link to="/kabar/jatim">Kembali ke Kabar</Link>
        </Button>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <section className="pt-28 pb-24 bg-background relative">
      <div className="absolute inset-0 islamic-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto py-12 relative">
        <div className="grid lg:grid-cols-[1fr_350px] gap-16">
          {/* ================= MAIN ================= */}
          <div className="max-w-3xl">
            {/* BREADCRUMB */}
            <div className="text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary transition">
                Beranda
              </Link>{" "}
              /{" "}
              <Link
                to={`/kabar/${scope}`}
                className="capitalize hover:text-primary transition"
              >
                {scope}
              </Link>
            </div>

            {/* TITLE */}
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight">
              {artikel.title}
            </h1>

            {/* SHARE */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleCopy}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition"
              >
                <i className="fa-brands fa-whatsapp" />
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition"
              >
                <i className="fa-brands fa-x-twitter" />
              </a>
            </div>

            {/* COVER */}
            {artikel.cover && (
              <div className="overflow-hidden rounded-2xl mb-8 group">
                <img
                  src={artikel.cover}
                  alt={artikel.title}
                  className="w-full h-[300px] md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}

            {/* META */}
            <div className="text-sm text-muted-foreground mb-6">
              {artikel.publish_at &&
                new Date(artikel.publish_at).toLocaleDateString("id-ID")}
            </div>

            {/* CONTENT */}
            <div
              className="
                prose dark:prose-invert max-w-none
                prose-headings:font-display
                prose-p:leading-relaxed
                prose-a:text-primary
                prose-blockquote:border-l-4
                prose-blockquote:border-primary
                prose-blockquote:bg-muted/40
                prose-blockquote:px-4
                prose-blockquote:py-3
              "
              dangerouslySetInnerHTML={{ __html: artikel.content }}
            />
          </div>

          {/* ================= SIDEBAR ================= */}
          <aside className="space-y-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-lg mb-5">
                Berita Terkait
              </h3>

              {related.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Tidak ada berita terkait
                </div>
              ) : (
                <div className="space-y-5">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={
                        r.scope === "daerah"
                          ? `/kabar/daerah/${r.daerah_slug}/${r.slug}`
                          : `/kabar/jatim/${r.slug}`
                      }
                      className="flex gap-4 group"
                    >
                      {r.cover ? (
                        <img
                          src={r.cover}
                          className="w-24 h-20 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-24 h-20 rounded-xl bg-muted flex items-center justify-center text-xs">
                          Berita
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="text-sm font-semibold leading-snug group-hover:text-primary transition line-clamp-2">
                          {r.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {r.display_date}
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
    </section>
  );
}
