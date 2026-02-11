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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Mengapa Dakwah Perlu Profesional?
          </h2>
          <div className="gold-divider mx-auto" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {points.map((point, i) => (
            <div
              key={point.title}
              className="animate-on-scroll text-center group"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <point.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{point.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;
