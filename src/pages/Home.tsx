import { useState, useEffect } from "react";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import HeroSection, { EventItem, GalleryItem } from "@/components/HeroSection";

import EventsSection from "@/components/EventsSection";

import ArticlesSection, { Article } from "@/components/ArticlesSection";

import AboutSection from "@/components/AboutSection";
import WhySection from "@/components/WhySection";
import ProgramsSection from "@/components/ProgramsSection";
import StatsSection from "@/components/StatsSection";
import CollaborationSection from "@/components/CollaborationSection";
import GallerySection from "@/components/GallerySection";

import { supabase } from "@/lib/supabase";

type ArticleCategory = {
  name: string;
  slug: string;
};

type RawArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_url: string | null;
  publish_at: string;
  scope: "jatim" | "daerah";
  daerah: string | null;

  categories: ArticleCategory | ArticleCategory[] | null;
};

const Home = () => {
  useScrollAnimation();

  /**
   * =========================================================
   * STATE
   * =========================================================
   */

  const [events, setEvents] = useState<EventItem[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  /**
   * =========================================================
   * FETCH + REALTIME
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const isoDate = sevenDaysAgo.toISOString();

    /**
     * =======================================================
     * FETCH HOMEPAGE DATA
     * =======================================================
     */

    const fetchHomepageData = async () => {
      try {
        /**
         * EVENTS
         */

        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("published", true)
          .not("cover", "is", null)
          .gte("publish_at", isoDate)
          .order("publish_at", {
            ascending: false,
          })
          .limit(5);

        if (eventsError) {
          throw eventsError;
        }

        /**
         * GALLERY
         */

        const { data: galleriesData, error: galleriesError } = await supabase
          .from("gallery")
          .select("*")
          .not("image_url", "is", null)
          .gte("created_at", isoDate)
          .order("created_at", {
            ascending: false,
          })
          .limit(5);

        if (galleriesError) {
          throw galleriesError;
        }

        /**
         * ARTICLES
         */

        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select(
            `
              id,
              title,
              slug,
              content,
              cover_url,
              publish_at,
              scope,
              daerah,
              categories (
                name,
                slug
              )
            `,
          )
          .eq("published", true)
          .order("publish_at", {
            ascending: false,
          })
          .limit(3);

        if (articlesError) {
          throw articlesError;
        }

        const normalizedArticles = (articlesData || []).map(
          (item: RawArticle) => ({
            ...item,

            categories: Array.isArray(item.categories)
              ? item.categories[0]
              : item.categories,
          }),
        );

        /**
         * UPDATE STATE
         */

        if (!mounted) return;

        setEvents((eventsData || []) as EventItem[]);
        setGalleries((galleriesData || []) as GalleryItem[]);
        setArticles(normalizedArticles as Article[]);
        setIsLoading(false);
      } catch (error) {
        console.error("Homepage realtime error:", error);
      }
    };

    /**
     * INITIAL FETCH
     */

    fetchHomepageData();

    /**
     * =======================================================
     * REALTIME CHANNEL
     * =======================================================
     */

    const channel = supabase
      .channel("homepage-realtime")

      /** EVENTS */

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        async () => {
          console.log("[Realtime] events updated");

          await fetchHomepageData();
        },
      )

      /** GALLERY */

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gallery",
        },
        async () => {
          console.log("[Realtime] gallery updated");

          await fetchHomepageData();
        },
      )

      /** ARTICLES */

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
        },
        async () => {
          console.log("[Realtime] articles updated");

          await fetchHomepageData();
        },
      )

      .subscribe();

    /**
     * CLEANUP
     */

    return () => {
      mounted = false;

      supabase.removeChannel(channel);
    };
  }, []);

  /**
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-background">
      <HeroSection events={events} galleries={galleries} />

      <EventsSection events={events} />

      <ArticlesSection articles={articles} />

      <GallerySection />

      <StatsSection />

      <AboutSection />

      <WhySection />

      <ProgramsSection />

      <CollaborationSection />
    </div>
  );
};

export default Home;
