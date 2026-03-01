import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function CategoryModals({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const slug = slugify(name);
  window.dispatchEvent(new Event("category-updated"));
  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);

    const { error } = await supabase.from("categories").insert({
      name,
      slug,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    onClose();
    onCreated?.();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* MODAL */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="font-display text-lg font-semibold mb-4">
          Tambah Kategori
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div>
            <label className="text-sm font-medium">Nama Kategori</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Akidah"
              className="mt-1 w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-600 outline-none"
            />
          </div>

          {/* SLUG PREVIEW */}
          <div>
            <label className="text-sm font-medium">Slug</label>
            <div className="mt-1 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
              {slug || "slug-otomatis"}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Batal
            </button>

            <button
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
