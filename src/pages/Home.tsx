import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import HeroSection, { EventItem, GalleryItem } from "@/components/HeroSection"; // Pastikan import type-nya
import AboutSection from "@/components/AboutSection";
import WhySection from "@/components/WhySection";
import ProgramsSection from "@/components/ProgramsSection";
import EventsSection from "@/components/EventsSection";
import ArticlesSection from "@/components/ArticlesSection";
import StatsSection from "@/components/StatsSection";
import CollaborationSection from "@/components/CollaborationSection";
import GallerySection from "@/components/GallerySection";
import { supabase } from "@/lib/supabase"; // Sesuaikan path ini dengan file Supabase client Anda

const Home = () => {
  useScrollAnimation();

  // 1. Buat state untuk menampung data
  const [dataEvents, setDataEvents] = useState<EventItem[]>([]);
  const [dataGalleries, setDataGalleries] = useState<GalleryItem[]>([]);
  const [, setIsLoading] = useState<boolean>(true);

  // 2. Fetch data dari Supabase saat komponen dimuat
  useEffect(() => {
    const fetchHeroData = async () => {
      setIsLoading(true);
      try {
        // Ambil data events (Misal ambil 3 event terbaru yang ada covernya)
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .not("cover", "is", null) // Pastikan cover tidak null
          .order("created_at", { ascending: false })
          .limit(3);

        if (eventsError) throw eventsError;

        // Ambil data gallery (Misal ambil 3 gambar terbaru)
        const { data: galleriesData, error: galleriesError } = await supabase
          .from("gallery") // Sesuaikan nama tabel jika berbeda
          .select("*")
          .not("image_url", "is", null)
          .order("created_at", { ascending: false })
          .limit(3);

        if (galleriesError) throw galleriesError;

        // Simpan ke state
        if (eventsData) setDataEvents(eventsData as EventItem[]);
        if (galleriesData) setDataGalleries(galleriesData as GalleryItem[]);
      } catch (error) {
        console.error("Error fetching hero data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}

      {/* 3. Passing state ke HeroSection */}
      {/* Anda juga bisa menambahkan logika jika sedang loading agar tidak ada kedipan UI */}
      <HeroSection events={dataEvents} galleries={dataGalleries} />

      <EventsSection />
      <ArticlesSection />
      <GallerySection />
      <StatsSection />
      <AboutSection />
      <WhySection />
      <ProgramsSection />
      <CollaborationSection />
      {/* <FooterSection /> */}
    </div>
  );
};

export default Home;
