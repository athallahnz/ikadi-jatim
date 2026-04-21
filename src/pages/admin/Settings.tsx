import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { useAdmin } from "@/hooks/useAdmin";
import { Trash2, Plus, Edit3, Save, CheckCircle } from "lucide-react";
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

  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  
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

  const loadSocials = async () => {
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .order("order_num", { ascending: true });
    if (data) setSocials(data as SocialRow[]);
  };

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
          // ✅ PERBAIKAN: Tambah .select() untuk mengecek apakah RLS memblokir update
          const { data, error } = await supabase
            .from("social_links")
            .update(payload)
            .eq("id", s.id)
            .select();

          if (error) throw error;
          if (!data || data.length === 0) {
            throw new Error(
              `Update diblokir oleh RLS untuk platform: ${s.platform}`,
            );
          }
        } else {
          // ✅ PERBAIKAN: Tambah .select() untuk proses Insert
          const { data, error } = await supabase
            .from("social_links")
            .insert(payload)
            .select();

          if (error) throw error;
          if (!data || data.length === 0) {
            throw new Error(
              `Insert diblokir oleh RLS untuk platform: ${s.platform}`,
            );
          }
        }
      }

      await loadSocials();
      setIsEditingSocials(false);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Link Media Sosial telah diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data.";
      Swal.fire("Gagal Menyimpan", errorMessage, "error");
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
      setQrisPreview(map.qris || null); // ← TAMBAH
    }
  };

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

      let qrisUrl = globalSettings.qris || null;

      // upload jika ada file baru
      if (qrisFile) {
        qrisUrl = await uploadImage(qrisFile);
      }

      const updates = Object.entries({
        ...globalSettings,
        qris: qrisUrl,
      }).map(([key, value]) => ({
        key,
        value,
      }));

      // ✅ PERBAIKAN DI SINI: Tambahkan { onConflict: "key" }
      const { error } = await supabase
        .from("settings")
        .upsert(updates, { onConflict: "key" });

      if (error) throw error;

      setQrisPreview(qrisUrl);

      // ✅ PERBAIKAN DI SINI: Refresh state agar data terbaru merender ulang form
      await loadSettings();

      Swal.fire({
        icon: "success",
        title: "Tersimpan!",
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

      // ✅ PERBAIKAN: Tambahkan .select()
      const { data, error } = await supabase
        .from("admins")
        .update({ brand_name: brandName, brand_logo })
        .eq("id", admin.id)
        .select(); // <--- TAMBAHKAN INI

      if (error) throw error;

      // Jika RLS memblokir, data array akan kosong (0 baris terupdate)
      if (!data || data.length === 0) {
        throw new Error(
          "Update diblokir oleh keamanan database (RLS) atau ID tidak ditemukan.",
        );
      }

      setLogoUrl(brand_logo);
      setLogoFile(null);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Identitas brand diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memperbarui identitas.";
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: errorMessage,
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
        <h1 className="text-2xl font-black text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1 tracking-wide">
          Kelola identitas brand, statistik, dan pengaturan website
        </p>
      </div>

      <div className="space-y-6 max-w-5xl">
        {/* BRAND IDENTITY */}
        <div
          className={`bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm transition-colors ${
            isEditingBrand
              ? "ring-2 ring-emerald-500/10 border-emerald-500/30"
              : ""
          }`}
        >
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <CheckCircle
                size={18}
                className={
                  isEditingBrand ? "text-emerald-500" : "text-muted-foreground"
                }
              />

              <span>Brand Identitas</span>

              {!isEditingBrand && (
                <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Locked
                </span>
              )}
            </div>

            {/* Toggle Edit */}
            {!isEditingBrand ? (
              <button
                onClick={() => setIsEditingBrand(true)}
                className="flex items-center justify-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-muted/70 transition w-full sm:w-auto"
              >
                <Edit3 size={16} /> Edit Identitas
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditingBrand(false);
                  setLogoFile(null);
                }}
                className="text-muted-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-muted transition w-full sm:w-auto"
              >
                Batal
              </button>
            )}
          </div>

          {/* CONTENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* LEFT SIDE */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-muted-foreground mb-1.5 block ml-1 tracking-widest">
                  Nama Brand
                </label>

                <input
                  disabled={!isEditingBrand}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="IKADI Jawa Timur"
                  className="w-full border border-border bg-background text-foreground rounded-lg p-2.5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/20 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              {/* Save Button */}
              {isEditingBrand && (
                <button
                  onClick={async () => {
                    await saveBrand();
                    setIsEditingBrand(false);
                  }}
                  disabled={savingBrand}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl transition-colors font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {savingBrand ? "Memproses..." : "Simpan Identitas"}
                </button>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div>
              <label className="text-[10px] uppercase font-black text-muted-foreground mb-2 block ml-1 tracking-widest">
                Logo Brand
              </label>

              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                  isEditingBrand
                    ? "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-900/10 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    : "border-border bg-muted/40 cursor-not-colorsowed"
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
                      className={`h-16 sm:h-20 mx-auto object-contain transition ${
                        !isEditingBrand && "grayscale-[0.5] opacity-80"
                      }`}
                    />

                    {isEditingBrand && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white font-bold bg-emerald-600 px-2 py-1 rounded shadow">
                          GANTI LOGO
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-sm text-muted-foreground">
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
                <p className="text-[10px] text-muted-foreground mt-2 italic text-center">
                  Format: PNG/JPG. Disarankan background transparan.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div
          className={`bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm transition-colors ${
            isEditingStats
              ? "ring-2 ring-emerald-500/10 border-emerald-500/30"
              : ""
          }`}
        >
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="font-bold text-foreground flex items-center gap-2">
                <CheckCircle
                  size={18}
                  className={
                    isEditingStats
                      ? "text-emerald-500"
                      : "text-muted-foreground"
                  }
                />
                Statistik Beranda
                {!isEditingStats && (
                  <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Read Only
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Angka pencapaian yang tampil di landing page.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-2">
              {!isEditingStats ? (
                <button
                  onClick={() => setIsEditingStats(true)}
                  className="flex items-center justify-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-muted/70 transition w-full sm:w-auto"
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
                    className="flex items-center justify-center gap-2 bg-background border border-border text-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-muted transition w-full sm:w-auto"
                  >
                    Batal
                  </button>

                  <button
                    onClick={addNewStat}
                    className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition border border-emerald-200 dark:border-emerald-800 w-full sm:w-auto"
                  >
                    <Plus size={16} /> Tambah
                  </button>
                </>
              )}
            </div>
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {stats.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm italic">
                Belum ada data statistik.
              </div>
            )}

            {stats.map((stat, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl transition-colors ${
                  isEditingStats
                    ? "bg-muted border border-border shadow-sm"
                    : "bg-card border border-transparent hover:border-border"
                }`}
              >
                {/* LABEL */}
                <div className="mb-4">
                  <label className="text-[10px] uppercase font-black text-muted-foreground block mb-1.5 ml-1 tracking-widest">
                    Label
                  </label>

                  <input
                    disabled={!isEditingStats}
                    value={stat.label}
                    onChange={(e) =>
                      updateStatField(index, "label", e.target.value)
                    }
                    placeholder="Contoh: Pengurus Daerah"
                    className="w-full bg-background border border-border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-transparent disabled:border-transparent disabled:font-bold disabled:text-emerald-600 transition-colors"
                  />
                </div>

                {/* VALUE + ORDER */}
                <div className="flex items-end gap-3">
                  {/* ANGKA */}
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-black text-muted-foreground block mb-1.5 ml-1 tracking-widest">
                      Angka
                    </label>

                    <input
                      disabled={!isEditingStats}
                      value={stat.value}
                      onChange={(e) =>
                        updateStatField(index, "value", e.target.value)
                      }
                      placeholder="38"
                      className="w-full bg-background border border-border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-emerald-50 dark:disabled:bg-emerald-900/20 disabled:border-transparent disabled:text-emerald-700 dark:disabled:text-emerald-400 font-semibold transition-colors"
                    />
                  </div>

                  {/* ORDER */}
                  <div className="w-24">
                    <label className="text-[10px] uppercase font-black text-muted-foreground block mb-1.5 ml-1 tracking-widest">
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
                      className="w-full bg-background border border-border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-center disabled:bg-transparent disabled:border-transparent transition-colors"
                    />
                  </div>

                  {/* DELETE */}
                  {isEditingStats && (
                    <button
                      onClick={() => deleteStat(stat.id, index)}
                      className="mb-[2px] p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* SAVE SECTION */}
          {isEditingStats && (
            <div className="mt-8 flex flex-col md:flex-row md:items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <button
                onClick={saveStats}
                disabled={savingStats}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 md:px-8 py-3 rounded-xl transition font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {savingStats
                  ? "Proses Simpan..."
                  : "Simpan Perubahan Statistik"}
              </button>

              <p className="text-xs text-emerald-700 dark:text-emerald-400 italic">
                Pastikan semua label dan angka sudah sesuai sebelum menyimpan.
              </p>
            </div>
          )}
        </div>

        {/* WEBSITE SETTINGS */}
        <div
          className={`bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm transition-colors ${
            isEditingGlobal
              ? "ring-2 ring-emerald-500/10 border-emerald-500/30"
              : ""
          }`}
        >
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="font-bold text-foreground flex items-center gap-2 flex-wrap">
                <CheckCircle
                  size={18}
                  className={
                    isEditingGlobal
                      ? "text-emerald-500"
                      : "text-muted-foreground"
                  }
                />
                Pengaturan Website (SEO & Kontak)
                {!isEditingGlobal && (
                  <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Read Only
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Konfigurasi global identitas situs dan informasi kontak.
              </p>
            </div>

            {!isEditingGlobal ? (
              <button
                onClick={() => setIsEditingGlobal(true)}
                className="flex items-center justify-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-muted/70 transition w-full md:w-auto"
              >
                <Edit3 size={16} /> Edit Settings
              </button>
            ) : (
              <button
                onClick={() => setIsEditingGlobal(false)}
                className="flex items-center justify-center gap-2 text-muted-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-muted transition w-full md:w-auto"
              >
                Batal
              </button>
            )}
          </div>

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-muted-foreground mb-1 ml-1 block tracking-widest">
                  site_title
                </label>

                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.site_title || ""}
                  onChange={(e) => updateSetting("site_title", e.target.value)}
                  className="w-full border border-border bg-background text-foreground rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-muted-foreground mb-1 ml-1 block tracking-widest">
                  site_description
                </label>

                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.site_description || ""}
                  onChange={(e) =>
                    updateSetting("site_description", e.target.value)
                  }
                  className="w-full border border-border bg-background text-foreground rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-muted-foreground mb-1 ml-1 block tracking-widest">
                  contact_email
                </label>

                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.contact_email || ""}
                  onChange={(e) =>
                    updateSetting("contact_email", e.target.value)
                  }
                  className="w-full border border-border bg-background text-foreground rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-muted-foreground mb-1 ml-1 block tracking-widest">
                  address
                </label>

                <textarea
                  disabled={!isEditingGlobal}
                  value={globalSettings.address || ""}
                  onChange={(e) => updateSetting("address", e.target.value)}
                  rows={3}
                  className="w-full border border-border bg-background text-foreground rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-muted-foreground mb-1 ml-1 block tracking-widest">
                  contact_phone
                </label>

                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.contact_phone || ""}
                  onChange={(e) =>
                    updateSetting("contact_phone", e.target.value)
                  }
                  className="w-full border border-border bg-background text-foreground rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-muted-foreground mb-1 ml-1 block tracking-widest">
                  footer_text
                </label>

                <input
                  disabled={!isEditingGlobal}
                  value={globalSettings.footer_text || ""}
                  onChange={(e) => updateSetting("footer_text", e.target.value)}
                  className="w-full border border-border bg-background text-foreground rounded-lg p-2.5 text-sm italic outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-muted disabled:text-muted-foreground"
                />
              </div>

              {/* QRIS */}
              <div>
                <label className="text-[10px] uppercase font-black text-muted-foreground mb-2 ml-1 block tracking-widest">
                  QRIS Image
                </label>

                <div
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    isEditingGlobal
                      ? "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-900/10 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      : "border-border bg-muted/40 cursor-not-colorsowed"
                  }`}
                  onClick={() =>
                    isEditingGlobal &&
                    document.getElementById("qrisUpload")?.click()
                  }
                >
                  {qrisFile || qrisPreview ? (
                    <img
                      src={
                        qrisFile ? URL.createObjectURL(qrisFile) : qrisPreview!
                      }
                      className="h-28 md:h-32 mx-auto object-contain"
                    />
                  ) : (
                    <div className="py-6 text-sm text-muted-foreground">
                      Belum ada QRIS
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    id="qrisUpload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setQrisFile(file);
                        setQrisPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                {isEditingGlobal && (
                  <p className="text-[10px] text-muted-foreground mt-2 italic text-center">
                    Upload QRIS pembayaran (PNG/JPG)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SAVE */}
          {isEditingGlobal && (
            <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row md:items-center gap-4">
              <button
                onClick={async () => {
                  await saveGlobal();
                  setIsEditingGlobal(false);
                }}
                disabled={savingGlobal}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl transition font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {savingGlobal ? "Menyimpan..." : "Simpan Perubahan"}
              </button>

              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 italic font-medium">
                * Klik simpan untuk menerapkan perubahan ke database publik.
              </p>
            </div>
          )}
        </div>

        {/* SOCIAL MEDIA SETTINGS */}
        <div
          className={`bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm transition-colors ${
            isEditingSocials
              ? "ring-2 ring-emerald-500/10 border-emerald-500/30"
              : ""
          }`}
        >
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="font-bold text-foreground flex items-center gap-2">
                <CheckCircle
                  size={18}
                  className={
                    isEditingSocials
                      ? "text-emerald-500"
                      : "text-muted-foreground"
                  }
                />
                Link Media Sosial
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Kelola link akun sosial media resmi untuk ditampilkan di footer.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isEditingSocials ? (
                <button
                  onClick={() => setIsEditingSocials(true)}
                  className="flex items-center justify-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-muted/70 transition w-full md:w-auto"
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
                    className="text-muted-foreground px-4 py-2 text-sm font-bold hover:bg-muted rounded-lg transition w-full md:w-auto"
                  >
                    Batal
                  </button>

                  <button
                    onClick={addNewSocial}
                    className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition w-full md:w-auto"
                  >
                    <Plus size={16} /> Tambah
                  </button>
                </>
              )}
            </div>
          </div>

          {/* LIST */}
          <div className="space-y-4">
            {socials.map((social, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 md:items-end p-4 rounded-xl bg-muted/40"
              >
                {/* PLATFORM */}
                <div className="w-full md:w-1/3">
                  <label className="text-[10px] uppercase font-black text-muted-foreground block mb-1 tracking-widest">
                    Platform
                  </label>

                  <select
                    disabled={!isEditingSocials}
                    value={social.platform}
                    onChange={(e) =>
                      updateSocialField(index, "platform", e.target.value)
                    }
                    className="w-full border border-border bg-background text-foreground rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-muted"
                  >
                    <option value="">Pilih</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Youtube">Youtube</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>

                {/* URL */}
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-black text-muted-foreground block mb-1 tracking-widest">
                    URL Profil
                  </label>

                  <input
                    disabled={!isEditingSocials}
                    value={social.url}
                    onChange={(e) =>
                      updateSocialField(index, "url", e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full border border-border bg-background text-foreground rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-muted"
                  />
                </div>

                {/* DELETE */}
                {isEditingSocials && (
                  <button
                    onClick={() => deleteSocial(social.id, index)}
                    className="self-end md:self-auto p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* SAVE */}
          {isEditingSocials && (
            <div className="mt-8 border-t border-border pt-6 flex flex-col md:flex-row md:items-center gap-4">
              <button
                onClick={saveSocials}
                disabled={savingSocials}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-2"
              >
                <Save size={18} /> Simpan Social Media
              </button>

              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic">
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
