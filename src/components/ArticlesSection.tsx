import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const articles = [
  {
    title: "Menjadi Da'i yang Relevan di Era Milenial",
    excerpt:
      "Bagaimana seorang da'i bisa tetap relevan dan menyampaikan pesan Islam yang menyejukkan kepada generasi muda?",
    date: "28 Januari 2026",
  },
  {
    title: "Dakwah Rahmatan Lil 'Alamin: Prinsip dan Praktik",
    excerpt:
      "Memahami konsep dakwah yang membawa rahmat bagi seluruh alam dan bagaimana menerapkannya dalam kehidupan sehari-hari.",
    date: "15 Januari 2026",
  },
  {
    title: "Membangun Masjid Sebagai Pusat Peradaban",
    excerpt:
      "Masjid bukan hanya tempat ibadah, tetapi juga pusat pendidikan, sosial, dan pemberdayaan masyarakat.",
    date: "3 Januari 2026",
  },
];

const ArticlesSection = () => {
  return (
    <section
      id="artikel"
      className="py-20 md:py-24 lg:py-28 bg-cream islamic-pattern"
    >
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-14 md:mb-16 lg:mb-20 animate-on-scroll">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Artikel & Materi Dakwah
          </h2>

          <div className="gold-divider mx-auto mb-4" />

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Bacaan inspiratif dan materi dakwah untuk memperluas wawasan.
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-6xl xl:max-w-7xl mx-auto mb-12">
          {articles.map((article, i) => (
            <article
              key={article.title}
              className="
                animate-on-scroll
                bg-card rounded-2xl
                p-6 md:p-7 lg:p-8
                border border-border
                hover:border-gold/30 hover:shadow-xl
                transition-all duration-300
                group
              "
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              {/* DATE */}
              <p className="text-xs md:text-sm text-muted-foreground mb-3">
                {article.date}
              </p>

              {/* TITLE */}
              <h3 className="font-display font-semibold text-foreground mb-3 leading-snug text-base md:text-lg lg:text-xl">
                {article.title}
              </h3>

              {/* EXCERPT */}
              <p className="text-sm md:text-base text-muted-foreground mb-5 leading-relaxed">
                {article.excerpt}
              </p>

              {/* LINK */}
              <a
                href="#"
                className="inline-flex items-center text-sm md:text-base font-medium text-primary hover:underline"
              >
                Baca Selengkapnya
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-on-scroll">
          <Button
            variant="outline"
            size="lg"
            className="border-gold/40 text-gold hover:bg-gold-light"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Materi Khutbah
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
