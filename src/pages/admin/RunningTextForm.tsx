import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

type RunningText = {
  id?: string;
  content: string;
  link?: string | null;
  is_published: boolean;
};

type Props = {
  item: RunningText | null;
  onSaved: () => void;
};

export default function RunningTextForm({ item, onSaved }: Props) {
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [published, setPublished] = useState(true);
  const [errors, setErrors] = useState<{ [k: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (item) {
      setContent(item.content || "");
      setLink(item.link || "");
      setPublished(item.is_published);
    } else {
      setContent("");
      setLink("");
      setPublished(true);
    }
  }, [item]);

  /* ================= SAVE ================= */
  const save = async () => {
    const newErrors: { [k: string]: boolean } = {};
    if (!content.trim()) newErrors.content = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return Swal.fire({
        icon: "error",
        title: "Isi running text wajib",
        timer: 1800,
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

      if (item?.id) {
        const { error } = await supabase
          .from("running_texts")
          .update({
            content,
            link: link || null,
            is_published: published,
          })
          .eq("id", item.id);

        if (error) throw error;
      } else {
        const { data } = await supabase
          .from("running_texts")
          .select("sort_order")
          .order("sort_order", { ascending: false })
          .limit(1)
          .single();

        const nextOrder = (data?.sort_order || 0) + 1;

        const { error } = await supabase.from("running_texts").insert({
          content,
          link: link || null,
          is_published: published,
          sort_order: nextOrder,
        });

        if (error) throw error;
      }

      Swal.fire({
        icon: "success",
        title: item ? "Running text diperbarui" : "Running text ditambahkan",
        timer: 1400,
        showConfirmButton: false,
      });

      /* reset jika tambah */
      if (!item) {
        setContent("");
        setLink("");
        setPublished(true);
        setErrors({});
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
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background border border-border p-4 rounded-lg space-y-4">
      {item && (
        <div className="inline-flex items-center px-3 py-1 rounded bg-amber-100 text-amber-800 text-xs font-medium italic">
          ✏️ Mode Edit Running Text
        </div>
      )}

      {/* CONTENT */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
          Isi Running Text
        </label>

        <textarea
          className={`w-full border border-border bg-background text-foreground
    p-3 rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-emerald-500/30
    ${errors.content ? "border-red-500 bg-red-50" : ""}`}
          placeholder="Contoh: Pendaftaran Dai 2026 telah dibuka"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) setErrors((p) => ({ ...p, content: false }));
          }}
        />

        {errors.content && (
          <p className="text-[10px] text-red-500 ml-1">
            Isi running text wajib diisi
          </p>
        )}
      </div>

      {/* LINK */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">
          Link (Opsional)
        </label>

        <input
          className="w-full border border-border bg-background text-foreground
    p-2 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          placeholder="/program/pembinaan"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

        <p className="text-[10px] text-muted-foreground ml-1">
          Bisa link internal atau eksternal
        </p>
      </div>

      {/* PUBLISH TOGGLE */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
        <div>
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
            Running text tampil di header website jika aktif
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
            className="w-12 h-6 bg-muted rounded-full peer
      peer-checked:bg-emerald-500
      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
      after:bg-white after:rounded-full after:h-5 after:w-5
      after:transition-colors peer-checked:after:translate-x-6"
          ></div>
        </label>
      </div>

      {/* ACTION */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={save}
          disabled={isSaving}
          className={`flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-sm transition
    ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"}`}
        >
          {isSaving
            ? "Menyimpan..."
            : item
              ? "Update Running Text"
              : "Tambah Running Text"}
        </button>

        {item && (
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
