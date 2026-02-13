import ProgramsSection from "@/components/ProgramsSection";

const ProgramKuliahAgamaIslam = () => {
  return (
    <section className="pt-24 pb-24 bg-cream islamic-pattern">
      <div className="container mx-auto max-w-6xl pt-16 bg-gradient-to-b from-background to-secondary/10 -z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Kuliah Agama Islam
          </h1>
          <div className="gold-divider mb-8" />

          <p className="text-muted-foreground leading-relaxed mb-6">
            Kuliah Agama Islam adalah kegiatan Kajian atau kuliah yang bersifat
            intensif. Program ini dilaksanakan oleh PW IKADI secara mandiri,
            atau bisa bekerjasama dengan lembaga lain. Kuliah agama Islam ini
            bentuknya berupa kajian dengan tema Seputar Al Qur’an, Hadits,
            Aqidah, Fiqih, Kajian Kitab dan lain-lain.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProgramKuliahAgamaIslam;
