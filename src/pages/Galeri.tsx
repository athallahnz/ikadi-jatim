import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Pastikan file ini sudah kamu buat

// Definisikan tipe data sesuai skema database kamu
type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string;
};

const GalleryCard = ({ item }: { item: GalleryItem }) => {
  if (!item) return null;
  return (
    <div className="relative w-64 h-40 md:w-72 md:h-44 rounded-xl overflow-hidden shadow-md shrink-0 group">
      {/* IMAGE DARI SUPABASE */}
      <img
        src={item.image_url}
        alt={item.title}
        className="
          absolute inset-0 w-full h-full object-cover
          transition-transform duration-700
          group-hover:scale-105
        "
      />

      {/* OVERLAY DENGAN DATA DINAMIS */}
      <div className="absolute inset-0 bg-black/20 flex items-end">
        <div className="px-4 py-3 backdrop-blur-sm bg-black/30 w-full">
          <span className="text-white text-[10px] md:text-xs block opacity-70 uppercase tracking-widest mb-1">
            {item.category}
          </span>
          <span className="text-white text-sm md:text-base font-semibold truncate block">
            {item.title}
          </span>
        </div>
      </div>

      {/* HOVER SHADE */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    </div>
  );
};

const Galeri = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        // Mengambil data dari tabel 'gallery'
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false }) // Urutkan yang terbaru
          .limit(20);

        if (error) throw error;
        if (data) setImages(data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Membagi data secara proporsional untuk 3 baris marquee
  const rowCount = 3;
  const itemsPerRow = Math.ceil(images.length / rowCount);

  const imagesRow1 = images.slice(0, itemsPerRow);
  const imagesRow2 = images.slice(itemsPerRow, itemsPerRow * 2);
  const imagesRow3 = images.slice(itemsPerRow * 2);

  if (loading) {
    return <div className="py-24 text-center">Memuat Galeri...</div>;
  }

  return (
    <section className="pt-24 pb-24 md:pt-28 bg-cream islamic-pattern overflow-hidden">
      <div className="container mx-auto pt-12 px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Galeri Kegiatan
        </h2>
        <div className="gold-divider mx-auto mb-6" />
        <p className="text-muted-foreground max-w-xl mx-auto">
          Dokumentasi kegiatan dakwah, pembinaan, dan agenda strategis PW IKADI
          Jawa Timur.
        </p>
      </div>

      {/* Jika data kosong, tampilkan pesan */}
      {images.length === 0 && (
        <p className="text-center text-gray-500">Belum ada foto di galeri.</p>
      )}

      {/* ROW 1 - Ke Kiri */}
      {imagesRow1.length > 0 && (
        <div className="relative flex overflow-hidden pause-on-hover">
          <div className="flex animate-marquee-left gap-6">
            {[...imagesRow1, ...imagesRow1].map((item, i) => (
              <GalleryCard key={`row1-${i}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ROW 2 - Ke Kanan */}
      {imagesRow2.length > 0 && (
        <div className="relative flex overflow-hidden mt-8 pause-on-hover">
          <div className="flex animate-marquee-right gap-6">
            {[...imagesRow2, ...imagesRow2].map((item, i) => (
              <GalleryCard key={`row2-${i}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ROW 3 - Ke Kiri */}
      {imagesRow3.length > 0 && (
        <div className="relative flex overflow-hidden mt-8 pause-on-hover">
          <div className="flex animate-marquee-left gap-6">
            {[...imagesRow3, ...imagesRow3].map((item, i) => (
              <GalleryCard key={`row3-${i}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Galeri;
