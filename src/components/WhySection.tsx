import { Globe, GraduationCap, Handshake, Target } from "lucide-react";

const points = [
  {
    icon: Globe,
    title: "Tantangan Dakwah Era Digital",
    desc: "Di tengah arus informasi yang deras, dakwah membutuhkan pendekatan yang adaptif, cerdas, dan menyentuh generasi kekinian.",
  },
  {
    icon: GraduationCap,
    title: "Pentingnya Pembinaan Da'i",
    desc: "Da'i yang terlatih dan terbina akan mampu menyampaikan pesan Islam dengan lebih efektif, bijak, dan menyejukkan.",
  },
  {
    icon: Handshake,
    title: "Kolaborasi dengan Masyarakat",
    desc: "Dakwah bukan tugas satu orang. Bersama masyarakat, kita bangun ekosistem kebaikan yang saling menguatkan.",
  },
  {
    icon: Target,
    title: "Dakwah Terstruktur & Berdampak",
    desc: "Dengan perencanaan yang matang dan program terukur, dakwah dapat memberikan dampak nyata dan berkelanjutan.",
  },
];

const WhySection = () => {
  return (
    <section className="py-20 md:py-24 lg:py-28 bg-background">
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-14 md:mb-16 lg:mb-20 animate-on-scroll">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Mengapa Dakwah Perlu Profesional?
          </h2>
          <div className="gold-divider mx-auto" />
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 max-w-6xl xl:max-w-7xl mx-auto">
          {points.map((point, i) => (
            <div
              key={point.title}
              className="animate-on-scroll text-center group"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              {/* ICON */}
              <div
                className="
                  w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20
                  rounded-2xl bg-secondary
                  flex items-center justify-center
                  mx-auto mb-4 md:mb-5
                  group-hover:bg-primary group-hover:text-primary-foreground
                  transition-colors
                "
              >
                <point.icon className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>

              {/* TITLE */}
              <h3 className="font-display font-semibold text-foreground mb-2 text-base md:text-lg lg:text-xl">
                {point.title}
              </h3>

              {/* DESC */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;
