import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, ZoomIn, Calendar, Tag} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";

/* ================= TYPES ================= */
type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at?: string; // Tambahan untuk detail informasi
};

const GallerySection = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.from("gallery").select("*").limit(16);
        if (data) setImages(data);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Membagi data menjadi 2 bagian untuk marquee
  const midPoint = Math.ceil(images.length / 2);
  const imagesTop = images.slice(0, midPoint);
  const imagesBottom = images.slice(midPoint);

  return (
    <section id="galeri" className="py-24 bg-cream overflow-hidden relative">
      <div className="container mx-auto px-6 mb-16 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
          Galeri Kegiatan
        </h2>
        <div className="gold-divider mx-auto mb-6" />
        <p className="text-muted-foreground max-w-xl mx-auto">
          Dokumentasi kegiatan dakwah, pembinaan, dan agenda Pimpinan Wilayah dan Dearah IKADI Jawa
          Timur.
        </p>
      </div>

      {loading ? (
        /* LOADING STATE */
        <div className="flex gap-6 justify-center">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-72 h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* ROW 1 - Marquee Left */}
          <div className="relative flex overflow-hidden pause-on-hover">
            <div className="flex animate-marquee-left gap-6">
              {[...imagesTop, ...imagesTop].map((item, i) => (
                <GalleryCard
                  key={i}
                  item={item}
                  onClick={() => setSelectedImage(item)}
                />
              ))}
            </div>
          </div>

          {/* ROW 2 - Marquee Right */}
          <div className="relative flex overflow-hidden mt-8 pause-on-hover">
            <div className="flex animate-marquee-right gap-6">
              {[...imagesBottom, ...imagesBottom].map((item, i) => (
                <GalleryCard
                  key={i}
                  item={item}
                  onClick={() => setSelectedImage(item)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL / LIGHTBOX ================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="bg-card w-full max-w-6xl max-h-full rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Image Side */}
            <div className="flex-[2] bg-black flex items-center justify-center relative group">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] md:max-h-full object-contain"
              />
            </div>

            {/* Info Side */}
            <div className="flex-1 p-8 bg-card flex flex-col border-l border-border">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit mb-6">
                <Tag className="w-3 h-3" />
                {selectedImage.category}
              </div>

              <h3 className="text-2xl font-display font-bold text-foreground mb-4 leading-tight">
                {selectedImage.title}
              </h3>

              <div className="space-y-4 py-6 border-y border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-gold" />
                  <span className="text-sm">
                    {selectedImage.created_at
                      ? new Date(selectedImage.created_at).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "long", year: "numeric" },
                        )
                      : "Kegiatan PW IKADI"}
                  </span>
                </div>
                {/* Anda bisa menambah detail lain seperti lokasi atau deskripsi di sini */}
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  Dokumentasi resmi pengurus wilayah Ikatan Dai Indonesia Jawa
                  Timur dalam rangka syiar dan dakwah Islam.
                </p>
              </div>

              <div className="mt-auto pt-8">
                <Button
                  className="w-full rounded-xl"
                  onClick={() => setSelectedImage(null)}
                >
                  Tutup Detail
                </Button>
              </div>
            </div>
          </div>

          {/* Backdrop Click to Close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setSelectedImage(null)}
          />
        </div>
      )}
    </section>
  );
};

/* ================= SUB-COMPONENTS ================= */

const GalleryCard = ({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick: () => void;
}) => {
  if (!item) return null;
  return (
    <div
      onClick={onClick}
      className="relative w-64 h-40 md:w-72 md:h-44 rounded-xl overflow-hidden shadow-md shrink-0 group cursor-pointer"
    >
      <img
        src={item.image_url}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Overlay Hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition-transform duration-300">
          <ZoomIn className="text-white w-6 h-6" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end">
        <div className="px-4 py-3 backdrop-blur-md bg-black/40 w-full border-t border-white/10">
          <span className="text-white/70 text-[10px] block uppercase tracking-widest font-bold">
            {item.category}
          </span>
          <span className="text-white text-sm font-semibold truncate block">
            {item.title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GallerySection;
