import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import RichEditor from "@/components/admin/RichEditor";
import Swal from "sweetalert2";
import * as LucideIcons from "lucide-react";
import { LucideProps, HelpCircle, Search, X, ChevronDown } from "lucide-react";

/* ================= TYPES ================= */
type Program = {
  id?: string;
  title: string;
  description: string;
  icon: string | null;
  order_num: number;
};

type Props = {
  onSaved: () => void;
  program?: Program | null;
};

// Tipe khusus untuk komponen Ikon Lucide agar Type-Safe
type LucideIconComponent = React.ForwardRefExoticComponent<
  LucideProps & React.RefAttributes<SVGSVGElement>
>;

// Casting library ke Record yang aman tanpa menggunakan 'any'
const IconsRecord = LucideIcons as unknown as Record<
  string,
  LucideIconComponent
>;

// Ambil semua nama ikon, tapi buang fungsi internal Lucide
const allIconNames = Object.keys(IconsRecord).filter((key) => {
  const Icon = IconsRecord[key];
  return (
    (typeof Icon === "function" ||
      (typeof Icon === "object" && Icon !== null && "render" in Icon)) &&
    !key.startsWith("Lucide") &&
    key !== "createLucideIcon" &&
    key !== "default"
  );
}) as Array<keyof typeof LucideIcons>;

