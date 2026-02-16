import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { slugify } from "@/lib/slug";
import RichEditor from "@/components/admin/RichEditor";
import { useAdmin } from "@/hooks/useAdmin";
import Swal from "sweetalert2";

type Event = {
  id?: string;
  title: string;
  excerpt: string | null;
  location: string | null;
  date: string | null;
  display_date: string | null;
  content: string;
  cover: string | null;
  published: boolean;
  publish_at?: string | null;
};

type Props = {
  onSaved: () => void;
  event?: Event | null;
};

const formatDisplayDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function EventForm({ onSaved, event }: Props) {
  const { admin } = useAdmin();
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [publishAt, setPublishAt] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setExcerpt(event.excerpt || "");
      setLocation(event.location || "");
      setDate(event.date || "");
      setDisplayDate(event.display_date || "");
      setContent(event.content || "");
      setPublished(event.published || false);
      setPublishAt(event.publish_at || "");
      setExistingCoverUrl(event.cover || null);
      setCoverFile(null);
    } else {
      setTitle("");
      setExcerpt("");
      setLocation("");
      setDate("");
      setDisplayDate("");
      setContent("");
      setPublished(false);
      setPublishAt("");
      setExistingCoverUrl(null);
      setCoverFile(null);
    }
  }, [event]);

  /* ================= AUTO DISPLAY DATE ================= */
  useEffect(() => {
    if (date) {
      setDisplayDate(formatDisplayDate(date));
    }
  }, [date]);

  /* ================= SAVE EVENT ================= */
  const save = async () => {
    const newErrors: { [key: string]: boolean } = {};

    if (!title.trim()) newErrors.title = true;
    if (!location.trim()) newErrors.location = true;
    if (!date) newErrors.date = true;
    if (!content.replace(/<[^>]*>/g, "").trim()) newErrors.content = true;
    if (!coverFile && !existingCoverUrl) newErrors.cover = true;

    setErrors(newErrors);

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
      setIsSaving(true);
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      let cover = existingCoverUrl;
      if (coverFile) {
        cover = await uploadImage(coverFile);
      }

      const payload = {
        title,
        slug: slugify(title),
        excerpt,
        location,
        date,
        display_date: displayDate,
        content,
        cover,
        published,
        publish_at:
          publishAt ||
          (event?.id ? event.publish_at : new Date().toISOString()),
      };

      if (event?.id) {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", event.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert({
          ...payload,
          author_id: admin?.id,
          scope: admin?.scope,
          daerah: admin?.daerah,
          daerah_slug: admin?.daerah_slug,
        });
        if (error) throw error;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        timer: 1500,
        showConfirmButton: false,
      });

      // ✅ RESET FORM FIELD DISINI
      if (!event) {
        // Jika mode "Tambah Baru", kosongkan semua field
        setTitle("");
        setContent("");
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-border p-4 rounded-lg space-y-4">
      {event && (
        <div className="inline-flex px-3 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium">
          ✏️ Mode Edit Event
        </div>
      )}

      {/* TITLE */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600 uppercase ml-1">
          Judul Event
        </label>
        <input
          className={`w-full border p-2 rounded transition-colors ${errors.title ? "border-red-500 bg-red-50" : "border-border"}`}
          placeholder="Judul event"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
          }}
        />
        {errors.title && (
          <p className="text-[10px] text-red-500 font-medium ml-1">
            Judul wajib diisi
          </p>
        )}
      </div>

      {/* LOCATION */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600 uppercase ml-1">
          Lokasi Event
        </label>
        <input
          className={`w-full border p-2 rounded transition-colors ${errors.location ? "border-red-500 bg-red-50" : "border-border"}`}
          placeholder="Lokasi (Gedung, Kota, atau Link Zoom)"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            if (errors.location)
              setErrors((prev) => ({ ...prev, location: false }));
          }}
        />
        {errors.location && (
          <p className="text-[10px] text-red-500 font-medium ml-1">
            Lokasi wajib diisi
          </p>
        )}
      </div>

      <div className="space-y-1">
        {/* EXCERPT */}
        <label className="text-xs font-bold text-slate-600 uppercase ml-1">
          RINGKASAN SINGKAT
        </label>
        <textarea
          className="w-full border p-2 rounded min-h-[80px]"
          placeholder="Ringkasan singkat event..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
      </div>

      {/* DATE SECTION */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 uppercase ml-1">
            Tanggal Pelaksanaan
          </label>
          <input
            type="date"
            className={`w-full border p-2 rounded transition-colors ${errors.date ? "border-red-500 bg-red-50" : "border-border"}`}
            value={date || ""}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: false }));
            }}
          />
          {errors.date && (
            <p className="text-[10px] text-red-500 font-medium ml-1">
              Tanggal wajib dipilih
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 uppercase ml-1">
            Display Date (Otomatis)
          </label>
          <input
            value={displayDate || ""}
            onChange={(e) => setDisplayDate(e.target.value)}
            className="w-full border rounded p-2 bg-slate-50 cursor-not-allowed"
            placeholder="Contoh: 12 Mei 2025"
            readOnly
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-1">
        <div
          className={`rounded-md transition-all ${errors.content ? "ring-2 ring-red-500 bg-red-50" : ""}`}
        >
          <RichEditor
            value={content}
            onChange={(val) => {
              setContent(val);
              if (errors.content)
                setErrors((prev) => ({ ...prev, content: false }));
            }}
          />
        </div>
        {errors.content && (
          <p className="text-[10px] text-red-500 font-medium ml-1">
            Isi konten event tidak boleh kosong
          </p>
        )}
      </div>

      {/* COVER DRAG DROP */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-emerald-800 ml-1">
          Cover Event
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
          className={`border-2 border-dashed rounded-xl py-8 px-5 flex flex-col items-center justify-center gap-4 transition-all ${
            errors.cover
              ? "border-red-400 bg-red-50"
              : "border-emerald-300 bg-emerald-50 hover:bg-emerald-100/50"
          }`}
        >
          {coverFile || existingCoverUrl ? (
            <div className="relative group">
              <img
                src={
                  coverFile ? URL.createObjectURL(coverFile) : existingCoverUrl!
                }
                className="w-48 h-32 object-cover rounded-lg shadow-md border-2 border-white"
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
              <p className="text-sm text-emerald-700 font-medium">
                Drag & drop cover event di sini
              </p>
              <p className="text-[11px] text-emerald-600/60 italic">
                Disarankan aspek rasio 16:9 atau 4:3
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
            className="px-5 py-2 text-xs font-bold rounded-full bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 shadow-sm transition active:scale-95"
          >
            Pilih Gambar
          </label>
        </div>
        {errors.cover && (
          <p className="text-[10px] text-red-500 font-medium ml-1 text-center">
            Gambar cover wajib diunggah
          </p>
        )}
      </div>

      {/* STATUS PUBLISH & TANGGAL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl border-slate-200">
          <div className="space-y-0.5">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Status Publikasi
              <span
                className={`px-2 py-0.5 text-[10px] rounded-full uppercase font-black ${published ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-600"}`}
              >
                {published ? "Live" : "Draft"}
              </span>
            </label>
            <p className="text-xs text-slate-500">
              Event akan{" "}
              {published
                ? "tampil di website publik"
                : "hanya tersimpan di admin"}
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
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ${published ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-2">
            <label className="block text-xs font-bold text-emerald-800 uppercase">
              Waktu Publikasi Konten
            </label>
            <input
              type="datetime-local"
              value={publishAt ? publishAt.slice(0, 16) : ""}
              onChange={(e) => setPublishAt(e.target.value)}
              className="border border-emerald-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={save}
          disabled={isSaving}
          className={`flex-1 bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-[0.98] ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-800 hover:shadow-emerald-200"}`}
        >
          {isSaving
            ? "Menyimpan..."
            : event
              ? "Update Event"
              : "Simpan & Publikasikan"}
        </button>
        {event && (
          <button
            type="button"
            onClick={() => onSaved()}
            className="px-6 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  );
}
