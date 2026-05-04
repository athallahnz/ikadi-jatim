import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, ZoomIn, Calendar, Tag, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

/* ================= TYPES ================= */
type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at?: string;
};

/* ================= SUB-COMPONENT: CARD ================= */
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

      {/* HOVER OVERLAY */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 transform scale-50 group-hover:scale-100 transition-transform duration-300">
          <ZoomIn className="text-white w-6 h-6" />
        </div>
      </div>

      {/* DATA OVERLAY */}
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

/* ================= MAIN COMPONENT ================= */
const Galeri = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(21); // Diubah ke 21 agar pas dibagi 3 baris

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

  return (
    <section className="pt-24 pb-24 md:pt-28 bg-cream islamic-pattern overflow-hidden relative">
      <div className="container mx-auto pt-12 px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Galeri Kegiatan
        </h2>
        <div className="gold-divider mx-auto mb-6" />
        <p className="text-muted-foreground max-w-xl mx-auto">
          Dokumentasi kegiatan dakwah, pembinaan, dan agenda strategis Pimpinan Wilayah dan Dearah IKADI
          Jawa Timur.
        </p>
      </div>

      {loading ? (
        <div className="flex gap-6 justify-center overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-72 h-44 rounded-xl flex-shrink-0" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <p className="text-center text-gray-500">Belum ada foto di galeri.</p>
      ) : (
        <div className="space-y-8">
          {/* ROW 1 - Ke Kiri */}
          {imagesRow1.length > 0 && (
            <div className="relative flex overflow-hidden pause-on-hover">
              <div className="flex animate-marquee-left gap-6">
                {[...imagesRow1, ...imagesRow1].map((item, i) => (
                  <GalleryCard
                    key={`row1-${i}`}
                    item={item}
                    onClick={() => setSelectedImage(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ROW 2 - Ke Kanan */}
          {imagesRow2.length > 0 && (
            <div className="relative flex overflow-hidden pause-on-hover">
              <div className="flex animate-marquee-right gap-6">
                {[...imagesRow2, ...imagesRow2].map((item, i) => (
                  <GalleryCard
                    key={`row2-${i}`}
                    item={item}
                    onClick={() => setSelectedImage(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ROW 3 - Ke Kiri */}
          {imagesRow3.length > 0 && (
            <div className="relative flex overflow-hidden pause-on-hover">
              <div className="flex animate-marquee-left gap-6">
                {[...imagesRow3, ...imagesRow3].map((item, i) => (
                  <GalleryCard
                    key={`row3-${i}`}
                    item={item}
                    onClick={() => setSelectedImage(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL DETAIL (LIGHTBOX) ================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300 backdrop-blur-md"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110] bg-white/10 p-2 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="bg-card w-full max-w-5xl max-h-full rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
            {/* IMAGE SIDE */}
            <div className="flex-[3] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="max-w-full max-h-[60vh] md:max-h-[85vh] object-contain"
              />
            </div>

            {/* INFO SIDE */}
            <div className="flex-[2] p-8 bg-card flex flex-col border-l border-border">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest w-fit mb-6">
                <Tag className="w-3 h-3" />
                {selectedImage.category}
              </div>

              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6 leading-tight">
                {selectedImage.title}
              </h3>

              <div className="space-y-6 py-6 border-y border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-gold" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-tighter opacity-60">
                      Tanggal Dokumentasi
                    </span>
                    <span className="text-sm font-medium">
                      {selectedImage.created_at
                        ? new Date(selectedImage.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" },
                          )
                        : "Arsip PW IKADI"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 text-muted-foreground">
                  <Info className="w-5 h-5 text-gold mt-1 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-tighter opacity-60">
                      Deskripsi
                    </span>
                    <p className="text-sm leading-relaxed">
                      Dokumentasi resmi PW IKADI Jawa Timur. Kegiatan ini
                      merupakan bagian dari komitmen kami dalam dakwah Islamiyah
                      di wilayah Jawa Timur.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 flex gap-3">
                <Button
                  className="flex-1 rounded-xl font-bold"
                  onClick={() => setSelectedImage(null)}
                >
                  Tutup
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl font-bold border-gold text-gold hover:bg-gold hover:text-white"
                  onClick={() => window.open(selectedImage.image_url, "_blank")}
                >
                  Buka Gambar Penuh
                </Button>
              </div>
            </div>
          </div>

          {/* BACKDROP CLICK TO CLOSE */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setSelectedImage(null)}
          />
        </div>
      )}
    </section>
  );
};

export default Galeri;
