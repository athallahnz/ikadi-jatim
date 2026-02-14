import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string;
};

const GallerySection = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase.from("gallery").select("*").limit(16);
      if (data) setImages(data);
    };
    fetchGallery();
  }, []);

  // Membagi data menjadi 2 bagian untuk marquee
  const midPoint = Math.ceil(images.length / 2);
  const imagesTop = images.slice(0, midPoint);
  const imagesBottom = images.slice(midPoint);

  return (
    <section id="galeri" className="py-24 bg-cream overflow-hidden">
      <div className="container mx-auto px-6 mb-16 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
          Galeri Kegiatan
        </h2>
        <div className="gold-divider mx-auto mb-6" />
        <p className="text-muted-foreground max-w-xl mx-auto">
          Dokumentasi kegiatan dakwah, pembinaan, dan agenda PW IKADI Jawa
          Timur.
        </p>
      </div>

      {/* ROW 1 - Marquee Left */}
      <div className="relative flex overflow-hidden pause-on-hover">
        <div className="flex animate-marquee-left gap-6">
          {[...imagesTop, ...imagesTop].map((item, i) => (
            <GalleryCard key={i} item={item} />
          ))}
        </div>
      </div>

      {/* ROW 2 - Marquee Right */}
      <div className="relative flex overflow-hidden mt-8 pause-on-hover">
        <div className="flex animate-marquee-right gap-6">
          {[...imagesBottom, ...imagesBottom].map((item, i) => (
            <GalleryCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

const GalleryCard = ({ item }: { item: GalleryItem }) => {
  if (!item) return null;
  return (
    <div className="relative w-64 h-40 md:w-72 md:h-44 rounded-xl overflow-hidden shadow-md shrink-0 group">
      <img
        src={item.image_url}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/20 flex items-end">
        <div className="px-4 py-3 backdrop-blur-sm bg-black/30 w-full">
          <span className="text-white text-xs block opacity-70 uppercase tracking-tighter">
            {item.category}
          </span>
          <span className="text-white text-sm md:text-base font-semibold truncate block">
            {item.title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GallerySection;
