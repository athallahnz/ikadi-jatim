import {
  BookOpen,
  Building2,
  GraduationCap,
  HeartHandshake,
  Mic2,
} from "lucide-react";

const programs = [
  {
    icon: HeartHandshake,
    title: "Penguatan Ukhuwah & Silaturahim Da'i",
    desc: "Meningkatkan silaturahim, ta’awun (kerja sama), dan ukhuwah Islamiyah dalam memperkuat sinergi dakwah di berbagai wilayah.",
  },
  {
    icon: BookOpen,
    title: "Sosialisasi Nilai-Nilai Islam",
    desc: "Mensosialisasikan sistem kehidupan bermasyarakat dan bernegara yang selaras dengan nilai-nilai Islam yang moderat dan rahmatan lil ‘alamin.",
  },
  {
    icon: GraduationCap,
    title: "Sertifikasi & Pengembangan Kompetensi Da'i",
    desc: "Melaksanakan sertifikasi dan pembinaan berkelanjutan bagi da’i agar memiliki wawasan kebangsaan dan keumatan dalam berdakwah.",
  },
  {
    icon: Building2,
    title: "Kegiatan Sosial & Kemasyarakatan",
    desc: "Menginisiasi kegiatan di bidang sosial, budaya, pendidikan, ekonomi, dan kemasyarakatan sebagai wujud dakwah yang berdampak.",
  },
  {
    icon: Mic2,
    title: "Kerja Sama Lintas Sektoral",
    desc: "Membangun kolaborasi strategis dengan pemerintah, organisasi, dan berbagai komponen bangsa di dalam maupun luar negeri.",
  },
  {
    icon: HeartHandshake,
    title: "Menjaga Kerukunan & Perdamaian",
    desc: "Bersama pemerintah dan elemen bangsa, turut memelihara kerukunan umat beragama serta perdamaian dunia sesuai amanat UUD 1945.",
  },
];

const ProgramsSection = () => {
  return (
    <section
      id="program"
      className="py-20 md:py-24 lg:py-28 bg-cream islamic-pattern"
    >
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-14 md:mb-16 lg:mb-20 animate-on-scroll">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Program Unggulan
          </h2>

          <div className="gold-divider mx-auto mb-4" />

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Program-program terstruktur yang dirancang untuk menjawab tantangan
            dakwah masa kini dan memperkuat peran da’i di tengah masyarakat.
          </p>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-6xl xl:max-w-7xl mx-auto">
          {programs.map((program, i) => (
            <div
              key={program.title}
              className="
                animate-on-scroll
                bg-card rounded-2xl
                p-6 md:p-7 lg:p-8
                border border-border
                hover:border-gold/30 hover:shadow-xl
                hover:-translate-y-1
                transition-all duration-300
                group
              "
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              {/* ICON */}
              <div
                className="
                  w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
                  rounded-xl
                  bg-secondary
                  flex items-center justify-center
                  mb-4 md:mb-5
                  group-hover:bg-primary
                  transition-colors
                "
              >
                <program.icon className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>

              {/* TITLE */}
              <h3 className="font-display font-semibold text-foreground mb-2 text-base md:text-lg lg:text-xl leading-snug">
                {program.title}
              </h3>

              {/* DESC */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {program.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
