import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import Swal from "sweetalert2";
import { Trash2, UploadCloud, Plus } from "lucide-react";

type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
};

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kegiatan");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title)
      return Swal.fire("Error", "Isi judul dan pilih gambar", "error");

    try {
      setUploading(true);
      Swal.fire({
        title: "Mengunggah...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const url = await uploadImage(file);

      const { error } = await supabase.from("gallery").insert({
        title,
        category,
        image_url: url,
      });

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        timer: 1500,
        showConfirmButton: false,
      });
      setTitle("");
      setFile(null);
      fetchGallery();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    const res = await Swal.fire({
      title: "Hapus Foto?",
      text: "Tindakan ini tidak bisa dibatalkan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });

    if (res.isConfirmed) {
      const { error } = await supabase
        .from("gallery")
        .delete()
        .eq("id", item.id);
      if (!error) {
        Swal.fire("Terhapus", "", "success");
        fetchGallery();
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* FORM UPLOAD */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <Plus size={20} /> Tambah Foto Galeri
          </h3>
          <form onSubmit={handleUpload} className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Judul Foto"
              className="border p-2 rounded-lg outline-emerald-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              className="border p-2 rounded-lg outline-emerald-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Kegiatan">Kegiatan</option>
              <option value="Agenda">Agenda</option>
              <option value="Dokumentasi">Dokumentasi</option>
            </select>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="gal-upload"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="gal-upload"
                className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-lg cursor-pointer transition ${file ? "border-emerald-500 bg-emerald-50" : "border-slate-300"}`}
              >
                <UploadCloud size={18} /> {file ? "Siap Unggah" : "Pilih Foto"}
              </label>
              <button
                disabled={uploading}
                className="bg-emerald-600 text-white px-6 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>

        {/* LIST GALLERY */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading
            ? [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-slate-100 animate-pulse rounded-xl"
                />
              ))
            : items.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-xl overflow-hidden aspect-video border"
                >
                  <img
                    src={item.image_url}
                    className="w-full h-full object-cover"
                    alt={item.title}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-2 text-center">
                    <p className="text-white text-xs font-bold mb-2">
                      {item.title}
                    </p>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </AdminLayout>
  );
}
