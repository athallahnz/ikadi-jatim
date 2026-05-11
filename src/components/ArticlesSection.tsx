import { Link } from "react-router-dom";

import { ArrowRight, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";

/* ================= TYPES ================= */

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  scope: "jatim" | "daerah";
  daerah: string | null;
  categories: {
    name: string;
    slug: string;
  } | null;
};

interface ArticlesSectionProps {
  articles?: Article[];
}

const ArticlesSection: React.FC<ArticlesSectionProps> = ({ articles = [] }) => {
  const loading = articles.length === 0;

  const getExcerpt = (html: string, max = 120) => {
    const text = html.replace(/<[^>]+>/g, "");

    return text.length > max ? text.slice(0, max) + "…" : text;
  };

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
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-white rounded-2xl overflow-hidden border border-border shadow-sm h-[420px]"
              >
                <Skeleton className="h-48 w-full rounded-none" />

                <div className="p-6 space-y-4">
                  <Skeleton className="h-4 w-24" />

                  <Skeleton className="h-7 w-full" />

                  <Skeleton className="h-20 w-full" />

                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <article
                key={article.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/30 hover:shadow-xl transition-all duration-300 group flex flex-col shadow-sm hover:-translate-y-1"
              >
                {/* IMAGE */}

                <div className="relative h-48 overflow-hidden bg-emerald-50">
                  {article.cover_url ? (
                    <img
                      src={article.cover_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-800 font-display p-6 text-center text-sm bg-emerald-100/50">
                      {article.title}
                    </div>
                  )}

                  {/* SCOPE */}

                  <div className="absolute top-4 left-4 z-20">
                    <span
                      className={`text-[9px] md:text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded shadow-md text-white ${
                        article.scope === "jatim" ? "bg-gold" : "bg-emerald-700"
                      }`}
                    >
                      {article.scope === "jatim"
                        ? "IKADI Jatim"
                        : `PD ${article.daerah}`}
                    </span>
                  </div>

                  {/* CATEGORY */}

                  {article.categories && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded bg-white/90 text-primary shadow-sm backdrop-blur-sm border border-black/5">
                        {article.categories.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent z-10" />
                </div>

                {/* CONTENT */}

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
                    className="mt-auto inline-flex items-center text-sm font-bold text-emerald-700 hover:text-gold transition-colors group/link"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white/50 rounded-2xl border border-dashed border-muted-foreground/30">
              <p className="text-muted-foreground italic">
                Belum ada artikel yang diterbitkan untuk saat ini.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}

        <div className="text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-gold/40 text-gold hover:bg-gold hover:text-white transition-all duration-300 rounded-full px-8"
          >
            <Link to="/kajian">
              <Download className="mr-2 h-5 w-5" />
              Lihat Semua Kajian
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
