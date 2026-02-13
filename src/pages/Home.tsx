import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import WhySection from "@/components/WhySection";
import ProgramsSection from "@/components/ProgramsSection";
import EventsSection from "@/components/EventsSection";
import ArticlesSection from "@/components/ArticlesSection";
import StatsSection from "@/components/StatsSection";
import CollaborationSection from "@/components/CollaborationSection";
import FooterSection from "@/components/FooterSection";
import GallerySection from "@/components/GallerySection";

const Home = () => {
  useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <WhySection />
      <ProgramsSection />
      <EventsSection />
      <ArticlesSection />
      <GallerySection />
      <CollaborationSection />
      {/* <FooterSection /> */}
    </div>
  );
};

export default Home;
