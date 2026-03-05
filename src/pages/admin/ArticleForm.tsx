import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { slugify } from "@/lib/slug";
import RichEditor from "@/components/admin/RichEditor";
import { useAdmin } from "@/hooks/useAdmin";
import Swal from "sweetalert2";

type Article = {
  id?: string;
  title: string;
  content: string;
  cover_url: string | null;
  category_id?: string | null;
  published: boolean;
  publish_at?: string | null;
};

type Props = {
  onSaved: () => void;
  article?: Article | null;
};

type Category = {
  id: string;
  name: string;
};

export default function ArticleForm({ onSaved, article }: Props) {
  const { admin } = useAdmin();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [publishAt, setPublishAt] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name")
        .order("name");

      setCategories((data as Category[]) || []);
    };

    const reload = () => fetchCategories();
    window.addEventListener("category-updated", reload);
    return () => window.removeEventListener("category-updated", reload);
  }, []);

  /* ================= PREFILL EDIT ================= */
  useEffect(() => {
    if (article) {
      setTitle(article.title || "");
      setContent(article.content || "");
      setPublished(article.published || false);
      setPublishAt(article.publish_at || "");
      setCategoryId(article.category_id || "");
      setExistingCoverUrl(article.cover_url || null);
      setCoverFile(null);
    } else {
      setTitle("");
      setContent("");
      setPublished(false);
      setCategoryId("");
      setExistingCoverUrl(null);
      setCoverFile(null);
    }
  }, [article]);

  const save = async () => {
    const newErrors: { [key: string]: boolean } = {};

    if (!title.trim()) newErrors.title = true;
    if (!categoryId) newErrors.categoryId = true;
    if (!content.replace(/<[^>]*>/g, "").trim()) newErrors.content = true;
    // if (!coverFile && !existingCoverUrl) newErrors.cover = true;

    setErrors(newErrors);

    // Jika ada error, berhenti dan beri peringatan
    if (Object.keys(newErrors).length > 0) {
      return Swal.fire({
        icon: "error",
        title: "Data Belum Lengkap",
        text: "Harap isi semua field yang ditandai merah.",
        timer: 2000,
        showConfirmButton: false,
      });
    }

    try {
      // 1. Set isSaving true di awal proses
      setIsSaving(true);

      // Tampilkan loading alert
      Swal.fire({
        title: "Menyimpan...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Gunakan URL lama (existingCoverUrl) jika tidak ada file baru yang diunggah
      let cover_url = existingCoverUrl;

      if (coverFile) {
        cover_url = await uploadImage(coverFile);
      }

      if (article?.id) {
        const { error } = await supabase
          .from("articles")
          .update({
            title,
            slug: slugify(title),
            content,
            cover_url,
            published,
            publish_at: publishAt || null,
            category_id: categoryId || null,
          })
          .eq("id", article.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert({
          title,
          slug: slugify(title),
          content,
          cover_url,
          published,
          publish_at: publishAt || new Date().toISOString(),
          category_id: categoryId || null,
          author_id: admin?.id,
          scope: admin?.scope,
          daerah: admin?.daerah,
          daerah_slug: admin?.daerah_slug,
        });

        if (error) throw error;
      }

      // Tampilkan success alert
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Artikel berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });

      // ✅ RESET FORM FIELD DISINI
      if (!article) {
        // Jika mode "Tambah Baru", kosongkan semua field
        setTitle("");
        setContent("");
        setCategoryId("");
        setCoverFile(null);
        setExistingCoverUrl(null);
        setPublished(false);
        setPublishAt("");
        setErrors({}); // Bersihkan tanda merah error
      }

      onSaved();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui.";

      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: errorMessage,
      });

      console.error("Error saving data:", error);
    } finally {
      // 2. Apapun hasilnya (sukses/gagal), kembalikan isSaving ke false
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border p-4 rounded-lg space-y-4">
      {article && (
        <div className="inline-flex items-center px-3 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium italic">
          ✏️ Mode Edit Artikel
        </div>
      )}

      {/* CATEGORY */}
      {/* CATEGORY */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
          Pilih Kategori
        </label>

        <select
          className={`w-full p-2 rounded-lg border border-border bg-background text-foreground
    transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40
    ${errors.categoryId ? "border-red-500 bg-red-50" : ""}`}
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            if (errors.categoryId)
              setErrors((prev) => ({ ...prev, categoryId: false }));
          }}
        >
          <option value="">Pilih kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {errors.categoryId && (
          <p className="text-[10px] text-red-500 font-medium ml-1">
            Kategori wajib dipilih
          </p>
        )}
      </div>

      {/* TITLE */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
          Judul Artikel
        </label>

        <input
          className={`w-full p-2 rounded-lg border border-border bg-background text-foreground
    placeholder:text-muted-foreground transition-colors
    focus:outline-none focus:ring-2 focus:ring-emerald-500/40
    ${errors.title ? "border-red-500 bg-red-50" : ""}`}
          placeholder="Judul artikel"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
          }}
        />

        {errors.title && (
          <p className="text-[10px] text-red-500 font-medium ml-1">
            Judul tidak boleh kosong
          </p>
        )}
      </div>

      {/* CONTENT */}
      <div className="space-y-1">
        <div
          className={`rounded-lg transition-colors ${
            errors.content ? "ring-2 ring-red-500" : ""
          }`}
        >
          <RichEditor
            value={content}
            onChange={(val) => {
              setContent(val);
              if (errors.content)
                setErrors((prev) => ({ ...prev, content: false }));
            }}
            className="min-h-[220px]"
          />
        </div>

        {errors.content && (
          <p className="text-[10px] text-red-500 font-medium ml-1">
            Isi artikel tidak boleh kosong
          </p>
        )}
      </div>

      {/* COVER */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
          Cover Artikel
        </label>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) {
              setCoverFile(e.dataTransfer.files[0]);
              setErrors((prev) => ({ ...prev, cover: false }));
            }
          }}
          className={`border-2 border-dashed rounded-xl py-8 px-5 flex flex-col items-center justify-center gap-4 transition-colors
    ${
      errors.cover
        ? "border-red-400 bg-red-50"
        : "border-border bg-muted hover:bg-muted/70"
    }`}
        >
          {coverFile || existingCoverUrl ? (
            <div className="relative group">
              <img
                src={
                  coverFile ? URL.createObjectURL(coverFile) : existingCoverUrl!
                }
                className="w-48 h-32 object-cover rounded-lg shadow-md border border-border"
                alt="Preview"
              />

              <button
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setExistingCoverUrl(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-foreground font-medium">
                Drag & drop gambar atau klik tombol di bawah
              </p>

              <p className="text-xs text-muted-foreground italic mt-1">
                Saran: Gunakan rasio 16:9
              </p>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="coverUpload"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setCoverFile(e.target.files[0]);
                setErrors((prev) => ({ ...prev, cover: false }));
              }
            }}
          />

          <label
            htmlFor="coverUpload"
            className="px-6 py-2 text-sm font-bold rounded-full bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 shadow-sm transition"
          >
            Pilih Gambar
          </label>
        </div>

        {errors.cover && (
          <p className="text-[10px] text-red-500 font-medium ml-1">
            Gambar cover wajib ada
          </p>
        )}
      </div>

      {/* STATUS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-inner">
          <div className="space-y-0.5">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              Status Publikasi
              <span
                className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-black
          ${
            published
              ? "bg-emerald-500 text-white"
              : "bg-muted text-muted-foreground"
          }`}
              >
                {published ? "Live" : "Draft"}
              </span>
            </label>

            <p className="text-xs text-muted-foreground italic">
              Konten akan{" "}
              {published
                ? "muncul di halaman depan"
                : "disimpan secara internal"}
              .
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />

            <div
              className="w-12 h-6 bg-muted rounded-full peer peer-checked:bg-emerald-500
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:rounded-full after:h-5 after:w-5
        after:transition-colors peer-checked:after:translate-x-6"
            ></div>
          </label>
        </div>

        {/* SCHEDULE */}
        <div
          className={`overflow-hidden transition-colors duration-500 ${
            published ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-muted p-3 rounded-xl border border-border space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              Jadwal Tayang
            </label>

            <input
              type="datetime-local"
              value={publishAt ? publishAt.slice(0, 16) : ""}
              onChange={(e) => setPublishAt(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 w-full text-sm
        bg-background text-foreground
        focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={save}
          disabled={isSaving}
          className={`flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-sm transition
    ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"}`}
        >
          {isSaving
            ? "Menyimpan..."
            : article
              ? "Update Artikel"
              : "Terbitkan Sekarang"}
        </button>

        {article && (
          <button
            type="button"
            onClick={() => onSaved()}
            className="px-6 py-3 border border-border rounded-xl font-bold
      text-muted-foreground hover:bg-muted transition"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  );
}
