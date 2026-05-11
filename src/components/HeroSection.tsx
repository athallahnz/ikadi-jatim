import React, { useState, useEffect, useMemo } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

import { Heart, Users, Calendar, Folder } from "lucide-react";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

export type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at?: string | null;
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

  created_at?: string | null;
  publish_at?: string | null;
  published?: boolean | null;
};

interface HeroSlideItem {
  id: string;
  title: string;
  imageUrl: string;
  type: "event" | "gallery";
  subtitle: string;
  url: string;
  excerpt: string | null;
}

interface HeroSectionProps {
  events?: EventItem[];
  galleries?: GalleryItem[];
}

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const HeroSection: React.FC<HeroSectionProps> = ({
  events = [],
  galleries = [],
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  /**
   * =========================================================
   * 7 HARI TERAKHIR
   * =========================================================
   */

  const sevenDaysAgo = useMemo(() => {
    const d = new Date();

    d.setDate(d.getDate() - 7);

    return d.toISOString();
  }, []);

  /**
   * =========================================================
   * FILTER EVENTS
   * =========================================================
   */

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const compareDate = e.publish_at || e.created_at;

      if (!compareDate) return false;

      const publishDate = new Date(compareDate);

      return (
        e.published === true &&
        !!e.cover &&
        !!e.title &&
        publishDate >= new Date(sevenDaysAgo)
      );
    });
  }, [events, sevenDaysAgo]);

  /**
   * =========================================================
   * FILTER GALLERY
   * =========================================================
   */

  const filteredGalleries = useMemo(() => {
    return galleries.filter((g) => {
      if (!g.created_at) return false;

      const createdAt = new Date(g.created_at);

      return !!g.image_url && !!g.title && createdAt >= new Date(sevenDaysAgo);
    });
  }, [galleries, sevenDaysAgo]);

  /**
   * =========================================================
   * SLIDES
   * =========================================================
   */

  const slides: HeroSlideItem[] = useMemo(() => {
    return [
      ...filteredEvents.map((e) => ({
        id: e.id,

        title: e.title,

        imageUrl: e.cover as string,

        type: "event" as const,

        subtitle: e.display_date || e.daerah || "Event Terbaru",

        url:
          e.scope === "daerah"
            ? `/kabar/daerah/${e.daerah_slug}/${e.slug}`
            : `/kabar/jatim/${e.slug}`,

        excerpt: e.excerpt,
      })),

      ...filteredGalleries.map((g) => ({
        id: g.id,

        title: g.title,

        imageUrl: g.image_url,

        type: "gallery" as const,

        subtitle: g.category || "Galeri",

        url: "/galeri",

        excerpt: null,
      })),
    ];
  }, [filteredEvents, filteredGalleries]);

  /**
   * =========================================================
   * AUTO SLIDE
   * =========================================================
   */

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= slides.length - 1) {
          return 0;
        }

        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [slides]);

  /**
   * =========================================================
   * RESET INDEX
   * =========================================================
   */

  useEffect(() => {
    if (!slides.length) {
      setCurrentSlide(0);
      return;
    }

    if (currentSlide > slides.length - 1) {
      setCurrentSlide(0);
    }
  }, [slides, currentSlide]);

  /**
   * =========================================================
   * SKELETON / EMPTY
   * =========================================================
   */

  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[clamp(600px,100vh,900px)] flex flex-col justify-end overflow-hidden bg-background">
        {/* Background Base */}
        <div className="absolute inset-0 bg-muted/50" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent z-[1]" />

        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent z-[1]" />

        <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16 pb-28 pt-32 h-full flex flex-col justify-end items-start text-left max-w-7xl">
          {/* Skeleton Badge */}
          <div className="relative overflow-hidden h-8 w-36 bg-secondary rounded-full mb-6 border border-border">
            <div className="absolute inset-0 shimmer-effect" />
          </div>

          {/* Skeleton Title */}
          <div className="relative overflow-hidden h-12 sm:h-16 md:h-20 w-full max-w-3xl bg-secondary/80 rounded-xl mb-3">
            <div className="absolute inset-0 shimmer-effect" />
          </div>

          <div className="relative overflow-hidden h-12 sm:h-16 md:h-20 w-3/4 max-w-2xl bg-secondary/80 rounded-xl mb-8">
            <div className="absolute inset-0 shimmer-effect" />
          </div>

          {/* Skeleton Excerpt */}
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

        {/* Skeleton Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
          <div className="h-2 w-8 bg-muted-foreground/30 rounded-full" />
          <div className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
          <div className="h-2 w-2 bg-muted-foreground/30 rounded-full" />
        </div>
      </section>
    );
  }

  const activeItem = slides[currentSlide] || slides[0];

  if (!activeItem) {
    return null;
  }
  /**
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section
      id="hero"
      className="
        relative w-full
        h-[clamp(600px,100vh,900px)]
        overflow-hidden
      "
    >
      {/* BACKGROUND */}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem.id}
          initial={{
            opacity: 0,
            scale: 1.05,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.02,
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
          className="absolute inset-0"
        >
          <div
            className="
              absolute inset-0
              bg-cover bg-center bg-no-repeat
            "
            style={{
              backgroundImage: `url(${activeItem.imageUrl})`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* OVERLAY */}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 via-40% to-transparent z-[1]" />

      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 via-40% to-transparent z-[1]" />

      {/* CONTENT */}

      <div
        className="
          relative z-10
          container mx-auto
          px-6 md:px-12 lg:px-16
          pb-28 pt-32
          h-full
          flex flex-col justify-end items-start
          text-left
          max-w-7xl
        "
      >
        {/* BADGE */}

        <motion.div
          key={`badge-${activeItem.id}`}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="
            inline-flex items-center gap-2
            mb-4 px-4 py-1.5
            rounded-full
            bg-secondary/80
            border border-border
            backdrop-blur-md
          "
        >
          {activeItem.type === "event" ? (
            <Calendar className="w-4 h-4 text-gold" />
          ) : (
            <Folder className="w-4 h-4 text-gold" />
          )}

          <span
            className="
              text-xs
              tracking-widest
              uppercase
              font-semibold
              text-gold
            "
          >
            {activeItem.subtitle}
          </span>
        </motion.div>

        {/* TITLE */}

        <motion.h1
          key={`title-${activeItem.id}`}
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="
            text-3xl sm:text-4xl
            md:text-5xl lg:text-6xl
            font-display font-bold
            text-foreground
            leading-[1.1]
            mb-6
            drop-shadow-lg
            max-w-3xl
          "
        >
          {activeItem.title}
        </motion.h1>

        {/* EXCERPT */}

        {activeItem.excerpt && (
          <motion.p
            key={`excerpt-${activeItem.id}`}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="
              text-base md:text-lg lg:text-xl
              font-normal
              text-foreground/90
              mb-8
              max-w-2xl
              leading-relaxed
              drop-shadow-md
              line-clamp-3
            "
          >
            {activeItem.excerpt}
          </motion.p>
        )}

        {/* CTA */}

        <motion.div
          key={`cta-${activeItem.id}`}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="
            flex flex-col md:flex-row
            items-start md:items-center
            w-full max-w-2xl
            gap-3 md:gap-4
            mt-2
          "
        >
          <Button
            className="
              px-5 py-4
              md:px-6 md:py-4
              text-sm md:text-base
              shadow-lg
              h-auto
            "
            asChild
          >
            <a href={activeItem.url}>Lihat Selengkapnya</a>
          </Button>

          <div className="flex w-full md:w-auto gap-3 md:gap-4">
            <Button
              variant="outline"
              className="
                flex-1 md:flex-none
                px-2 py-4
                sm:px-5
                md:px-6 md:py-4
                text-sm md:text-base
                bg-background/40
                border-gold
                text-gold
                hover:bg-gold
                hover:text-primary-foreground
                backdrop-blur-sm
                h-auto
              "
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
              className="
                flex-1 md:flex-none
                px-2 py-4
                sm:px-5
                md:px-6 md:py-4
                text-sm md:text-base
                bg-gold/90
                text-primary-foreground
                hover:bg-background/40
                hover:text-gold
                hover:border-gold
                backdrop-blur-sm
                border-transparent
                h-auto
              "
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
        </motion.div>
      </div>

      {/* INDICATORS */}

      {slides.length > 1 && (
        <div
          className="
            absolute bottom-8
            left-0 right-0
            z-20
            flex justify-center
            gap-2
          "
        >
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className="
                    relative
                    h-2
                    rounded-full
                    overflow-hidden
                    transition-all duration-300
                  "
                style={{
                  width: isActive ? 32 : 10,
                }}
                aria-label={`Go to slide ${index + 1}`}
              >
                <motion.div
                  animate={{
                    width: isActive ? 32 : 10,

                    opacity: isActive ? 1 : 0.5,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className={`h-2 rounded-full ${
                    isActive ? "bg-gold" : "bg-muted-foreground"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
