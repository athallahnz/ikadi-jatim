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

      <div className="relative container mx-auto px-4 py-36 md:py-44 text-center max-w-4xl">
        <div className="inline-block mb-8 px-5 py-2 rounded-full bg-secondary/80 border border-gold/20 backdrop-blur-sm animate-fade-up">
          <span className="text-xs tracking-widest uppercase font-semibold text-primary">Ikatan Da'i Indonesia — Jawa Timur</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-foreground leading-[1.1] mb-8 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          Mari Berdakwah{" "}
          <br className="hidden sm:block" />
          <span className="text-primary">Bersama</span>
        </h1>

        <div className="gold-divider mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }} />

        <p className="text-lg md:text-2xl text-gold font-display italic mb-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          "Karena Da'i bukan hanya yang ceramah lewat mimbar."
        </p>

        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-12 animate-fade-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
          PW IKADI Jawa Timur adalah wadah kolaborasi dai dan masyarakat dalam membangun dakwah yang profesional, hangat, dan berdampak luas.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button size="lg" className="text-base px-10 py-6 text-lg shadow-lg" asChild>
            <a href="#kolaborasi">
              <Users className="mr-2 h-5 w-5" />
              Bergabung Bersama Kami
            </a>
          </Button>
          <Button size="lg" variant="outline" className="text-base py-6" asChild>
            <a href="#kolaborasi">Undang Da'i</a>
          </Button>
          <Button size="lg" variant="outline" className="text-base py-6 border-gold/40 text-gold hover:bg-gold-light" asChild>
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
