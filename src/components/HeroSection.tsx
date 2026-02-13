import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="
        relative
        min-h-[clamp(600px,85vh,900px)]
        flex items-center justify-center
        overflow-hidden pt-0 pb-20 md:pb-32
      "
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background/95" />
      
      <div className="relative container mx-auto px-8 md:px-16 py-36 md:py-44 text-center max-w-7xl">
        <div className="inline-block mb-8 px-5 py-2 rounded-full bg-light/10 border border-gold/50 backdrop-blur animate-fade-up">
          <span className="text-xs tracking-widest uppercase font-semibold text-gold max-w-4xl">
            Ikatan Da'i Indonesia — Jawa Timur
          </span>
        </div>

        <h1
          className=" text-5xl sm:text-6xl md:text-7xl lg:text-8xl 
          font-display font-bold text-foreground leading-[1.1] 
          mb-8 animate-fade-up 
          px-8 md:px-20 max-w-7xl mx-auto"
          style={{ animationDelay: "0.05s" }}
        >
          Menebar Islam <br className="hidden sm:block" />
          <span className="text-primary">Rahmatan Lil ‘Alamin</span>
        </h1>

        <div
          className="gold-divider mx-auto mb-8 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        />

        <p
          className="text-lg md:text-2xl font-display italic 
          mb-8 animate-fade-up 
          max-w-3xl mx-auto leading-relaxed"
          style={{ animationDelay: "0.15s" }}
        >
          “Dakwah bukan hanya disuarakan, tetapi dihadirkan — dalam akhlak,
          dalam karya, dan dalam kehidupan.”
        </p>

        {/* <p
          className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-12 animate-fade-up leading-relaxed"
          style={{ animationDelay: "0.2s" }}
          >
          PW IKADI Jawa Timur hadir sebagai rumah besar dakwah — membina,
          menguatkan, dan menghubungkan para da’i dengan umat untuk menghadirkan
          nilai Islam yang rahmatan lil ‘alamin di tengah masyarakat.
          </p> */}

        <div
          className="gold-divider mx-auto mb-8 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        />

        <div
          className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up mt-4"
          style={{ animationDelay: "0.3s" }}
        >
          <Button size="lg" className="px-10 py-6 text-lg shadow-lg" asChild>
            <a href="#kolaborasi">
              <Users className="mr-2 h-5 w-5" />
              Bergabung Bersama Kami
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base py-6 bg-transparent border-gold text-gold hover:bg-gold hover:text-gold-light"
            asChild
          >
            <a href="#kolaborasi">Undang Da'i</a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base py-6 bg-gold text-gold-light hover:bg-transparent hover:text-gold hover:border-gold"
            asChild
          >
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
