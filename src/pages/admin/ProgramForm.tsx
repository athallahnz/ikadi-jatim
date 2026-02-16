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
    <div className="bg-white border border-border p-5 rounded-2xl space-y-5 shadow-sm">
      {program && (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider border border-amber-100">
          ✏️ Mode Edit Aktif
        </div>
      )}

      {/* INPUT JUDUL */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-black text-slate-400 ml-1">
          Judul Program
        </label>
        <input
          className={`w-full border p-3 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-emerald-500/20 ${
            errors.title ? "border-red-500 bg-red-50" : "border-slate-200"
          }`}
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
          <label className="text-[10px] uppercase font-black text-slate-400 ml-1">
            Urutan Tampil (Order)
          </label>
          <input
            type="number"
            className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={orderNum}
            onChange={(e) => setOrderNum(parseInt(e.target.value) || 0)}
          />
        </div>

        {/* SEARCHABLE ICON PICKER */}
        <div className="space-y-1 relative icon-picker-container">
          <label className="text-[10px] uppercase font-black text-slate-400 ml-1">
            Ikon Program
          </label>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between border border-slate-200 p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg">
                {renderIcon(selectedIcon, 18)}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {selectedIcon}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-3 border-b bg-slate-50 flex items-center gap-2">
                <Search size={14} className="text-slate-400" />
                <input
                  autoFocus
                  className="bg-transparent text-sm outline-none w-full"
                  placeholder="Cari ikon (User, Heart, dsb)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <X
                    size={14}
                    className="text-slate-400 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
              <div className="max-h-60 overflow-y-auto grid grid-cols-4 gap-2 p-3 scrollbar-thin scrollbar-thumb-slate-200">
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
                      className={`flex flex-col items-center justify-center p-3 rounded-xl transition cursor-pointer ${
                        selectedIcon === name
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                          : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                    >
                      {renderIcon(name, 22)}
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 py-8 text-center text-slate-400 text-xs italic">
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
        <label className="text-[10px] uppercase font-black text-slate-400 ml-1">
          Deskripsi Detail
        </label>
        <div
          className={`rounded-2xl overflow-hidden transition-all ${errors.description ? "ring-2 ring-red-500" : "border border-slate-200"}`}
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
      <div className="flex gap-3 pt-4 border-t border-slate-50">
        <button
          onClick={save}
          disabled={isSaving}
          className={`flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all transform active:scale-[0.98] ${
            isSaving
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-emerald-700 hover:shadow-emerald-200"
          }`}
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
            className="px-8 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  );
}
