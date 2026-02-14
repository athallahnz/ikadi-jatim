import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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

export default function KajianDetail() {
  const { slug } = useParams();

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);

  // ================= FETCH ARTICLE =================
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

  // ================= FETCH RELATED =================
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

  if (!article)
    return <div className="container mx-auto py-10">Loading...</div>;

  return (
    <section className="pt-24 pb-24 bg-cream islamic-pattern">
      <div className="container mx-auto py-12">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12">
          {/* MAIN */}
          <div className="max-w-3xl">
            {/* BREADCRUMB */}
            <div className="text-sm text-muted-foreground mb-4">
              <Link to="/kajian" className="hover:underline">
                Kajian
              </Link>
              /
              {article.category && (
                <Link
                  to={`/kajian/${article.category.slug}`}
                  className="hover:underline ml-1"
                >
                  {article.category.name}
                </Link>
              )}
            </div>

            {/* TITLE */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              {article.title}
            </h2>

            <div className="gold-divider mb-6" />

            {/* DATE */}
            <div className="text-sm text-muted-foreground mb-6">
              {new Date(article.created_at).toLocaleDateString()}
            </div>

            {/* COVER */}
            {article.cover_url && (
              <img
                src={article.cover_url}
                className="w-full h-80 object-cover rounded-xl mb-8"
              />
            )}

            {/* CONTENT */}
            <div
              className="
                prose max-w-none
                prose-headings:font-display
                prose-p:text-foreground
                prose-a:text-primary
                prose-strong:text-foreground
                prose-blockquote:border-emerald-dark
                prose-blockquote:text-emerald-dark
              "
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border p-5">
              <div className="font-display font-semibold mb-4">
                Kajian Terkait
              </div>

              {related.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Tidak ada kajian terkait
                </div>
              ) : (
                <div className="space-y-4">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/kajian/${r.category?.slug}/${r.slug}`}
                      className="flex gap-3 group"
                    >
                      {r.cover_url ? (
                        <img
                          src={r.cover_url}
                          className="w-20 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-16 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-display text-center px-1">
                          Kajian
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="text-sm font-medium leading-snug group-hover:text-emerald-700 transition line-clamp-2">
                          {r.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
