const AboutSection = () => {
  return (
    <section id="tentang" className="py-20 md:py-24 bg-cream islamic-pattern">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16 animate-on-scroll">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Tentang IKADI
          </h2>

          <div className="gold-divider mx-auto mb-6" />

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed md:leading-relaxed">
            IKADI adalah singkatan dari Ikatan Da’i Indonesia. Didirikan di
            Jakarta pada hari Jum’at, tanggal 1 Jumadil Ula 1423 Hijriah
            bertepatan dengan tanggal 12 Juli 2002. (AD Ikadi pasal 1). IKADI
            adalah organisasi kemasyarakatan yang bertujuan untuk mewadahi
            aktivitas anggotanya dalam mendayagunakan potensinya untuk
            kemaslahatan umat dan bangsa melalui aktifitas dakwah yang membawa
            rahmat. (AD Ikadi pasal 7 ayat 1)
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
