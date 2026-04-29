import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ================= TYPES ================= */
type Category = { id: string; name: string; slug: string };

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  category: Category;
};

interface SupabaseArticleRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  categories: Category | Category[] | null;
}

/* ================= COMPONENT ================= */
const ArticlesSection = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. REFACTOR: Fungsi utilitas ekstraksi teks (Mencegah pengulangan)
  const getExcerpt = useCallback((html: string, max = 120) => {
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > max ? text.slice(0, max) + "…" : text;
  }, []);

  // 2. REFACTOR: Fungsi Normalisasi Data (Terpisah dari Fetch)
  const normalizeArticles = (rawData: SupabaseArticleRow[]): Article[] => {
    return rawData.map((item) => {
      const rawCat = Array.isArray(item.categories)
        ? item.categories[0]
        : item.categories;

      return {
        ...item,
        category: {
          id: rawCat?.id ?? "default",
          name: rawCat?.name ?? "Umum",
          slug:
            rawCat?.slug && rawCat.slug !== "undefined" ? rawCat.slug : "umum",
        },
      };
    });
  };

  /* 3. REFACTOR: Fetch Categories */
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");
      if (data) setCategories(data as Category[]);
    };
    fetchCategories();
  }, []);

  /* 4. REFACTOR: Fetch Articles dengan Query Builder Logic */
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);

      // Gunakan !inner hanya jika filter kategori aktif (Optimasi Join)
      const isFiltering = categorySlug && categorySlug !== "semua";
      const relation = isFiltering
        ? "categories!inner(id, name, slug)"
        : "categories(id, name, slug)";

      let query = supabase
        .from("articles")
        .select(`id, title, slug, content, cover_url, publish_at, ${relation}`)
        .eq("published", true)
        .order("publish_at", { ascending: false });

      // Apply Filters
      if (isFiltering) {
        query = query.eq("categories.slug", categorySlug);
      } else {
        query = query.limit(3); // Default limit untuk Landing Page
      }

      const { data, error } = await query;
      if (error) throw error;

      setArticles(normalizeArticles(data as unknown as SupabaseArticleRow[]));
    } catch (err) {
      console.error("Kajian Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  /* ================= RENDER HELPERS ================= */
  const renderSkeleton = () =>
    [...Array(3)].map((_, i) => (
      <div
        key={i}
        className="flex flex-col bg-card rounded-2xl border border-border h-[420px] animate-pulse"
      >
        <div className="h-48 bg-muted" />
        <div className="p-6 space-y-4">
          <div className="h-4 bg-muted w-1/3 rounded" />
          <div className="h-6 bg-muted w-full rounded" />
        </div>
      </div>
    ));

  return (
    <section
      id="artikel"
      className="py-20 bg-background islamic-pattern relative z-10"
    >
      <div className="container mx-auto px-6">
        <header className="text-center mb-14">
          <h2 className="text-2xl md:text-5xl font-display font-bold text-foreground mb-4">
            Kajian & Artikel Dakwah
          </h2>
          <div className="gold-divider mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bacaan inspiratif untuk memperluas wawasan keislaman Anda.
          </p>
        </header>

        {/* REFACTOR: Filter UI dengan State URL yang Sinkron */}
        {categories.length > 0 && categorySlug && (
          <nav className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <Button
              variant={
                !categorySlug || categorySlug === "semua"
                  ? "default"
                  : "outline"
              }
              onClick={() => navigate("/kajian")}
              className="rounded-full px-6 shadow-sm"
            >
              Semua
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={categorySlug === cat.slug ? "default" : "outline"}
                onClick={() => navigate(`/kajian/${cat.slug}`)}
                className="rounded-full px-6 shadow-sm"
              >
                {cat.name}
              </Button>
            ))}
          </nav>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {loading ? (
            renderSkeleton()
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <article
                key={article.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/50 hover:shadow-xl transition-all duration-300 group flex flex-col shadow-sm"
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  {article.cover_url ? (
                    <img
                      src={article.cover_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-display p-6 text-center text-sm bg-primary/5">
                      {article.title}
                    </div>
                  )}
                  <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded bg-background/95 text-primary border border-border">
                    {article.category.name}
                  </span>
                </div>

                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <time className="text-xs text-muted-foreground mb-3 font-medium">
                    {new Date(article.publish_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <h3 className="font-display font-semibold text-foreground mb-3 leading-snug text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed line-clamp-3">
                    {getExcerpt(article.content)}
                  </p>
                  <Link
                    to={`/kajian/${article.category.slug}/${article.slug}`}
                    className="mt-auto inline-flex items-center text-sm font-semibold text-primary hover:text-gold transition-colors"
                  >
                    Baca Selengkapnya <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <SearchX className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground italic">
                Belum ada artikel tersedia untuk kategori ini.
              </p>
            </div>
          )}
        </div>

        {!categorySlug && (
          <footer className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-gold text-gold hover:bg-gold hover:text-white"
              asChild
            >
              <Link to="/kajian">
                <BookOpen className="mr-2 h-5 w-5" /> Lihat Semua Kajian
              </Link>
            </Button>
          </footer>
        )}
      </div>
    </section>
  );
};

export default ArticlesSection;
