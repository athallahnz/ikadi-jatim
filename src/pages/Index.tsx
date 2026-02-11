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

const Index = () => {
  useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <WhySection />
      <ProgramsSection />
      <EventsSection />
      <ArticlesSection />
      <StatsSection />
      <CollaborationSection />
      <FooterSection />
    </div>
  );
};

export default Index;
