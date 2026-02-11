import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-background/80" />

      <div className="relative container mx-auto px-4 py-32 text-center max-w-4xl">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-secondary border border-gold/20">
          <span className="text-sm font-medium text-primary">Ikatan Da'i Indonesia — Jawa Timur</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6 animate-fade-up">
          Mari Berdakwah{" "}
          <span className="text-primary">Bersama</span>
        </h1>

        <p className="text-lg md:text-xl text-gold font-display italic mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          "Karena Da'i bukan hanya yang ceramah lewat mimbar."
        </p>

        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          PW IKADI Jawa Timur adalah wadah kolaborasi dai dan masyarakat dalam membangun dakwah yang profesional, hangat, dan berdampak luas di tengah masyarakat.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button size="lg" className="text-base px-8" asChild>
            <a href="#kolaborasi">
              <Users className="mr-2 h-5 w-5" />
              Bergabung Bersama Kami
            </a>
          </Button>
          <Button size="lg" variant="outline" className="text-base" asChild>
            <a href="#kolaborasi">Undang Da'i</a>
          </Button>
          <Button size="lg" variant="outline" className="text-base border-gold/40 text-gold hover:bg-gold-light" asChild>
            <a href="#kolaborasi">
              <Heart className="mr-2 h-4 w-4" />
              Dukung Dakwah
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
