import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { slugify } from "@/lib/slug";
import Swal from "sweetalert2";

// Dataset 38 Kabupaten/Kota di Jawa Timur
const KOTA_KAB_JATIM = [
  "Kabupaten Bangkalan",
  "Kabupaten Banyuwangi",
  "Kabupaten Blitar",
  "Kabupaten Bojonegoro",
  "Kabupaten Bondowoso",
  "Kabupaten Gresik",
  "Kabupaten Jember",
  "Kabupaten Jombang",
  "Kabupaten Kediri",
  "Kabupaten Lamongan",
  "Kabupaten Lumajang",
  "Kabupaten Madiun",
  "Kabupaten Magetan",
  "Kabupaten Malang",
  "Kabupaten Mojokerto",
  "Kabupaten Nganjuk",
  "Kabupaten Ngawi",
  "Kabupaten Pacitan",
  "Kabupaten Pamekasan",
  "Kabupaten Pasuruan",
  "Kabupaten Ponorogo",
  "Kabupaten Probolinggo",
  "Kabupaten Sampang",
  "Kabupaten Sidoarjo",
  "Kabupaten Situbondo",
  "Kabupaten Sumenep",
  "Kabupaten Trenggalek",
  "Kabupaten Tuban",
  "Kabupaten Tulungagung",
  "Kota Batu",
  "Kota Blitar",
  "Kota Kediri",
  "Kota Madiun",
  "Kota Malang",
  "Kota Mojokerto",
  "Kota Pasuruan",
  "Kota Probolinggo",
  "Kota Surabaya",
];

// Sesuaikan dengan tipe data di ManageUsers
type UserAdmin = {
  id: string;
  name: string;
  role: string;
  scope: string;
  daerah: string | null;
  brand_name: string | null;
  brand_logo?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userData: UserAdmin | null;
};

export default function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  userData,
}: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("editor");
  const [scope, setScope] = useState("jatim");
  const [daerah, setDaerah] = useState("");
  const [daerahSlug, setDaerahSlug] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);

  // Auto-generate slug ketika daerah berubah
  useEffect(() => {
    if (daerah) {
      setDaerahSlug(slugify(daerah));
    } else {
      setDaerahSlug("");
    }
  }, [daerah]);

  // Prefill form ketika modal dibuka dan ada data user
  useEffect(() => {
    if (isOpen && userData) {
      setName(userData.name || "");
      setRole(userData.role || "editor");
      setScope(userData.scope || "jatim");
      setDaerah(userData.daerah || "");
      setBrandName(userData.brand_name || "");
      setExistingLogoUrl(userData.brand_logo || null);
      setBrandLogoFile(null);
    }
  }, [isOpen, userData]);

  if (!isOpen || !userData) return null;

  const handleSave = async () => {
    try {
      if (!name) throw new Error("Nama wajib diisi!");
      if (scope === "daerah" && !daerah)
        throw new Error("Pilih daerah cabang!");

      Swal.fire({
        title: "Menyimpan...",
        text: "Memperbarui data profil admin",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let brand_logo = existingLogoUrl;

      // Jika ada file logo baru yang diupload
      if (brandLogoFile) {
        brand_logo = await uploadImage(brandLogoFile);
      }

      // UPDATE ke tabel admins
      const { error } = await supabase
        .from("admins")
        .update({
          name,
          role,
          scope,
          daerah: scope === "daerah" ? daerah : null,
          daerah_slug: scope === "daerah" ? daerahSlug : null,
          brand_name: brandName || null,
          brand_logo,
        })
        .eq("id", userData.id);

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Profil admin berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER MODAL */}
        <div className="sticky top-0 bg-white/80 backdrop-blur border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-display font-semibold text-emerald-dark">
            Edit Profil Admin
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="p-6 space-y-5">
          {/* NAMA & ROLE */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                placeholder="Misal: Ahmad Fulan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* SCOPE & DAERAH */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Lingkup Kerja (Scope)
              </label>
              <select
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white"
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  if (e.target.value === "jatim") {
                    setDaerah("");
                    setDaerahSlug("");
                  }
                }}
              >
                <option value="jatim">Jatim (Pusat)</option>
                <option value="daerah">Daerah (Cabang)</option>
              </select>
            </div>

            {scope === "daerah" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pilih Daerah <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white"
                  value={daerah}
                  onChange={(e) => setDaerah(e.target.value)}
                >
                  <option value="" disabled>
                    -- Pilih Kota/Kabupaten --
                  </option>
                  {KOTA_KAB_JATIM.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* BRANDING */}
          <div className="border-t pt-5 mt-2">
            <h3 className="text-sm font-semibold text-emerald-800 mb-4">
              Pengaturan Branding
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Brand Institusi
                </label>
                <input
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  placeholder="Misal: IKADI Surabaya"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Logo Brand
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0])
                      setBrandLogoFile(e.dataTransfer.files[0]);
                  }}
                  className="border-2 border-dashed border-emerald-300 rounded-xl py-8 px-5 flex flex-col items-center justify-center gap-4 bg-emerald-50 hover:bg-emerald-100/50 transition"
                >
                  {brandLogoFile ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(brandLogoFile)}
                        className="w-40 h-28 object-contain rounded shadow-sm bg-white p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setBrandLogoFile(null)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full z-10 w-6 h-6 flex items-center justify-center text-xs shadow-md"
                      >
                        X
                      </button>
                    </div>
                  ) : existingLogoUrl ? (
                    <div className="relative">
                      <img
                        src={existingLogoUrl}
                        className="w-40 h-28 object-contain rounded shadow-sm bg-white p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setExistingLogoUrl(null)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full z-10 w-6 h-6 flex items-center justify-center text-xs shadow-md"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-emerald-700">
                      Drag & drop logo di sini
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="editBrandLogoUpload"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        setBrandLogoFile(e.target.files[0]);
                    }}
                  />
                  <label
                    htmlFor="editBrandLogoUpload"
                    className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 shadow-sm transition active:scale-95"
                  >
                    Pilih Gambar
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER MODAL */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium border rounded-lg hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-sm transition"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
