import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import Swal from "sweetalert2";
import {
  Trash2,
  UploadCloud,
  Plus,
  Image as ImageIcon,
  X,
  Edit3,
  Filter,
} from "lucide-react";

type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
};

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");

  // Form & Edit States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kegiatan");
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const categories = ["Semua", "Kegiatan", "Agenda", "Dokumentasi"];

  const fetchGallery = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
    setFilteredItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Handle Filtering
  useEffect(() => {
    if (activeFilter === "Semua") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.category === activeFilter));
    }
  }, [activeFilter, items]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: boolean } = {};
    if (!title.trim()) newErrors.title = true;
    if (!file && !editingId) newErrors.file = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSaving(true);
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      let finalImageUrl = items.find((i) => i.id === editingId)?.image_url;

      if (file) {
        finalImageUrl = await uploadImage(file);
        if (!finalImageUrl) throw new Error("Gagal mengunggah gambar.");
      }

      if (editingId) {
        const { error } = await supabase
          .from("gallery")
          .update({ title, category, image_url: finalImageUrl })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("gallery")
          .insert({ title, category, image_url: finalImageUrl });
        if (error) throw error;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        timer: 1500,
        showConfirmButton: false,
      });
      resetForm();
      fetchGallery();
    } catch (error: unknown) {
      // Mengatasi ESLint @typescript-eslint/no-explicit-any
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";

      Swal.fire({ icon: "error", title: "Gagal", text: errorMessage });

      // Kosongkan form field ketika error
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setFile(null); // Reset file input saat edit
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    // Tambahkan cleanup URL jika perlu (opsional)
    if (file) URL.revokeObjectURL(URL.createObjectURL(file));

    setEditingId(null);
    setTitle("");
    setCategory("Kegiatan");
    setFile(null);
    setErrors({});
  };

  const handleDelete = async (item: GalleryItem) => {
    const res = await Swal.fire({
      title: "Hapus Foto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
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
      <div className="mb-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-foreground">
            Management Gallery
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Kelola foto kegiatan dan dokumentasi organisasi.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* FORM */}
          <div className="lg:col-span-1 bg-card p-5 rounded-2xl border border-border shadow-sm space-y-5 sticky top-6">
            <h3 className="text-md font-bold text-foreground flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-2">
                {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
                {editingId ? "Edit Foto" : "Tambah Foto Baru"}
              </span>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-[10px] bg-muted px-2 py-1 rounded text-foreground hover:bg-muted/70"
                >
                  Batal Edit
                </button>
              )}
            </h3>

            <div className="space-y-4">
              {/* TITLE */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Judul Photo
                </label>

                <input
                  type="text"
                  className={`w-full border border-border bg-background text-foreground p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                    errors.title ? "border-red-500 bg-red-50" : ""
                  }`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul Photo"
                />
              </div>

              {/* CATEGORY */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Kategori
                </label>

                <select
                  className="w-full border border-border bg-background text-foreground p-2.5 rounded-xl text-sm outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories
                    .filter((c) => c !== "Semua")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              {/* FILE */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  File Gambar
                </label>

                <div
                  className={`border-2 border-dashed rounded-2xl p-4 transition-all ${
                    errors.file
                      ? "border-red-400 bg-red-50"
                      : "border-border bg-muted"
                  }`}
                >
                  {file || (editingId && !file) ? (
                    <div className="relative group">
                      <img
                        src={
                          file
                            ? URL.createObjectURL(file)
                            : items.find((i) => i.id === editingId)?.image_url
                        }
                        className="w-full h-32 object-cover rounded-xl border border-border"
                        alt="Preview"
                      />

                      <label
                        htmlFor="gal-upload"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs cursor-pointer rounded-xl transition-opacity"
                      >
                        Ganti Foto
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="gal-upload"
                      className="cursor-pointer flex flex-col items-center py-4 text-muted-foreground"
                    >
                      <UploadCloud size={30} className="mb-1" />
                      <p className="text-[10px] font-bold">
                        Pilih atau Drag Foto
                      </p>
                    </label>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="gal-upload"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>

                {editingId && (
                  <p className="text-[10px] text-muted-foreground italic mt-1">
                    *Kosongkan jika tidak ingin mengganti gambar
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                {isSaving
                  ? "Proses..."
                  : editingId
                    ? "Update Data"
                    : "Simpan ke Galeri"}
              </button>
            </div>
          </div>

          {/* LIST */}
          <div className="lg:col-span-2 space-y-6">
            {/* FILTER */}
            <div className="flex flex-wrap items-center gap-2 bg-muted p-1.5 rounded-2xl border border-border">
              <div className="flex items-center gap-2 px-3 text-muted-foreground border-r border-border mr-1">
                <Filter size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Filter
                </span>
              </div>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all
            ${
              activeFilter === cat
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:bg-muted/70"
            }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-muted animate-pulse rounded-2xl"
                    />
                  ))
                : filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm"
                    >
                      <img
                        src={item.image_url}
                        className="w-full aspect-square object-cover transition duration-500 group-hover:scale-105"
                        alt={item.title}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <span className="text-[10px] font-black text-emerald-400 uppercase">
                          {item.category}
                        </span>

                        <p className="text-white text-xs font-bold leading-tight mb-3 line-clamp-2">
                          {item.title}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="flex-1 py-2 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-md transition flex items-center justify-center"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(item)}
                            className="flex-1 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition flex items-center justify-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-20 bg-muted rounded-2xl border border-dashed border-border text-muted-foreground">
                <p className="text-sm">Tidak ada foto dalam kategori ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
