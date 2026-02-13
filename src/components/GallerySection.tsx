import React from "react";

const imagesTop = Array.from({ length: 8 });
const imagesBottom = Array.from({ length: 8 });

const GallerySection = () => {
  return (
    <section id="galeri" className="py-24 bg-cream overflow-hidden">
      <div className="container mx-auto px-6 mb-16 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
          Galeri Kegiatan
        </h2>
        <div className="gold-divider mx-auto mb-6" />
        <p className="text-muted-foreground max-w-xl mx-auto">
          Dokumentasi kegiatan dakwah, pembinaan, dan agenda strategis PW IKADI
          Jawa Timur.
        </p>
      </div>

      {/* ROW 1 */}
      <div className="relative flex overflow-hidden pause-on-hover">
        <div className="flex animate-marquee-left gap-6">
          {[...imagesTop, ...imagesTop].map((_, i) => (
            <GalleryCard key={i} index={i} label="Kegiatan" />
          ))}
        </div>
      </div>

      {/* ROW 2 */}
      <div className="relative flex overflow-hidden mt-8 pause-on-hover">
        <div className="flex animate-marquee-right gap-6">
          {[...imagesBottom, ...imagesBottom].map((_, i) => (
            <GalleryCard key={i} index={i + 100} label="Agenda" />
          ))}
        </div>
      </div>
    </section>
  );
};

const GalleryCard = ({ label, index }: { label: string; index: number }) => {
  return (
    <div className="relative w-64 h-40 md:w-72 md:h-44 rounded-xl overflow-hidden shadow-md shrink-0 group">
      {/* IMAGE */}
      <img
        src={`https://picsum.photos/600/400?random=${index}`}
        alt={label}
        className="
          absolute inset-0 w-full h-full object-cover
          transition-transform duration-700
          group-hover:scale-105
        "
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/20 flex items-end">
        <span className="text-white text-sm md:text-base font-semibold px-4 py-3 backdrop-blur-sm bg-black/30 w-full">
          {label}
        </span>
      </div>

      {/* HOVER SHADE */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
    </div>
  );
};

export default GallerySection;
