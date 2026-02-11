import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const articles = [
  {
    title: "Menjadi Da'i yang Relevan di Era Milenial",
    excerpt: "Bagaimana seorang da'i bisa tetap relevan dan menyampaikan pesan Islam yang menyejukkan kepada generasi muda?",
    date: "28 Januari 2026",
  },
  {
    title: "Dakwah Rahmatan Lil 'Alamin: Prinsip dan Praktik",
    excerpt: "Memahami konsep dakwah yang membawa rahmat bagi seluruh alam dan bagaimana menerapkannya dalam kehidupan sehari-hari.",
    date: "15 Januari 2026",
  },
  {
    title: "Membangun Masjid Sebagai Pusat Peradaban",
    excerpt: "Masjid bukan hanya tempat ibadah, tetapi juga pusat pendidikan, sosial, dan pemberdayaan masyarakat.",
    date: "3 Januari 2026",
  },
];

const ArticlesSection = () => {
  return (
    <section id="artikel" className="py-24 bg-cream islamic-pattern">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Artikel & Materi Dakwah
          </h2>
          <div className="gold-divider mx-auto mb-4" />
          <p className="text-muted-foreground">Bacaan inspiratif dan materi dakwah untuk memperluas wawasan.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {articles.map((article, i) => (
            <div
              key={article.title}
              className="animate-on-scroll bg-card rounded-xl p-6 border border-border hover:border-gold/30 hover:shadow-lg transition-all"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <p className="text-xs text-muted-foreground mb-3">{article.date}</p>
              <h3 className="font-display font-semibold text-foreground mb-2 leading-snug">{article.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{article.excerpt}</p>
              <a href="#" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                Baca Selengkapnya <ArrowRight className="ml-1 h-3 w-3" />
              </a>
            </div>
          ))}
        </div>

        <div className="text-center animate-on-scroll">
          <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold-light">
            <Download className="mr-2 h-4 w-4" />
            Download Materi Khutbah
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
