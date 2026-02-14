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
  categories: Category[] | Category | null;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  category: Category | null; // ← normalized
};

export default function Kajian() {
  const { categorySlug } = useParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const title = activeCategory?.name ?? categorySlug;
  const getExcerpt = (html: string, max = 120) => {
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > max ? text.slice(0, max) + "…" : text;
  };

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name,slug")
        .order("name");

      setCategories((data as Category[]) || []);
    };

    fetchCategories();
  }, []);

  // FETCH ARTICLES
  useEffect(() => {
    const fetchArticles = async () => {
      let query = supabase
        .from("articles")
        .select(
          `
          id,
          title,
          slug,
          cover_url,
          content,
          publish_at,
          categories!inner (
            id,
            name,
            slug
          )
        `,
        )

        .eq("published", true)
        .order("created_at", { ascending: false });

      if (categorySlug) {
        query = query.eq("categories.slug", categorySlug);
      }

      const { data } = await query;

      if (!data) return;

      const rows = data as ArticleRow[];

      const normalized: Article[] = rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        cover_url: r.cover_url,
        publish_at: r.publish_at,
        category: Array.isArray(r.categories)
          ? (r.categories[0] ?? null)
          : (r.categories ?? null),
        content: r.content,
      }));

      setArticles(normalized);
    };

    fetchArticles();
  }, [categorySlug]);

  return (
    <section className="pt-24 pb-24 bg-cream islamic-pattern">
      <div className="container mx-auto py-12">
        {/* TITLE */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 text-center">
          {categorySlug ? `Kajian ${title}` : "Kajian IKADI"}
        </h2>

        <div className="gold-divider mx-auto mb-8" />

        {/* TAB FILTER */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <Link
            to="/kajian"
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !categorySlug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            Semua
          </Link>

          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/kajian/${c.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                categorySlug === c.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="grid lg:grid gap-10">
          {/* SIDEBAR */}
          {/* <aside>
            <div className="bg-white rounded-xl border p-4">
              <div className="font-bold mb-3">Kategori</div>

              <div className="space-y-2">
                <Link to="/kajian" className="block text-sm hover:text-primary">
                  Semua
                </Link>

                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/kajian/${c.slug}`}
                    className="block text-sm hover:text-primary"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside> */}

          {/* GRID */}
          {/* GRID */}
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-emerald-700 font-display font-bold text-lg mb-2">
                Belum ada kajian pada kategori ini
              </div>
              <div className="text-muted-foreground text-sm">
                Silakan kembali lagi nanti.
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((a) => (
                <div
                  key={a.id}
                  className="
          flex flex-col
          bg-white rounded-2xl
          border border-border/60
          shadow-sm
          hover:shadow-lg hover:border-gold/30
          transition-all duration-300
          overflow-hidden
        "
                >
                  {/* COVER */}
                  {a.cover_url ? (
                    <img
                      src={a.cover_url}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-700 font-display text-lg px-6 text-center">
                        {a.title}
                      </span>
                    </div>
                  )}

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* TOP META */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-xs text-muted-foreground">
                        {new Date(a.publish_at).toLocaleDateString()}
                      </div>

                      {a.category && (
                        <span className="text-xs px-2 py-1 rounded bg-emerald-light text-emerald-dark">
                          {a.category.name}
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <div className="font-display font-semibold mb-2 line-clamp-2">
                      {a.title}
                    </div>

                    {/* EXCERPT */}
                    <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {getExcerpt(a.content)}
                    </div>

                    {/* READ MORE */}
                    <div className="mt-auto">
                      <Link
                        to={`/kajian/${a.category?.slug}/${a.slug}`}
                        className="text-sm font-medium text-emerald-700 hover:text-gold transition inline-flex items-center gap-1"
                      >
                        Baca Selengkapnya →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
