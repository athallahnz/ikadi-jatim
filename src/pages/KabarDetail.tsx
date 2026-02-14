import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

/* ================= TYPES ================= */

type KabarItem = {
  id: string;
  title: string;
  content: string;
  cover: string | null;
  date: string | null;
  display_date: string | null;
  slug: string;
  scope: string;
  daerah: string | null;
  daerah_slug: string | null;
  publish_at: string | null;
  author_id: string;
  admins?: {
    name: string | null;
  }[]; // admins hanya berisi nama
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

/* ================= COMPONENT ================= */

const KabarDetail = () => {
  const { scope, daerah, slug } = useParams();
  const [artikel, setArtikel] = useState<KabarItem | null>(null);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          id, title, content, cover, date, display_date,
          slug, scope, daerah, daerah_slug, publish_at, author_id,
          admins!events_author_id_fkey(name)
        `,
        )
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      setArtikel(data);

      /* ===== FETCH RELATED ===== */
      let relQuery = supabase
        .from("events")
        .select("id,title,cover,display_date,slug,scope,daerah,daerah_slug")
        .eq("published", true)
        .neq("id", data.id)
        .eq("scope", data.scope)
        .order("publish_at", { ascending: false })
        .limit(3);

      if (data.scope === "daerah" && data.daerah_slug) {
        relQuery = relQuery.eq("daerah_slug", data.daerah_slug);
      }

      const { data: rel } = await relQuery;
      setRelated(rel || []);
    } catch (err) {
      console.error("Error loading kabar:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
    // Scroll ke atas setiap kali ganti berita
    window.scrollTo(0, 0);
  }, [loadData]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center animate-pulse">
        <div className="h-8 w-48 bg-slate-200 mx-auto rounded mb-4" />
        <p className="text-muted-foreground">Memuat Berita...</p>
      </div>
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

  return (
    <article className="pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* ===== BREADCRUMB ===== */}
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary transition">
            Beranda
          </Link>
          <span>/</span>
          <Link
            to={`/kabar/${scope}`}
            className="capitalize hover:text-primary transition"
          >
            {scope}
          </Link>
          {artikel.scope === "daerah" && (
            <>
              <span>/</span>
              <span className="text-foreground font-medium">
                {artikel.daerah}
              </span>
            </>
          )}
        </nav>

        {/* ===== COVER ===== */}
        {artikel.cover && (
          <div className="relative group overflow-hidden rounded-2xl mb-8">
            <img
              src={artikel.cover}
              alt={artikel.title}
              className="w-full h-[300px] md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <time>
            {artikel.publish_at &&
              new Date(artikel.publish_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
          </time>
          {artikel.admins && artikel.admins.length > 0 && (
            <>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>
                oleh{" "}
                <span className="text-foreground font-medium">
                  {artikel.admins[0].name}
                </span>
              </span>
            </>
          )}
        </div>

        {/* ===== TITLE ===== */}
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-8 leading-tight">
          {artikel.title}
        </h1>

        {/* ===== CONTENT ===== */}
        <div
          className="prose prose-neutral max-w-none 
          prose-headings:font-display prose-headings:font-bold
          prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-lg
          prose-img:rounded-2xl prose-img:shadow-xl
          prose-blockquote:border-l-4 prose-blockquote:border-emerald-600 prose-blockquote:bg-emerald-50 prose-blockquote:py-2 prose-blockquote:pr-4
          prose-li:marker:text-emerald-600"
          dangerouslySetInnerHTML={{ __html: artikel.content }}
        />

        {/* ===== RELATED ===== */}
        {related.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-bold">
                Berita Terkait
              </h3>
              <Link
                to={
                  artikel.scope === "daerah" ? "/kabar/daerah" : "/kabar/jatim"
                }
                className="text-sm text-emerald-600 font-bold hover:underline"
              >
                Lihat semua →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={
                    item.scope === "daerah"
                      ? `/kabar/daerah/${item.daerah_slug}/${item.slug}`
                      : `/kabar/jatim/${item.slug}`
                  }
                  className="group flex flex-col"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-xl mb-3">
                    {item.cover ? (
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">
                    {item.display_date}
                  </p>
                  <h4 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-emerald-600 transition">
                    {item.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default KabarDetail;
