import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { SearchX, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ================= TYPES ================= */
type Category = {
  id: string;
  name: string;
  slug: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  scope: "jatim" | "daerah";
  daerah: string | null;
  category: Category;
};

interface SupabaseArticleRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  scope: "jatim" | "daerah";
  daerah: string | null;
  categories: Category | Category[] | null;
}

const PAGE_SIZE = 6;

export default function Kajian() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getExcerpt = (html: string, max = 120) => {
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > max ? text.slice(0, max) + "…" : text;
  };

  /* ================= DEBOUNCE SEARCH ================= */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name,slug")
      .order("name")
      .then(({ data }) => setCategories((data as Category[]) || []));
  }, []);

  /* ================= FETCH DATA (OPTIMIZED) ================= */
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const isFiltering = !!categorySlug && categorySlug !== "semua";
      const relation = isFiltering
        ? "categories!inner(id, name, slug)"
        : "categories(id, name, slug)";

      let query = supabase
        .from("articles")
        .select(
          `
          id, title, slug, content, cover_url, publish_at, scope, daerah,
          ${relation}
        `,
          { count: "exact" },
        )
        .eq("published", true);

      if (isFiltering) query = query.eq("categories.slug", categorySlug);
      if (debouncedSearch) query = query.ilike("title", `%${debouncedSearch}%`);

      const { data, count, error } = await query
        .order("publish_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const rawData = data as unknown as SupabaseArticleRow[];
      const normalized: Article[] = (rawData || []).map((item) => {
        const cat = Array.isArray(item.categories)
          ? item.categories[0]
          : item.categories;
        return {
          ...item,
          category: {
            id: cat?.id || "default",
            name: cat?.name || "Umum",
            slug: cat?.slug && cat.slug !== "undefined" ? cat.slug : "umum",
          },
        };
      });

      setArticles(normalized);
      setTotal(count || 0);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, debouncedSearch, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    setPage(1);
  }, [categorySlug, debouncedSearch]);

  const getSmartPages = (current: number, total: number) => {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  return (
    <section className="pt-24 pb-24 md:pt-32 bg-background islamic-pattern min-h-screen">
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <header className="text-center mb-14 md:mb-16 lg:mb-20 mt-6">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            {categorySlug
              ? `Kajian ${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}`
              : "Semua Kajian"}
          </h1>
          <div className="gold-divider mx-auto mb-8" />

          {/* SEARCH */}
          <div className="max-w-md mx-auto mb-8">
            <input
              placeholder="Cari judul kajian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 rounded-full border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* CATEGORY TABS */}
          <nav className="flex flex-wrap gap-2 justify-center">
            <Link
              to="/kajian"
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                !categorySlug
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Semua
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/kajian/${c.slug}`}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  categorySlug === c.slug
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </header>

        {/* GRID CONTENT */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-card rounded-2xl border border-border h-[420px] overflow-hidden"
              >
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
            <SearchX className="w-16 h-16 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-xl font-semibold">Tidak ditemukan hasil</h3>
            <p className="text-muted-foreground mt-2 text-center max-w-xs">
              Maaf, kami tidak menemukan kajian untuk filter ini. Coba kata
              kunci atau kategori lain.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => navigate("/kajian")}
            >
              Lihat Semua Kajian
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((a) => (
                <article
                  key={a.id}
                  className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {a.cover_url ? (
                      <img
                        src={a.cover_url}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-6 text-center text-primary font-display bg-emerald-100/50">
                        {a.title}
                      </div>
                    )}

                    {/* POJOK KIRI: SCOPE BADGE */}
                    <div className="absolute top-4 left-4 z-20">
                      <span
                        className={`text-[9px] md:text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded shadow-md text-white ${
                          a.scope === "jatim" ? "bg-gold" : "bg-emerald-700"
                        }`}
                      >
                        {a.scope === "jatim" ? "IKADI Jatim" : `PD ${a.daerah}`}
                      </span>
                    </div>

                    {/* POJOK KANAN: CATEGORY BADGE */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded bg-white/90 text-primary shadow-sm backdrop-blur-sm border border-black/5">
                        {a.category.name}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent z-10" />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <time className="text-xs text-muted-foreground mb-3 block">
                      {new Date(a.publish_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>

                    <h3 className="text-lg font-display font-bold mb-3 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                      {getExcerpt(a.content)}
                    </p>

                    <Link
                      to={`/kajian/${a.category.slug}/${a.slug}`}
                      className="mt-auto inline-flex items-center text-sm font-bold text-primary hover:text-gold transition-colors"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-16 gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-full border bg-card hover:bg-muted disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {getSmartPages(page, totalPages).map((p, i) => (
                    <button
                      key={i}
                      disabled={p === "..."}
                      onClick={() => typeof p === "number" && setPage(p)}
                      className={`min-w-[40px] h-[40px] rounded-lg border font-medium transition-all ${
                        page === p
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                          : "bg-card border-border hover:bg-muted"
                      } ${p === "..." ? "border-transparent bg-transparent cursor-default" : ""}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-full border bg-card hover:bg-muted disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
