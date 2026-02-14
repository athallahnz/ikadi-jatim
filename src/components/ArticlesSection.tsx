import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Definisi tipe data yang lebih ketat
type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  categories: {
    name: string;
    slug: string;
  } | null;
};

interface SupabaseArticleRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  categories:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
}

const ArticlesSection = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const getExcerpt = (html: string, max = 120) => {
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > max ? text.slice(0, max) + "…" : text;
  };

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("articles")
          .select(
            `
            id, title, slug, cover_url, content, publish_at,
            categories ( name, slug )
          `,
          )
          .eq("published", true)
          .order("publish_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        const rawData = data as unknown as SupabaseArticleRow[];
        const normalized: Article[] = rawData.map((item) => ({
          ...item,
          categories: Array.isArray(item.categories)
            ? item.categories[0]
            : item.categories,
        }));

        setArticles(normalized);
      } catch (err) {
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestArticles();
  }, []);

  return (
    <section
      id="artikel"
      className="py-20 md:py-24 lg:py-28 bg-cream islamic-pattern relative z-10"
    >
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-14 md:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Kajian & Artikel Dakwah
          </h2>
          <div className="gold-divider mx-auto mb-4" />
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Bacaan inspiratif dan materi dakwah untuk memperluas wawasan
            keislaman Anda.
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-6xl xl:max-w-7xl mx-auto mb-12">
          {loading ? (
            // SKELETON LOADER
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-white rounded-2xl overflow-hidden border border-border shadow-sm h-[400px]"
              >
                <div className="h-48 bg-slate-200 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-200 animate-pulse w-1/2 rounded" />
                  <div className="h-6 bg-slate-200 animate-pulse w-full rounded" />
                  <div className="h-20 bg-slate-200 animate-pulse w-full rounded" />
                </div>
              </div>
            ))
          ) : articles.length > 0 ? (
            articles.map((article, i) => (
              <article
                key={article.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/30 hover:shadow-xl transition-all duration-300 group flex flex-col shadow-sm"
              >
                {/* IMAGE COVER */}
                <div className="relative h-48 overflow-hidden bg-emerald-50">
                  {article.cover_url ? (
                    <img
                      src={article.cover_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-800 font-display p-6 text-center text-sm">
                      {article.title}
                    </div>
                  )}
                  {article.categories && (
                    <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-white/90 text-primary shadow-sm z-20">
                      {article.categories.name}
                    </span>
                  )}
                </div>

                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">
                    {new Date(article.publish_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <h3 className="font-display font-semibold text-foreground mb-3 leading-snug text-base md:text-lg lg:text-xl line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed line-clamp-3">
                    {getExcerpt(article.content)}
                  </p>

                  <Link
                    to={`/kajian/${article.categories?.slug || "umum"}/${article.slug}`}
                    className="mt-auto inline-flex items-center text-sm font-medium text-emerald-700 hover:text-gold transition-colors"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            // EMPTY STATE (Jika database kosong)
            <div className="col-span-full text-center py-10 bg-white/50 rounded-2xl border border-dashed">
              <p className="text-muted-foreground italic">
                Belum ada artikel yang diterbitkan.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/kajian">
            <Button
              variant="outline"
              size="lg"
              className="border-gold/40 text-gold hover:bg-gold-light transition-all"
            >
              <Download className="mr-2 h-5 w-5" />
              Lihat Semua Kajian
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
