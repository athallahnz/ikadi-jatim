import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useParams } from "react-router-dom";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  category: Category | null;
};

type Article = ArticleRow;

const PAGE_SIZE = 6;

export default function Kajian() {
  const { categorySlug } = useParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const title = activeCategory?.name ?? categorySlug;

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

  /* ================= FETCH ARTICLES ================= */
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      /* ===== DATA QUERY ===== */
      let dataQuery = supabase
        .from("articles")
        .select(
          `
      id,
      title,
      slug,
      cover_url,
      content,
      publish_at,
      category:categories (
        id,
        name,
        slug
      )
    `,
        )
        .eq("published", true);

      if (categorySlug) dataQuery = dataQuery.eq("category.slug", categorySlug);
      if (debouncedSearch)
        dataQuery = dataQuery.ilike("title", `%${debouncedSearch}%`);

      const { data, error } = await dataQuery
        .order("publish_at", { ascending: false })
        .range(from, to);

      /* ===== COUNT QUERY ===== */
      let countQuery = supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("published", true);

      if (categorySlug) {
        const cat = categories.find((c) => c.slug === categorySlug);
        if (cat) countQuery = countQuery.eq("category_id", cat.id);
      }

      if (debouncedSearch)
        countQuery = countQuery.ilike("title", `%${debouncedSearch}%`);

      const { count } = await countQuery;
      if (error) {
        console.error(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setArticles([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      setArticles(data as unknown as Article[]);
      setTotal(count || 0);
      setLoading(false);
    };

    fetchArticles();
  }, [categories, categorySlug, debouncedSearch, page]);

  /* RESET PAGE WHEN FILTER */
  useEffect(() => {
    setPage(1);
  }, [categorySlug, debouncedSearch]);

  /* ================= PAGINATION RANGE ================= */

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
    <section className="pt-24 pb-24 md:pt-28 bg-background islamic-pattern overflow-hidden">
      <div className="container">
        <div className="container mx-auto pt-12 px-6 mb-16 text-center">
          {/* TITLE */}
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {categorySlug ? `Kajian ${title}` : "Kajian IKADI"}
          </h2>

          <div className="gold-divider mx-auto mb-8" />

          {/* SEARCH */}
          <div className="max-w-md mx-auto mb-8">
            <input
              placeholder="Cari kajian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-border bg-background shadow-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* TAB FILTER */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            <Link
              to="/kajian"
              className={`px-4 py-2 rounded-full text-sm ${
                !categorySlug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Semua
            </Link>

            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/kajian/${c.slug}`}
                className={`px-4 py-2 rounded-full text-sm ${
                  categorySlug === c.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
        {/* GRID */}
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-44 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-primary font-display font-bold text-lg mb-2">
              Tidak ditemukan
            </div>
            <div className="text-muted-foreground text-sm">
              Coba kata kunci lain.
            </div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  {a.cover_url ? (
                    <img
                      src={a.cover_url}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-muted flex items-center justify-center">
                      <span className="text-primary font-display text-lg px-6 text-center">
                        {a.title}
                      </span>
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between mb-2">
                      <div className="text-xs text-muted-foreground">
                        {new Date(a.publish_at).toLocaleDateString()}
                      </div>
                      {a.category && (
                        <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent-foreground">
                          {a.category.name}
                        </span>
                      )}
                    </div>

                    <div className="font-display font-semibold mb-2 line-clamp-2">
                      {a.title}
                    </div>

                    <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {getExcerpt(a.content)}
                    </div>

                    <div className="mt-auto">
                      <Link
                        to={`/kajian/${a.category?.slug}/${a.slug}`}
                        className="text-sm font-medium text-primary hover:text-accent transition"
                      >
                        Baca Selengkapnya →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-10 gap-2">
                {/* PREV */}
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded bg-backgroundg-white disabled:opacity-40"
                >
                  Prev
                </button>

                {/* NUMBERS */}
                {getSmartPages(page, totalPages).map((p, i) => {
                  const key = typeof p === "number" ? `page-${p}` : `dots-${i}`;

                  if (p === "...") {
                    return (
                      <span key={key} className="px-2 text-muted-foreground">
                        …
                      </span>
                    );
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => typeof p === "number" && setPage(p)}
                      className={`px-3 py-1 rounded border border-border ${
                        page === p
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                {/* NEXT */}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border bg-background disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
