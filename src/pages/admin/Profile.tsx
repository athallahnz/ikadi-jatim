import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { useAdmin } from "@/hooks/useAdmin";
import Swal from "sweetalert2";
import { ShieldCheck, User as UserIcon } from "lucide-react";

export default function Profile() {
  const { admin } = useAdmin();

  // State Profil Publik
  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // State Kredensial Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savingAuth, setSavingAuth] = useState(false);

  useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setBrandName(admin.brand_name || "");
      setExistingLogoUrl(admin.brand_logo || null);
    }

    // Ambil email dari Auth session
    const fetchEmail = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setEmail(data.user.email || "");
      }
    };
    fetchEmail();
  }, [admin]);

  /* ================= SIMPAN PROFIL ================= */
  const handleSaveProfile = async () => {
    if (!admin) return;
    try {
      setSavingProfile(true);

      let brand_logo = existingLogoUrl;
      if (logoFile) {
        brand_logo = await uploadImage(logoFile);
      }

      const { error } = await supabase
        .from("admins")
        .update({
          name,
          brand_name: brandName,
          brand_logo,
        })
        .eq("id", admin.id);

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Tersimpan",
        text: "Profil publik Anda berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });

      setExistingLogoUrl(brand_logo);
      setLogoFile(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui",
        text: errorMessage,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  /* ================= SIMPAN KREDENSIAL (EMAIL & PASSWORD) ================= */
  const handleSaveAuth = async () => {
    try {
      setSavingAuth(true);

      const updates: { email?: string; password?: string } = {};
      if (email) updates.email = email;
      if (password) {
        if (password.length < 6)
          throw new Error("Password minimal 6 karakter.");
        updates.password = password;
      }

      if (Object.keys(updates).length === 0) return;

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Keamanan Diperbarui",
        text: "Kredensial login berhasil diubah.",
        timer: 2000,
        showConfirmButton: false,
      });

      setPassword(""); // Kosongkan field password setelah sukses
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengubah kredensial.";
      Swal.fire({
        icon: "error",
        title: "Pembaruan Gagal",
        text: errorMessage,
      });
    } finally {
      setSavingAuth(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground tracking-tight">My Profile</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Kelola informasi pribadi dan keamanan akun Anda.
        </p>
      </div>

      <div className="space-y-6">
        {/* ================= BAGIAN 1: PROFIL PUBLIK ================= */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 font-semibold text-foreground mb-5 border-b border-border pb-3">
            <UserIcon size={20} />
            <span>Informasi Publik</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Nama Lengkap
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border bg-background text-foreground
          rounded-lg p-2.5 outline-none
          focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Nama Brand (Opsional)
              </label>

              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Misal: IKADI Surabaya"
                className="w-full border border-border bg-background text-foreground
          rounded-lg p-2.5 outline-none
          focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Logo Brand
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0])
                    setLogoFile(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-border rounded-xl py-8 px-5
          flex flex-col items-center justify-center gap-4
          bg-muted hover:bg-muted/70 transition"
              >
                {logoFile ? (
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(logoFile)}
                      className="h-16 object-contain"
                    />

                    <button
                      onClick={() => setLogoFile(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white
                rounded-full w-5 h-5 text-xs"
                    >
                      X
                    </button>
                  </div>
                ) : existingLogoUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={existingLogoUrl}
                      className="h-16 object-contain"
                    />

                    <button
                      onClick={() => setExistingLogoUrl(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white
                rounded-full w-5 h-5 text-xs"
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
                  id="profileLogoUpload"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setLogoFile(e.target.files[0]);
                  }}
                />

                <label
                  htmlFor="profileLogoUpload"
                  className="mt-3 inline-block px-4 py-1.5 text-xs rounded
            bg-emerald-600 text-white font-medium cursor-pointer shadow-sm
            hover:bg-emerald-700 transition"
                >
                  Pilih Logo
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white
        px-4 py-2.5 rounded-lg transition font-medium mt-4"
            >
              {savingProfile ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>
        </div>

        {/* ================= BAGIAN 2: KEAMANAN AKUN ================= */}
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
                className="w-full border border-border bg-muted text-foreground
          rounded-lg p-2.5 outline-none
          focus:ring-2 focus:ring-emerald-500/30"
              />

              <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
                *Mengubah email mungkin akan memutuskan sesi Anda saat ini.
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
                className="w-full border border-border bg-background text-foreground
          rounded-lg p-2.5 outline-none
          focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveAuth}
                disabled={savingAuth || (!email && !password)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white
          px-4 py-2.5 rounded-lg transition font-medium
          disabled:opacity-50"
              >
                {savingAuth ? "Memproses..." : "Perbarui Keamanan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
