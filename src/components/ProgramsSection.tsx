import { BookOpen, Building2, GraduationCap, HeartHandshake, Mic2 } from "lucide-react";

const programs = [
  {
    icon: GraduationCap,
    title: "Pembinaan Da'i",
    desc: "Program pembinaan berkelanjutan untuk meningkatkan kapasitas da'i dalam menyampaikan dakwah yang relevan dan menyejukkan.",
  },
  {
    icon: Building2,
    title: "Dakwah Masjid & Komunitas",
    desc: "Menghadirkan da'i berkualitas di masjid-masjid dan komunitas untuk membangun pemahaman Islam yang moderat.",
  },
  {
    icon: Mic2,
    title: "Pelatihan & Workshop",
    desc: "Workshop public speaking, konten digital, dan manajemen dakwah untuk para da'i muda dan relawan.",
  },
  {
    icon: HeartHandshake,
    title: "Kolaborasi Sosial",
    desc: "Bersinergi dengan lembaga sosial dan pemerintah untuk program pemberdayaan masyarakat berbasis dakwah.",
  },
  {
    icon: BookOpen,
    title: "Penyediaan Materi Dakwah",
    desc: "Menyusun dan mendistribusikan materi khutbah, kajian, dan konten dakwah digital yang terverifikasi.",
  },
];

const ProgramsSection = () => {
  return (
    <section id="program" className="py-24 bg-cream islamic-pattern">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Program Unggulan
          </h2>
          <div className="gold-divider mx-auto mb-4" />
          <p className="text-muted-foreground max-w-xl mx-auto">
            Berbagai program strategis yang kami jalankan untuk memajukan dakwah di Jawa Timur.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {programs.map((program, i) => (
            <div
              key={program.title}
              className="animate-on-scroll bg-card rounded-xl p-6 border border-border hover:border-gold/30 hover:shadow-lg transition-all group"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                <program.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{program.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{program.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
