import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Users, Calendar, Folder } from "lucide-react";

export type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string;
};

export type EventItem = {
  id: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  date: string | null;
  display_date: string | null;
  slug: string;
  scope: string;
  daerah: string | null;
  daerah_slug: string | null;
};

interface HeroSlideItem {
  id: string;
  title: string;
  imageUrl: string;
  type: "event" | "gallery";
  subtitle: string;
  url: string;
  excerpt: string | null; // Tambahkan tipe untuk excerpt
}

interface HeroSectionProps {
  events?: EventItem[];
  galleries?: GalleryItem[];
}

const HeroSection: React.FC<HeroSectionProps> = ({
  events = [],
  galleries = [],
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // 3. Transformasi dan penggabungan data
  const slides: HeroSlideItem[] = [
    ...events
      .filter((e) => e.cover && e.title)
      .map((e) => ({
        id: e.id,
        title: e.title,
        imageUrl: e.cover as string,
        type: "event" as const,
        subtitle: e.display_date || e.daerah || "Event Terbaru",
        // LOGIKA URL BARU DI SINI:
        url:
          e.scope === "daerah"
            ? `/kabar/daerah/${e.daerah_slug}/${e.slug}`
            : `/kabar/jatim/${e.slug}`,
        excerpt: e.excerpt,
      })),
    ...galleries
      .filter((g) => g.image_url && g.title)
      .map((g) => ({
        id: g.id,
        title: g.title,
        imageUrl: g.image_url,
        type: "gallery" as const,
        subtitle: g.category || "Galeri",
        url: `/galeri`, // URL statis untuk galeri, bisa diarahkan ke halaman galeri utama
        excerpt: null,
      })),
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Fallback / Loading State dengan Skeleton UI yang mereplika layout akhir
  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[clamp(600px,100vh,900px)] flex flex-col justify-end overflow-hidden bg-background">
        {/* Background Base */}
        <div className="absolute inset-0 bg-muted/50" />

        {/* Gradient Overlay (Menggunakan var background agar adaptif Light/Dark mode) */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent z-[1]" />

        <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16 pb-28 pt-32 h-full flex flex-col justify-end items-start text-left max-w-7xl">
          {/* Skeleton Badge */}
          <div className="relative overflow-hidden h-8 w-36 bg-secondary rounded-full mb-6 border border-border">
            <div className="absolute inset-0 shimmer-effect" />
          </div>

          {/* Skeleton Title (2 Baris) */}
          <div className="relative overflow-hidden h-12 sm:h-16 md:h-20 w-full max-w-3xl bg-secondary/80 rounded-xl mb-3">
            <div className="absolute inset-0 shimmer-effect" />
          </div>
          <div className="relative overflow-hidden h-12 sm:h-16 md:h-20 w-3/4 max-w-2xl bg-secondary/80 rounded-xl mb-8">
            <div className="absolute inset-0 shimmer-effect" />
          </div>

          {/* Skeleton Excerpt (2 Baris) */}
          <div className="relative overflow-hidden h-5 md:h-6 w-full max-w-2xl bg-border/60 rounded-md mb-3">
            <div className="absolute inset-0 shimmer-effect" />
          </div>
          <div className="relative overflow-hidden h-5 md:h-6 w-5/6 max-w-2xl bg-border/60 rounded-md mb-10">
            <div className="absolute inset-0 shimmer-effect" />
          </div>

          {/* Skeleton Buttons */}
          <div className="flex flex-wrap gap-4 justify-start mt-2 w-full">
            <div className="relative overflow-hidden h-16 w-52 bg-primary/20 rounded-md border border-primary/10">
              <div className="absolute inset-0 shimmer-effect" />
            </div>
            <div className="relative overflow-hidden h-16 w-44 bg-transparent rounded-md border border-border">
              <div className="absolute inset-0 shimmer-effect" />
            </div>
            <div className="relative overflow-hidden h-16 w-48 bg-accent/20 rounded-md border border-accent/30">
              <div className="absolute inset-0 shimmer-effect" />
            </div>
          </div>
        </div>

        {/* Skeleton Carousel Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
          <div className="h-2 w-8 bg-muted-foreground/30 rounded-full" />
          <div className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
          <div className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
        </div>
      </section>
    );
  }

  const activeItem = slides[currentSlide];

  return (
    <section
      id="hero"
      className="
        relative w-full
        h-[clamp(600px,100vh,900px)]
        flex flex-col justify-end
        overflow-hidden
      "
    >
      {/* Background Images Layering dengan Transisi opacity */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          />
        </div>
      ))}

      {/* Gradient Overlays: 
        Bagian paling bawah (from-background) diset 100% solid agar menyatu dengan section berikutnya.
        Gradient memudar lebih cepat (via-40%) agar bagian tengah gambar tetap terang.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 via-40% to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 via-40% to-transparent z-[1]" />

      {/* Konten Utama - Aligned to Left Bottom */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16 pb-28 pt-32 h-full flex flex-col justify-end items-start text-left max-w-7xl">
        {/* Label Tipe Data */}
        <div
          key={`badge-${activeItem.id}`}
          className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-secondary/80 border border-border backdrop-blur-md animate-fade-up"
        >
          {activeItem.type === "event" ? (
            <Calendar className="w-4 h-4 text-gold" />
          ) : (
            <Folder className="w-4 h-4 text-gold" />
          )}
          <span className="text-xs tracking-widest uppercase font-semibold text-gold">
            {activeItem.subtitle}
          </span>
        </div>

        {/* Judul Konten Dinamis */}
        <h1
          key={`title-${activeItem.id}`}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
          font-display font-bold text-foreground leading-[1.1] 
          mb-6 animate-fade-up drop-shadow-lg
          max-w-3xl"
          style={{ animationDelay: "0.05s" }}
        >
          {activeItem.title}
        </h1>

        {/* Excerpt Dinamis - Menggunakan muted-foreground agar lebih soft */}
        {activeItem.excerpt && (
          <p
            key={`excerpt-${activeItem.id}`}
            className="text-base md:text-lg lg:text-xl font-normal text-foreground/90 
            mb-8 animate-fade-up
            max-w-2xl leading-relaxed drop-shadow-md line-clamp-3"
            style={{ animationDelay: "0.1s" }}
          >
            {activeItem.excerpt}
          </p>
        )}

        {/* Call to Action Buttons */}
        <div
          key={`cta-${activeItem.id}`}
          // Ubah flex-wrap menjadi flex-col di mobile, dan flex-row di desktop. items-start mencegah tombol memanjang full
          className="flex flex-col md:flex-row items-start md:items-center w-full max-w-2xl gap-3 md:gap-4 animate-fade-up mt-2"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Tombol Utama - Lebar natural sesuai konten teks */}
          <Button
            className="px-5 py-4 md:px-6 md:py-4 text-sm md:text-base shadow-lg h-auto"
            asChild
          >
            <a href={activeItem.url}>Lihat Selengkapnya</a>
          </Button>

          {/* Wrapper Tombol Sekunder - Full width di mobile agar turun ke bawah, menyesuaikan konten di desktop */}
          <div className="flex w-full md:w-auto gap-3 md:gap-4">
            <Button
              variant="outline"
              className="flex-1 md:flex-none px-2 py-4 sm:px-5 md:px-6 md:py-4 text-sm md:text-base bg-background/40 border-gold text-gold hover:bg-gold hover:text-primary-foreground backdrop-blur-sm h-auto"
              asChild
            >
              <a
                href="#kolaborasi?tab=anggota"
                className="flex items-center justify-center"
              >
                <Users className="mr-1 sm:mr-2 h-4 w-4 md:h-5 md:w-5 shrink-0" />
                <span className="truncate">Bergabung</span>
              </a>
            </Button>

            <Button
              variant="outline"
              className="flex-1 md:flex-none px-2 py-4 sm:px-5 md:px-6 md:py-4 text-sm md:text-base bg-gold/90 text-primary-foreground hover:bg-background/40 hover:text-gold hover:border-gold backdrop-blur-sm border-transparent h-auto"
              asChild
            >
              <a
                href="#kolaborasi?tab=donasi"
                className="flex items-center justify-center"
              >
                <Heart className="mr-1 sm:mr-2 h-4 w-4 md:h-5 md:w-5 shrink-0" />
                <span className="truncate">Dukung Dakwah</span>
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-gold"
                  : "w-2 bg-muted-foreground/50 hover:bg-foreground"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
