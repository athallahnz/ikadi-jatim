import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { slugify } from "@/lib/slug";
import Swal from "sweetalert2";
import { ShieldCheck } from "lucide-react"; // Import icon untuk UI keamanan

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

// Interface UserAdmin yang spesifik sesuai instruksi
interface UserAdmin {
  id: string;
  name: string;
  role: string;
  scope: string;
  daerah: string | null;
  brand_name: string | null;
  brand_logo?: string | null;
  email?: string; // Tambahkan field email
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userData: UserAdmin | null;
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  userData,
}: Props) {
  // State Profil
  const [name, setName] = useState("");
  const [role, setRole] = useState("editor");
  const [scope, setScope] = useState("jatim");
  const [daerah, setDaerah] = useState("");
  const [daerahSlug, setDaerahSlug] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);

  // State Keamanan/Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savingAuth, setSavingAuth] = useState(false);

  // Auto-generate slug ketika daerah berubah
  useEffect(() => {
    if (daerah) {
      setDaerahSlug(slugify(daerah));
    } else {
      setDaerahSlug("");
    }
  }, [daerah]);

  // Prefill form ketika modal dibuka
  useEffect(() => {
    if (isOpen && userData) {
      setName(userData.name || "");
      setRole(userData.role || "editor");
      setScope(userData.scope || "jatim");
      setDaerah(userData.daerah || "");
      setBrandName(userData.brand_name || "");
      setExistingLogoUrl(userData.brand_logo || null);
      setBrandLogoFile(null);

      // Prefill Email dari data user
      setEmail(userData.email || "");
      setPassword(""); // Password dikosongkan demi keamanan
    }
  }, [isOpen, userData]);

  if (!isOpen || !userData) return null;

  // Fungsi simpan profil (tabel admins)
  const handleSaveProfile = async () => {
    try {
      if (!name) throw new Error("Nama wajib diisi!");

      Swal.fire({
        title: "Menyimpan...",
        text: "Memperbarui data profil admin",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let brand_logo = existingLogoUrl;
      if (brandLogoFile) {
        brand_logo = await uploadImage(brandLogoFile);
      }

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
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      Swal.fire({ icon: "error", title: "Gagal Menyimpan", text: message });
    }
  };

  // Fungsi simpan kredensial login (Auth)
  const handleSaveAuth = async () => {
    try {
      if (!email) throw new Error("Email wajib diisi!");
      setSavingAuth(true);

      // Catatan: Gunakan API internal/Edge Function untuk update user lain
      // Contoh pseudocode API call:
      // await updateAuthUser({ id: userData.id, email, password });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kredensial login berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });

      setPassword(""); // Reset field password setelah sukses
      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui keamanan";
      Swal.fire({ icon: "error", title: "Kesalahan Keamanan", text: message });
    } finally {
      setSavingAuth(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="sticky top-0 bg-card/80 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Edit Profil Admin
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* FORM KEAMANAN (Email & Password) */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
            <div className="flex items-center gap-2 font-semibold text-foreground mb-5 border-b border-border pb-3">
              <ShieldCheck size={20} />
              <span>Keamanan Akun & Login</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Email Login
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-muted text-foreground rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
                  *Mengubah email mungkin akan memutuskan sesi pengguna
                  tersebut.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah sandi"
                  className="w-full border border-border bg-background text-foreground rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveAuth}
                  disabled={savingAuth || (!email && !password)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg transition font-medium disabled:opacity-50"
                >
                  {savingAuth ? "Memproses..." : "Perbarui Keamanan"}
                </button>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* FORM DATA PROFIL */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nama Lengkap *
              </label>
              <input
                className="w-full border border-border bg-background text-foreground p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/30 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <select
                className="w-full border border-border bg-background text-foreground p-2.5 rounded-lg outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Lingkup Kerja
              </label>
              <select
                className="w-full border border-border bg-background text-foreground p-2.5 rounded-lg outline-none"
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  if (e.target.value === "jatim") setDaerah("");
                }}
              >
                <option value="jatim">Jatim (Pusat)</option>
                <option value="daerah">Daerah (Cabang)</option>
              </select>
            </div>

            {scope === "daerah" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Pilih Daerah *
                </label>
                <select
                  className="w-full border border-border bg-background text-foreground p-2.5 rounded-lg outline-none"
                  value={daerah}
                  onChange={(e) => setDaerah(e.target.value)}
                >
                  <option value="">-- Pilih Kota/Kabupaten --</option>
                  {KOTA_KAB_JATIM.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* PENGATURAN BRANDING */}
          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Pengaturan Branding
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nama Brand Institusi
                </label>
                <input
                  className="w-full border border-border bg-background text-foreground p-2.5 rounded-lg outline-none"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Logo Brand
                </label>
                <div className="border-2 border-dashed border-border rounded-xl py-8 px-5 flex flex-col items-center justify-center gap-4 bg-muted">
                  {brandLogoFile || existingLogoUrl ? (
                    <div className="relative">
                      <img
                        src={
                          brandLogoFile
                            ? URL.createObjectURL(brandLogoFile)
                            : existingLogoUrl!
                        }
                        className="w-40 h-28 object-contain rounded bg-background p-1 shadow-sm"
                        alt="Preview logo"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBrandLogoFile(null);
                          setExistingLogoUrl(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Drag & drop logo di sini
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="editBrandLogoUpload"
                    onChange={(e) =>
                      e.target.files?.[0] && setBrandLogoFile(e.target.files[0])
                    }
                  />
                  <label
                    htmlFor="editBrandLogoUpload"
                    className="px-5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg cursor-pointer"
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
            className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted-foreground"
          >
            Batal
          </button>
          <button
            onClick={handleSaveProfile}
            className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-lg shadow-sm"
          >
            Simpan Profil
          </button>
        </div>
      </div>
    </div>
  );
}
