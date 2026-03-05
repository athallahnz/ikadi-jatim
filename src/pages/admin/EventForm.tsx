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
    <div className="bg-background border border-border p-4 rounded-lg space-y-4">
      {event && (
        <div className="inline-flex px-3 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium">
          ✏️ Mode Edit Event
        </div>
      )}

      {/* TITLE */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
          Judul Event
        </label>

        <input
          className={`w-full border border-border bg-background text-foreground
    p-2 rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-emerald-500/30
    ${errors.title ? "border-red-500 bg-red-50" : ""}`}
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
        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
          Lokasi Event
        </label>

        <input
          className={`w-full border border-border bg-background text-foreground
    p-2 rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-emerald-500/30
    ${errors.location ? "border-red-500 bg-red-50" : ""}`}
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
        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
          Ringkasan Singkat
        </label>

        <textarea
          className="w-full border border-border bg-background text-foreground
    p-2 rounded-lg min-h-[80px]
    focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          placeholder="Ringkasan singkat event..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
      </div>

      {/* DATE SECTION */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
            Tanggal Pelaksanaan
          </label>

          <input
            type="date"
            className={`w-full border border-border bg-background text-foreground
      p-2 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-emerald-500/30
      ${errors.date ? "border-red-500 bg-red-50" : ""}`}
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
          <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
            Display Date
          </label>

          <input
            value={displayDate || ""}
            readOnly
            className="w-full border border-border bg-muted text-muted-foreground
      rounded-lg p-2 cursor-not-allowed"
          />
        </div>
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
          />
        </div>

        {errors.content && (
          <p className="text-[10px] text-red-500 font-medium ml-1">
            Isi konten event tidak boleh kosong
          </p>
        )}
      </div>

      {/* COVER */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
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
                Drag & drop cover event di sini
              </p>
              <p className="text-xs text-muted-foreground italic">
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
            className="px-5 py-2 text-xs font-bold rounded-full bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 shadow-sm transition"
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

      {/* STATUS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
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

            <p className="text-xs text-muted-foreground">
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

            <div
              className="w-11 h-6 bg-muted rounded-full peer
        peer-checked:bg-emerald-500
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:rounded-full after:h-5 after:w-5
        after:transition-colors peer-checked:after:translate-x-full"
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
            <label className="block text-xs font-bold text-muted-foreground uppercase">
              Waktu Publikasi Konten
            </label>

            <input
              type="datetime-local"
              value={publishAt ? publishAt.slice(0, 16) : ""}
              onChange={(e) => setPublishAt(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 w-full
        bg-background text-foreground
        focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={save}
          disabled={isSaving}
          className={`flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-sm transition
    ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"}`}
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
