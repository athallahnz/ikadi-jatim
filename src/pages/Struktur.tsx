import { Users } from "lucide-react";

const leaders = [
  { name: "Dr. H. M. Baihaqi, Lc, MA.", role: "Ketua Umum" },
  { name: "Dr. H.M. Musa Syarof, MA", role: "Ketua I" },
  { name: "H. Ahmad Habibul Muiz, Lc, M.Sos", role: "Ketua II" },
  { name: "H. M. Nidzom Anshori, SH., MH.", role: "Sekretaris" },
  { name: "Helmy Wicaksono Putro, SH, MH", role: "Sekretaris I" },
  { name: "Samsul Hadi, S.Pd.", role: "Sekretaris II" },
  { name: "Dr. H. Ali Hamdan, S.Si, M.EI", role: "Bendahara" },
  { name: "Pinujie", role: "Wakil Bendahara" },
];

const Struktur = () => {
  return (
    <section className="pt-24 pb-24 bg-cream islamic-pattern">
      <div className="container mx-auto max-w-6xl pt-16 bg-gradient-to-b from-background to-secondary/10 -z-10">
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-9 w-9 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Struktur Kepengurusan
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Struktur kepengurusan Pengurus Wilayah IKADI Jawa Timur sebagai
            bagian dari penguatan dakwah, pembinaan umat, dan pengembangan
            organisasi yang profesional.
          </p>

          <div className="gold-divider mx-auto mt-8" />
        </div>
        {/* ===== GRID ===== */}
        <div>
          <div
            className="
              grid gap-10
              [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]
              justify-items-center
            "
          >
            {leaders.map((leader, i) => (
              <div
                key={leader.name}
                className="
                  w-full max-w-[320px]
                  bg-card
                  rounded-2xl
                  p-8
                  text-center
                  border border-border
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-2
                  hover:border-gold/40
                  hover:shadow-xl
                "
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-primary font-bold text-2xl">
                    {leader.name[0]}
                  </span>
                </div>

                {/* Name */}
                <p className="font-semibold text-base text-foreground">
                  {leader.name}
                </p>

                {/* Role */}
                <span className="inline-block mt-4 px-4 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {leader.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Struktur;
