import ProgramsSection from "@/components/ProgramsSection";

const ProgramKonsultasi = () => {
  return (
    <section className="pt-24 pb-24 bg-cream islamic-pattern">
      <div className="container mx-auto max-w-6xl pt-16 bg-gradient-to-b from-background to-secondary/10 -z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Konsultasi
          </h1>
          <div className="gold-divider mb-8" />

          <p className="text-muted-foreground leading-relaxed mb-6">
            Program ini merupakan layanan untuk masyarakat, dimana masyarakat
            bisa bertanya dan berkonsultasi mengenai permasalahan-permasalahan
            agama dan kehidupan lainnya. Layanan Konsultasi IKADI ini
            bekerjasama dengan Lembaga Amil Zakat Nasional (LAZNAS) LMI:
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Konsultasi dengan bertemu langsung ustadz di Kantor PW IKADI Jawa
            Timur (sesuai dengan perjanjian)
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">Konsultasi online melalui website: <a href="https://www.konsultasisyariah.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.konsultasisyariah.net</a></p>
        </div>
      </div>
    </section>
  );
};

export default ProgramKonsultasi;
