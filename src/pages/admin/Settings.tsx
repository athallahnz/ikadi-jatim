import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { useAdmin } from "@/hooks/useAdmin";
import * as LucideIcons from "lucide-react"; // TAMBAHKAN INI
import { Trash2, Plus, Edit3, Save, CheckCircle, Share2 } from "lucide-react";
import Swal from "sweetalert2";

type SettingsMap = Record<string, string>;
type SettingsRow = {
  key: string;
  value: string;
};

type StatRow = {
  id: string;
  label: string;
  value: string;
  order_num: number;
};

type SocialRow = {
  id: string;
  platform: string;
  url: string;
  order_num: number;
};

export default function Settings() {
  const { admin } = useAdmin();

  /* ================= SETTINGS STATE ================= */
  const [globalSettings, setGlobalSettings] = useState<SettingsMap>({});
  const [savingGlobal, setSavingGlobal] = useState(false);

  /* ================= BRAND STATE ================= */
  const [brandName, setBrandName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [savingBrand, setSavingBrand] = useState(false);

  /* ================= STATS STATE & UX ================= */
  const [stats, setStats] = useState<StatRow[]>([]);
  const [savingStats, setSavingStats] = useState(false);
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);

  const [socials, setSocials] = useState<SocialRow[]>([]);
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);

  const loadSocials = async () => {
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .order("order_num", { ascending: true });
    if (data) setSocials(data as SocialRow[]);
  };

  // Panggil loadSocials() di useEffect [] bersama loadStats & loadSettings

  const addNewSocial = () => {
    setSocials([
      ...socials,
      { id: "", platform: "", url: "", order_num: socials.length + 1 },
    ]);
  };

  const updateSocialField = (
    index: number,
    field: keyof SocialRow,
    value: string | number,
  ) => {
    const newSocials = [...socials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    setSocials(newSocials);
  };

  const deleteSocial = async (id: string, index: number) => {
    const result = await Swal.fire({
      title: "Hapus Link?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: "Ya, Hapus",
    });

    if (result.isConfirmed) {
      if (id) await supabase.from("social_links").delete().eq("id", id);
      setSocials(socials.filter((_, i) => i !== index));
      Swal.fire("Terhapus!", "Link media sosial telah dihapus.", "success");
    }
  };

  const saveSocials = async () => {
    try {
      setSavingSocials(true);
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      for (const s of socials) {
        if (!s.platform || !s.url) continue;
        const payload = {
          platform: s.platform,
          url: s.url,
          order_num: s.order_num,
        };
        if (s.id) {
          await supabase.from("social_links").update(payload).eq("id", s.id);
        } else {
          await supabase.from("social_links").insert(payload);
        }
      }

      await loadSocials();
      setIsEditingSocials(false);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
    } finally {
      setSavingSocials(false);
    }
  };

  /* ================= LOAD DATA ================= */
  const loadStats = async () => {
    const { data } = await supabase
      .from("stats")
      .select("*")
      .order("order_num", { ascending: true });
    if (data) setStats(data as StatRow[]);
  };

  const loadSettings = async () => {
    const { data } = await supabase.from("settings").select("*");
    if (data) {
      const map: SettingsMap = {};
      data.forEach((s: SettingsRow) => {
        map[s.key] = s.value;
      });
      setGlobalSettings(map);
    }
  };

  useEffect(() => {
    loadStats();
    loadSettings();
    loadSocials();
  }, []);

  useEffect(() => {
    if (admin) {
      setBrandName(admin.brand_name || "");
      setLogoUrl(admin.brand_logo || null);
    }
  }, [admin]);

  /* ================= HANDLERS ================= */
  const updateSetting = (key: string, value: string) => {
    setGlobalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveGlobal = async () => {
    try {
      setSavingGlobal(true);
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const updates = Object.entries(globalSettings).map(([key, value]) => ({
        key,
        value,
      }));

      const { error } = await supabase.from("settings").upsert(updates);
      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Tersimpan!",
        text: "Pengaturan website berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan.",
      });
    } finally {
      setSavingGlobal(false);
    }
  };

  const saveBrand = async () => {
    if (!admin) return;
    try {
      setSavingBrand(true);
      let brand_logo = logoUrl;
      if (logoFile) brand_logo = await uploadImage(logoFile);
      const { error } = await supabase
        .from("admins")
        .update({ brand_name: brandName, brand_logo })
        .eq("id", admin.id);
      if (error) throw error;
      setLogoUrl(brand_logo);
      setLogoFile(null);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Identitas brand diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal memperbarui identitas brand.",
      });
    } finally {
      setSavingBrand(false);
    }
  };

  /* ================= STATS LOGIC ================= */
  const updateStatField = (
    index: number,
    field: keyof StatRow,
    value: string | number,
  ) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  const addNewStat = () => {
    setStats([
      ...stats,
      { id: "", label: "", value: "", order_num: stats.length + 1 },
    ]);
  };

  const saveStats = async () => {
    try {
      setSavingStats(true);
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      for (const stat of stats) {
        if (!stat.label.trim()) continue;
        const payload = {
          label: stat.label,
          value: stat.value,
          order_num: stat.order_num,
        };
        if (stat.id) {
          await supabase.from("stats").update(payload).eq("id", stat.id);
        } else {
          await supabase.from("stats").insert(payload);
        }
      }

      await loadStats();
      setIsEditingStats(false);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Statistik beranda telah diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat sinkronisasi database.",
      });
    } finally {
      setSavingStats(false);
    }
  };

  const deleteStat = async (id: string, index: number) => {
    const result = await Swal.fire({
      title: "Hapus data ini?",
      text: "Data statistik akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
    });

    if (result.isConfirmed) {
      if (id) await supabase.from("stats").delete().eq("id", id);
      setStats(stats.filter((_, i) => i !== index));
      Swal.fire("Terhapus!", "Baris statistik telah dihapus.", "success");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-emerald-dark">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1 tracking-wide">
          Kelola identitas brand, statistik, dan pengaturan website
        </p>
      </div>

      <div className="space-y-6 max-w-5xl">
        {/* BRAND IDENTITY */}
        {/* ================= BRAND IDENTITY SECTION ================= */}
        <div
          className={`bg-white border rounded-xl p-6 shadow-sm transition-all ${isEditingBrand ? "ring-2 ring-emerald-500/10 border-emerald-200" : "border-border"}`}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 font-bold text-emerald-dark">
              <CheckCircle
                size={18}
                className={
                  isEditingBrand ? "text-emerald-500" : "text-slate-400"
                }
              />
              Brand Identitas
              {!isEditingBrand && (
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Locked
                </span>
              )}
            </div>

            {/* Tombol Toggle Edit */}
            {!isEditingBrand ? (
              <button
                onClick={() => setIsEditingBrand(true)}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
              >
                <Edit3 size={16} /> Edit Identitas
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditingBrand(false);
                  setLogoFile(null); // Reset file yang belum ter-upload
                  // Optional: Jika ingin revert nama brand, panggil ulang data admin dari hook/db
                }}
                className="text-slate-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition"
              >
                Batal
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-1.5 block ml-1 tracking-widest">
                  Nama Brand
                </label>
                <input
                  disabled={!isEditingBrand}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full border-slate-200 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition disabled:bg-slate-50/50 disabled:text-slate-500"
                  placeholder="IKADI Jawa Timur"
                />
              </div>

              {/* Tombol Simpan hanya muncul saat EDIT */}
              {isEditingBrand && (
                <button
                  onClick={async () => {
                    await saveBrand();
                    setIsEditingBrand(false);
                  }}
                  disabled={savingBrand}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl transition-all font-bold text-sm shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {savingBrand ? "Memproses..." : "Simpan Identitas"}
                </button>
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 mb-2 block ml-1 tracking-widest">
                Logo Brand
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                  isEditingBrand
                    ? "border-emerald-300 bg-emerald-50/30 cursor-pointer hover:bg-emerald-50"
                    : "border-slate-100 bg-slate-50/30 cursor-not-allowed"
                }`}
                onClick={() =>
                  isEditingBrand &&
                  document.getElementById("logoUpload")?.click()
                }
              >
                {logoFile || logoUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : logoUrl!}
                      className={`h-20 mx-auto object-contain drop-shadow-sm transition-all ${!isEditingBrand && "grayscale-[0.5] opacity-80"}`}
                    />
                    {isEditingBrand && (
                      <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/20 rounded opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white font-bold bg-emerald-600 px-2 py-1 rounded shadow">
                          GANTI LOGO
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-sm text-slate-400">
                    Belum ada logo terpasang
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logoUpload"
                  onChange={(e) =>
                    e.target.files?.[0] && setLogoFile(e.target.files[0])
                  }
                />
              </div>
              {isEditingBrand && (
                <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                  Format: PNG/JPG. Disarankan background transparan.
                </p>
              )}
            </div>
          </div>
        </div>
        {/* STATS SECTION - HIGH UX IMPROVEMENT */}
        <div
          className={`bg-white border rounded-xl p-6 shadow-sm transition-all ${isEditingStats ? "ring-2 ring-emerald-500/10 border-emerald-200" : "border-border"}`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="font-bold text-emerald-dark flex items-center gap-2">
                <CheckCircle
                  size={18}
                  className={
                    isEditingStats ? "text-emerald-500" : "text-slate-400"
                  }
                />
                Statistik Beranda
                {!isEditingStats && (
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Read Only
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Angka pencapaian yang tampil di landing page.
              </p>
            </div>

            <div className="flex gap-2">
              {!isEditingStats ? (
                <button
                  onClick={() => setIsEditingStats(true)}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
                >
                  <Edit3 size={16} /> Edit Data
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditingStats(false);
                      loadStats();
                    }}
                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={addNewStat}
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-100 transition border border-emerald-200"
                  >
                    <Plus size={16} /> Tambah
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {stats.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm italic">
                Belum ada data statistik.
              </div>
            )}
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`flex gap-3 items-end p-4 rounded-xl transition-all ${isEditingStats ? "bg-slate-50 border border-slate-200 shadow-sm" : "bg-white border border-transparent hover:border-slate-100"}`}
              >
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block mb-1.5 ml-1 tracking-widest">
                    Label
                  </label>
                  <input
                    disabled={!isEditingStats}
                    value={stat.label}
                    onChange={(e) =>
                      updateStatField(index, "label", e.target.value)
                    }
                    className="w-full bg-white border-slate-200 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none disabled:bg-transparent disabled:border-transparent disabled:font-bold disabled:text-emerald-900 disabled:px-1 transition-all"
                    placeholder="Contoh: Pengurus Daerah"
                  />
                </div>
                <div className="w-32">
                  <label className="text-[10px] uppercase font-black text-slate-400 block mb-1.5 ml-1 tracking-widest">
                    Angka/Value
                  </label>
                  <input
                    disabled={!isEditingStats}
                    value={stat.value}
                    onChange={(e) =>
                      updateStatField(index, "value", e.target.value)
                    }
                    className="w-full bg-white border-slate-200 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none disabled:bg-emerald-50/50 disabled:border-transparent disabled:text-emerald-700 disabled:font-black transition-all"
                    placeholder="38"
                  />
                </div>
                <div className="w-20">
                  <label className="text-[10px] uppercase font-black text-slate-400 block mb-1.5 ml-1 tracking-widest">
                    Urutan
                  </label>
                  <input
                    disabled={!isEditingStats}
                    type="number"
                    value={stat.order_num}
                    onChange={(e) =>
                      updateStatField(
                        index,
                        "order_num",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full bg-white border-slate-200 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none disabled:bg-transparent disabled:border-transparent text-center transition-all"
                  />
                </div>
                {isEditingStats && (
                  <button
                    onClick={() => deleteStat(stat.id, index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditingStats && (
            <div className="mt-8 flex items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <button
                onClick={saveStats}
                disabled={savingStats}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl transition shadow-lg shadow-emerald-200 font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />{" "}
                {savingStats
                  ? "Proses Simpan..."
                  : "Simpan Perubahan Statistik"}
              </button>
              <p className="text-xs text-emerald-700 italic">
                Pastikan semua label dan angka sudah sesuai sebelum menyimpan.
              </p>
            </div>
          )}
        </div>
        {/* WEBSITE SETTINGS */}
        <div
          className={`bg-white border rounded-xl p-6 shadow-sm transition-all ${isEditingGlobal ? "ring-2 ring-emerald-500/10 border-emerald-200" : "border-border"}`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="font-bold text-emerald-dark flex items-center gap-2">
                <CheckCircle
                  size={18}
                  className={
                    isEditingGlobal ? "text-emerald-500" : "text-slate-400"
                  }
                />
                Pengaturan Website (SEO & Kontak)
                {!isEditingGlobal && (
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Read Only
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Konfigurasi global identitas situs dan informasi kontak.
              </p>
            </div>

            {/* Tombol Toggle Edit */}
            {!isEditingGlobal ? (
              <button
                onClick={() => setIsEditingGlobal(true)}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
              >
                <Edit3 size={16} /> Edit Settings
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditingGlobal(false);
                  // Optional: panggil loadSettings() lagi jika ingin membatalkan perubahan yang belum disimpan
                }}
                className="flex items-center gap-2 text-slate-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition"
              >
                Batal
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Kolom SITE TITLE */}
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 block tracking-widest">
                  site_title
                </label>
                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.site_title || ""}
                  onChange={(e) => updateSetting("site_title", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all"
                />
              </div>

              {/* Kolom SITE DESCRIPTION */}
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 block tracking-widest">
                  site_description
                </label>
                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.site_description || ""}
                  onChange={(e) =>
                    updateSetting("site_description", e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all"
                />
              </div>

              {/* Kolom CONTACT EMAIL */}
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 block tracking-widest">
                  contact_email
                </label>
                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.contact_email || ""}
                  onChange={(e) =>
                    updateSetting("contact_email", e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Kolom ADDRESS */}
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 block tracking-widest">
                  address
                </label>
                <textarea
                  disabled={!isEditingGlobal}
                  value={globalSettings.address || ""}
                  onChange={(e) => updateSetting("address", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all"
                  rows={3}
                />
              </div>

              {/* Kolom CONTACT PHONE */}
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 block tracking-widest">
                  contact_phone
                </label>
                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.contact_phone || ""}
                  onChange={(e) =>
                    updateSetting("contact_phone", e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all"
                />
              </div>

              {/* Kolom FOOTER TEXT */}
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 block tracking-widest">
                  footer_text
                </label>
                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.footer_text || ""}
                  onChange={(e) => updateSetting("footer_text", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm italic outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Tombol Simpan hanya muncul saat mode EDIT */}
          {isEditingGlobal && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
              <button
                onClick={async () => {
                  await saveGlobal();
                  setIsEditingGlobal(false); // Selesai edit, kembali ke read-only
                }}
                disabled={savingGlobal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl transition font-bold shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={18} />
                {savingGlobal ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <p className="text-[11px] text-emerald-600 italic font-medium">
                * Klik simpan untuk menerapkan perubahan ke database publik.
              </p>
            </div>
          )}
        </div>
        {/* SOCIAL MEDIA SETTINGS */}
        <div
          className={`bg-white border rounded-xl p-6 shadow-sm transition-all ${isEditingSocials ? "ring-2 ring-emerald-500/10 border-emerald-200" : "border-border"}`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="font-bold text-emerald-dark flex items-center gap-2">
                <CheckCircle
                  size={18}
                  className={
                    isEditingSocials ? "text-emerald-500" : "text-slate-400"
                  }
                />
                Link Media Sosial
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kelola link akun sosial media resmi untuk ditampilkan di footer.
              </p>
            </div>

            <div className="flex gap-2">
              {!isEditingSocials ? (
                <button
                  onClick={() => setIsEditingSocials(true)}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition"
                >
                  <Edit3 size={16} /> Edit Socials
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditingSocials(false);
                      loadSocials();
                    }}
                    className="text-slate-500 px-4 py-2 text-sm font-bold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={addNewSocial}
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    <Plus size={16} /> Tambah
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {socials.map((social, index) => (
              <div
                key={index}
                className="flex gap-3 items-end p-3 rounded-lg bg-slate-50/50"
              >
                <div className="w-1/4">
                  <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-widest">
                    Platform
                  </label>
                  <select
                    disabled={!isEditingSocials}
                    value={social.platform}
                    onChange={(e) =>
                      updateSocialField(index, "platform", e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-white"
                  >
                    <option value="">Pilih</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Youtube">Youtube</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-widest">
                    URL Profil
                  </label>
                  <input
                    disabled={!isEditingSocials}
                    value={social.url}
                    onChange={(e) =>
                      updateSocialField(index, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-white"
                  />
                </div>
                {isEditingSocials && (
                  <button
                    onClick={() => deleteSocial(social.id, index)}
                    className="p-2 text-red-400 hover:text-red-600 transition mb-0.5"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditingSocials && (
            <div className="mt-8 border-t pt-6 flex items-center gap-4">
              <button
                onClick={saveSocials}
                disabled={savingSocials}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl transition font-bold shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                <Save size={18} /> Simpan Social Media
              </button>
              <p className="text-[10px] text-emerald-600 italic">
                Ikon akan otomatis disesuaikan di landing page berdasarkan
                pilihan platform.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
