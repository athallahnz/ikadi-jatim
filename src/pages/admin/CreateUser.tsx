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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateUser({ isOpen, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("editor");
  const [scope, setScope] = useState("jatim");
  const [daerah, setDaerah] = useState("");
  const [daerahSlug, setDaerahSlug] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);

  // ✅ State khusus untuk menampung pesan error per-field
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (daerah) {
      setDaerahSlug(slugify(daerah));
    } else {
      setDaerahSlug("");
    }
  }, [daerah]);

  // Reset form dan error ketika modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setName("");
      setRole("editor");
      setScope("jatim");
      setDaerah("");
      setDaerahSlug("");
      setBrandName("");
      setBrandLogoFile(null);
      setErrors({}); // Bersihkan error
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ✅ Fungsi Validasi Form (Dipanggil sebelum save)
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validasi Email (Cek kosong & format Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email wajib diisi.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Format email tidak valid.";
    }

    // Validasi Password
    if (!password) {
      newErrors.password = "Password wajib diisi.";
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter.";
    }

    // Validasi Nama
    if (!name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi.";
    }

    // Validasi Daerah
    if (scope === "daerah" && !daerah) {
      newErrors.daerah = "Pilih daerah cabang untuk scope ini.";
    }

    setErrors(newErrors);

    // Jika tidak ada error (panjang keys = 0), kembalikan true
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // ✅ Jalankan validasi, jika gagal hentikan proses
    if (!validateForm()) return;

    try {
      Swal.fire({
        title: "Memproses...",
        text: "Mendaftarkan akun dan menyimpan profil",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // 1. DAFTARKAN VIA SUPABASE EDGE FUNCTION
      const { data: authData, error: authError } =
        await supabase.functions.invoke("create-admin-user", {
          body: { email, password },
        });

      if (authError || authData?.error) {
        throw new Error(
          authData?.error || "Gagal mendaftarkan akun di server.",
        );
      }

      const newUserId = authData.user.id;

      // 2. UPLOAD LOGO BRAND
      let brand_logo = null;
      if (brandLogoFile) {
        brand_logo = await uploadImage(brandLogoFile);
      }

      // 3. SIMPAN PROFIL KE TABEL admins
      const { error: dbError } = await supabase.from("admins").upsert({
        id: newUserId,
        email: email,
        name,
        role,
        scope,
        daerah: scope === "daerah" ? daerah : null,
        daerah_slug: scope === "daerah" ? daerahSlug : null,
        brand_name: brandName || null,
        brand_logo,
        status: "pending",
      });

      if (dbError) {
        throw dbError;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Akun admin baru siap digunakan.",
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

  // Helper function untuk membersihkan error saat user mulai mengetik lagi
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER MODAL */}
        <div className="sticky top-0 bg-card/90 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Tambah Akun Admin Baru
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
          {/* SECTION AKUN LOGIN */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full border bg-background text-foreground p-2.5 rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-border focus:ring-emerald-500/30"
                }`}
                placeholder="email@ikadi.or.id"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
              />
              {/* Pesan Error Email */}
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className={`w-full border bg-background text-foreground p-2.5 rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-border focus:ring-emerald-500/30"
                }`}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
              />
              {/* Pesan Error Password */}
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <hr className="border-border border-dashed" />

          {/* PROFIL ADMIN */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full border bg-background text-foreground p-2.5 rounded-lg focus:outline-none focus:ring-2 transition ${errors.name ? "border-red-500 focus:ring-red-500/30" : "border-border focus:ring-emerald-500/30"}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("name");
                }}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <select
                className="w-full border border-border bg-background text-foreground p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="editor">Editor</option>
                <option value="konsultan">Konsultan (Asatidz)</option>{" "}
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* SCOPE */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Lingkup Kerja (Scope)
              </label>
              <select
                className="w-full border border-border bg-background text-foreground p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  if (e.target.value === "jatim") {
                    setDaerah("");
                    setDaerahSlug("");
                    clearError("daerah");
                  }
                }}
              >
                <option value="jatim">Jatim (Pusat)</option>
                <option value="daerah">Daerah (Cabang)</option>
              </select>
            </div>

            {scope === "daerah" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Pilih Daerah <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full border bg-background text-foreground p-2.5 rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.daerah
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-border focus:ring-emerald-500/30"
                  }`}
                  value={daerah}
                  onChange={(e) => {
                    setDaerah(e.target.value);
                    clearError("daerah");
                  }}
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
                {/* Pesan Error Daerah */}
                {errors.daerah && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.daerah}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* BRANDING */}
          <div className="border-t border-border pt-5 mt-2">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Pengaturan Branding (Opsional)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nama Brand Institusi
                </label>
                <input
                  className="w-full border border-border bg-background text-foreground p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
                  placeholder="Misal: IKADI Surabaya"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Logo Brand
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0])
                      setBrandLogoFile(e.dataTransfer.files[0]);
                  }}
                  className="border-2 border-dashed border-border rounded-xl py-8 px-5 flex flex-col items-center justify-center gap-4 bg-muted hover:bg-muted/70 transition"
                >
                  {brandLogoFile ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(brandLogoFile)}
                        className="w-40 h-28 object-contain rounded shadow-sm bg-background p-1"
                        alt="Preview Logo"
                      />
                      <button
                        type="button"
                        onClick={() => setBrandLogoFile(null)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full z-10 w-6 h-6 flex items-center justify-center text-xs shadow-md transition"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Drag & drop logo di sini
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="brandLogoUpload"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        setBrandLogoFile(e.target.files[0]);
                    }}
                  />
                  <label
                    htmlFor="brandLogoUpload"
                    className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 shadow-sm transition active:scale-95"
                  >
                    Pilih Gambar
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition"
          >
            Simpan & Buat Akun
          </button>
        </div>
      </div>
    </div>
  );
}