export default function ProgramForm({ onSaved, program }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderNum, setOrderNum] = useState<number>(0);

  // States untuk Icon Picker
  const [selectedIcon, setSelectedIcon] = useState<string>("HeartHandshake");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Filter ikon berdasarkan input pencarian (Optimized with useMemo)
  const filteredIcons = useMemo(() => {
    const filtered = allIconNames.filter((name) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    // Tampilkan semua jika searching, limit 200 jika default agar performa ringan
    return searchTerm ? filtered : filtered.slice(0, 200);
  }, [searchTerm]);

  /* ================= SIDE EFFECTS ================= */
  // Prefill data saat mode edit
  useEffect(() => {
    if (program) {
      setTitle(program.title || "");
      setDescription(program.description || "");
      setOrderNum(program.order_num || 0);
      setSelectedIcon(program.icon || "HeartHandshake");
    } else {
      setTitle("");
      setDescription("");
      setOrderNum(0);
      setSelectedIcon("HeartHandshake");
    }
  }, [program]);

  // Close dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        !(event.target as Element).closest(".icon-picker-container")
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  /* ================= SAVE LOGIC ================= */
  const save = async () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!title.trim()) newErrors.title = true;
    if (!description.replace(/<[^>]*>/g, "").trim())
      newErrors.description = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return Swal.fire({
        icon: "error",
        title: "Data Belum Lengkap",
        text: "Harap isi judul dan deskripsi program.",
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

      const payload = {
        title,
        description,
        icon: selectedIcon,
        order_num: orderNum,
      };

      if (program?.id) {
        const { error } = await supabase
          .from("programs")
          .update(payload)
          .eq("id", program.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("programs").insert(payload);
        if (error) throw error;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Program berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });

      if (!program) {
        setTitle("");
        setDescription("");
        setOrderNum(0);
        setSelectedIcon("HeartHandshake");
        setSearchTerm("");
      }
      onSaved();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= HELPERS ================= */
  const renderIcon = (name: string, size = 20) => {
    const IconComponent = IconsRecord[name];

    // Jika IconComponent bukan fungsi atau objek render, kembalikan fallback
    if (!IconComponent || typeof IconComponent === "string") {
      return <HelpCircle size={size} />;
    }

    try {
      // Merender sebagai komponen
      return <IconComponent size={size} />;
    } catch (e) {
      console.error("Gagal render ikon:", name, e);
      return <HelpCircle size={size} />;
    }
  };

  return (
    <div className="bg-background border border-border p-5 rounded-2xl space-y-5 shadow-sm">
      {program && (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-wider border border-amber-100">
          ✏️ Mode Edit Aktif
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs uppercase font-black text-muted-foreground ml-1">
          Judul Program
        </label>

        <input
          className={`w-full border border-border bg-background text-foreground
    p-3 rounded-xl text-sm transition-all outline-none
    focus:ring-2 focus:ring-emerald-500/20
    ${errors.title ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""}`}
          placeholder="Contoh: Penguatan Ukhuwah Da'i"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* INPUT URUTAN */}
        <div className="space-y-1">
          <label className="text-xs uppercase font-black text-muted-foreground ml-1">
            Urutan Tampil (Order)
          </label>

          <input
            type="number"
            className="w-full border border-border bg-background text-foreground
      p-3 rounded-xl text-sm outline-none
      focus:ring-2 focus:ring-emerald-500/20"
            value={orderNum}
            onChange={(e) => setOrderNum(parseInt(e.target.value) || 0)}
          />
        </div>

        {/* SEARCHABLE ICON PICKER */}
        <div className="space-y-1 relative icon-picker-container">
          <label className="text-xs uppercase font-black text-muted-foreground ml-1">
            Ikon Program
          </label>

          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between border border-border
      p-3 rounded-xl cursor-pointer hover:bg-muted transition bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="text-emerald-600 bg-emerald-500/10 p-1.5 rounded-lg">
                {renderIcon(selectedIcon, 18)}
              </div>

              <span className="text-sm font-semibold text-foreground">
                {selectedIcon}
              </span>
            </div>

            <ChevronDown
              size={16}
              className={`text-muted-foreground transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isDropdownOpen && (
            <div
              className="absolute z-[100] top-full left-0 right-0 mt-2
      bg-card border border-border rounded-2xl shadow-xl overflow-hidden
      animate-in fade-in zoom-in duration-200"
            >
              <div className="p-3 border-b border-border bg-muted flex items-center gap-2">
                <Search size={14} className="text-muted-foreground" />

                <input
                  autoFocus
                  className="bg-transparent text-sm outline-none w-full text-foreground"
                  placeholder="Cari ikon (User, Heart, dsb)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />

                {searchTerm && (
                  <X
                    size={14}
                    className="text-muted-foreground cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>

              <div className="max-h-60 overflow-y-auto grid grid-cols-4 gap-2 p-3">
                {filteredIcons.length > 0 ? (
                  filteredIcons.map((name) => (
                    <div
                      key={name}
                      title={name}
                      onClick={() => {
                        setSelectedIcon(name);
                        setIsDropdownOpen(false);
                        setSearchTerm("");
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl transition cursor-pointer
                ${
                  selectedIcon === name
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "text-muted-foreground hover:bg-muted hover:text-emerald-600"
                }`}
                    >
                      {renderIcon(name, 22)}
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 py-8 text-center text-muted-foreground text-xs italic">
                    Ikon tidak ditemukan...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDITOR DESKRIPSI */}
      <div className="space-y-1">
        <label className="text-xs uppercase font-black text-muted-foreground ml-1">
          Deskripsi Detail
        </label>

        <div
          className={`rounded-2xl overflow-hidden transition-all
    ${errors.description ? "ring-2 ring-red-500" : "border border-border"}`}
        >
          <RichEditor
            value={description}
            onChange={(val) => {
              setDescription(val);
              if (errors.description)
                setErrors((prev) => ({ ...prev, description: false }));
            }}
          />
        </div>
      </div>

      {/* TOMBOL AKSI */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={save}
          disabled={isSaving}
          className={`flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl
    shadow-sm transition-all transform active:scale-[0.98]
    ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"}`}
        >
          {isSaving
            ? "Menyimpan..."
            : program
              ? "Perbarui Program"
              : "Publikasikan Program"}
        </button>

        {program && (
          <button
            type="button"
            onClick={() => onSaved()}
            className="px-8 py-4 border border-border rounded-2xl
      font-bold text-muted-foreground hover:bg-muted transition-all"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  );
}
