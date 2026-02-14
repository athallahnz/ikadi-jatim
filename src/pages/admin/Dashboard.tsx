import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";
// Pastikan kamu sudah install lucide-react (npm install lucide-react)
import { FileText, Calendar, Image as ImageIcon, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { admin } = useAdmin();
  const [counts, setCounts] = useState({
    articles: 0,
    events: 0,
    galleries: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      // Menggunakan { count: 'exact', head: true } agar Supabase hanya mengembalikan jumlah angkanya saja, bukan isi datanya
      let articleQuery = supabase
        .from("articles")
        .select("*", { count: "exact", head: true });
      let eventQuery = supabase
        .from("events")
        .select("*", { count: "exact", head: true });
      let galleryQuery = supabase
        .from("gallery")
        .select("*", { count: "exact", head: true }); // Sesuaikan nama tabel galeri kamu (gallery / galleries)

      // Filter berdasarkan scope jika admin bukan pusat
      if (admin?.scope === "daerah") {
        articleQuery = articleQuery.eq("daerah_slug", admin.daerah_slug);
        eventQuery = eventQuery.eq("daerah_slug", admin.daerah_slug);
        galleryQuery = galleryQuery.eq("daerah_slug", admin.daerah_slug);
      }

      // Jalankan query secara paralel agar lebih cepat
      const [resArticles, resEvents, resGallery] = await Promise.all([
        articleQuery,
        eventQuery,
        galleryQuery,
      ]);

      setCounts({
        articles: resArticles.count || 0,
        events: resEvents.count || 0,
        galleries: resGallery.count || 0,
      });
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    if (admin) fetchCounts();
  }, [admin, fetchCounts]);

  return (
    <AdminLayout>
      {/* HEADER / WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-dark text-white p-8 mb-8 islamic-pattern shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-semibold mb-2">
            Ahlan wa Sahlan, {admin?.name || "Admin"}
          </h1>
          <p className="text-emerald-100 max-w-xl font-sans text-sm md:text-base">
            Selamat datang di panel manajemen Ikadi Jawa Timur. Berikut adalah
            ringkasan total publikasi yang ada di sistem saat ini.
          </p>
        </div>

        {/* Ornamen emas di bawah */}
        <div className="absolute bottom-0 left-0 w-32 h-1 bg-gold"></div>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* STATS GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* CARD ARTIKEL */}
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 bg-emerald-50 w-24 h-24 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 font-sans">
                Total Artikel
              </div>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-emerald-dark mt-2" />
              ) : (
                <div className="text-4xl font-display font-bold text-emerald-dark">
                  {counts.articles}
                </div>
              )}
            </div>
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl shadow-sm">
              <FileText size={28} />
            </div>
          </div>
        </div>

        {/* CARD EVENT */}
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 bg-amber-50 w-24 h-24 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 font-sans">
                Total Event
              </div>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-amber-600 mt-2" />
              ) : (
                <div className="text-4xl font-display font-bold text-emerald-dark">
                  {counts.events}
                </div>
              )}
            </div>
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl shadow-sm">
              <Calendar size={28} />
            </div>
          </div>
        </div>

        {/* CARD GALERI */}
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 bg-blue-50 w-24 h-24 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 font-sans">
                Total Galeri
              </div>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mt-2" />
              ) : (
                <div className="text-4xl font-display font-bold text-emerald-dark">
                  {counts.galleries}
                </div>
              )}
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
              <ImageIcon size={28} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
