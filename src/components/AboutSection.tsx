const leaders = [
  { name: "Dr. H. Ahmad Fauzi, Lc., M.A.", role: "Ketua" },
  { name: "Ustadz Muhammad Rizki, S.Ag.", role: "Wakil Ketua" },
  { name: "Hj. Siti Aminah, M.Pd.I.", role: "Sekretaris" },
  { name: "H. Abdul Karim, S.E.", role: "Bendahara" },
  { name: "Ustadz Irfan Hakim, Lc.", role: "Divisi Dakwah" },
  { name: "Dr. Fatimah Zahra, M.Ag.", role: "Divisi Pendidikan" },
];

const AboutSection = () => {
  return (
    <section id="tentang" className="py-24 bg-cream islamic-pattern">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Tentang PW IKADI Jawa Timur
          </h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-muted-foreground leading-relaxed">
            Berdiri sebagai bagian dari Ikatan Da'i Indonesia tingkat nasional, PW IKADI Jawa Timur
            bergerak dalam pembinaan dan penguatan peran dai di seluruh wilayah Jawa Timur.
            Kami mengedepankan dakwah yang <em>rahmatan lil 'alamin</em>, profesional, dan membumi —
            menyentuh hati, membangun umat.
          </p>
        </div>

        <div className="animate-on-scroll">
          <h3 className="text-xl font-display font-semibold text-center text-foreground mb-8">
            Struktur Kepengurusan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {leaders.map((leader) => (
              <div
                key={leader.name}
                className="bg-card rounded-lg p-4 text-center border border-border hover:border-gold/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">{leader.name[0]}</span>
                </div>
                <p className="font-semibold text-sm text-foreground">{leader.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{leader.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
