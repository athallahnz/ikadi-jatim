import { useParams, Link } from "react-router-dom";
import { kabarData } from "@/data/kabar";
import { Button } from "@/components/ui/button";

const KabarDetail = () => {
  const { scope, daerah, slug } = useParams();

  const artikel = kabarData.find((k) => {
    if (scope === "daerah") {
      return k.scope === "daerah" && k.daerahSlug === daerah && k.slug === slug;
    }
    return k.scope === "jatim" && k.slug === slug;
  });

  if (!artikel) {
    return (
      <div className="pt-32 pb-24 text-center">
        <p>Artikel tidak ditemukan</p>
      </div>
    );
  }

  const related = kabarData
    .filter(
      (k) =>
        k.id !== artikel.id &&
        k.scope === artikel.scope &&
        (artikel.scope !== "daerah" || k.daerahSlug === artikel.daerahSlug),
    )
    .slice(0, 3);

  return (
    <article className="pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* BREADCRUMB */}
        <div className="text-sm text-muted-foreground mb-4">
          <span>Kabar</span>
          {" / "}
          <span className="capitalize">{scope}</span>
          {artikel.scope === "daerah" && (
            <>
              {" / "}
              <span>{artikel.daerah}</span>
            </>
          )}
        </div>

        {/* COVER */}
        <img
          src={artikel.cover}
          alt={artikel.title}
          className="w-full h-80 object-cover rounded-xl mb-8"
        />

        {/* META */}
        <p className="text-sm text-muted-foreground mb-2">
          {new Date(artikel.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* TITLE */}
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">
          {artikel.title}
        </h1>

        {/* DAERAH */}
        {artikel.scope === "daerah" && (
          <p className="text-sm text-muted-foreground mb-6">
            PD IKADI {artikel.daerah}
          </p>
        )}

        {/* CONTENT */}
        <div
          className="
            prose prose-neutral max-w-none
            prose-p:leading-relaxed
            prose-img:rounded-xl
            prose-img:shadow-md
            prose-blockquote:border-l-4
            prose-blockquote:border-primary
            prose-blockquote:pl-4
            prose-blockquote:italic
            prose-li:marker:text-primary
          "
          dangerouslySetInnerHTML={{ __html: artikel.content }}
        />

        {/* RELATED */}
        {/* RELATED */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-semibold">
                Berita Terkait
              </h3>

              {/* Lihat semua */}
              <Link
                to={
                  artikel.scope === "daerah" ? `/kabar/daerah` : `/kabar/jatim`
                }
                className="text-sm text-primary font-medium hover:underline"
              >
                Lihat semua
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {related.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition group"
                >
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="h-40 w-full object-cover group-hover:scale-105 transition"
                  />

                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      {item.displayDate}
                    </p>

                    <p className="text-sm font-semibold line-clamp-2 mb-4">
                      {item.title}
                    </p>

                    {/* BUTTON */}
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition"
                    >
                      <Link
                        to={
                          item.scope === "daerah"
                            ? `/kabar/daerah/${item.daerahSlug}/${item.slug}`
                            : `/kabar/jatim/${item.slug}`
                        }
                      >
                        Baca Selengkapnya
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default KabarDetail;
