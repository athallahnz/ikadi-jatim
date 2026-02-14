import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import { useAdmin } from "@/hooks/useAdmin";
import { UserPlus } from "lucide-react"; // ✅ Import icon
import CreateUser from "./CreateUser"; // ✅ Import Modal CreateUser

type SettingsMap = Record<string, string>;
type SettingsRow = {
  key: string;
  value: string;
};

export default function Settings() {
  const { admin } = useAdmin();

  /* ================= MODAL STATE ================= */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ================= GLOBAL SETTINGS ================= */
  const [globalSettings, setGlobalSettings] = useState<SettingsMap>({});
  const [savingGlobal, setSavingGlobal] = useState(false);

  /* ================= BRAND ================= */
  const [brandName, setBrandName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [savingBrand, setSavingBrand] = useState(false);

  /* ================= LOAD GLOBAL ================= */
  useEffect(() => {
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

    loadSettings();
  }, []);

  /* ================= LOAD BRAND ================= */
  useEffect(() => {
    if (admin) {
      setBrandName(admin.brand_name || "");
      setLogoUrl(admin.brand_logo || null);
    }
  }, [admin]);

  /* ================= UPDATE FIELD ================= */
  const updateSetting = (key: string, value: string) => {
    setGlobalSettings((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= SAVE GLOBAL ================= */
  const saveGlobal = async () => {
    setSavingGlobal(true);

    const updates = Object.entries(globalSettings).map(([key, value]) => ({
      key,
      value,
    }));

    await supabase.from("settings").upsert(updates);

    setSavingGlobal(false);
  };

  /* ================= SAVE BRAND ================= */
  const saveBrand = async () => {
    if (!admin) return;

    setSavingBrand(true);

    let brand_logo = logoUrl;

    if (logoFile) {
      brand_logo = await uploadImage(logoFile);
    }

    await supabase
      .from("admins")
      .update({
        brand_name: brandName,
        brand_logo,
      })
      .eq("id", admin.id);

    setLogoUrl(brand_logo);
    setLogoFile(null);
    setSavingBrand(false);
  };

  return (
    <AdminLayout>
      {/* HEADER SECTION dengan tombol sejajar Kanan */}
      <div className="mb-6">
        <h1 className="text-2xl font-display text-emerald-dark">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola identitas brand dan pengaturan website
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <div className="font-semibold text-emerald-dark mb-4">
            Brand Identitas
          </div>

          {/* BRAND NAME */}
          <div className="mb-4">
            <label className="text-sm text-emerald-dark mb-1 block">
              Nama Brand
            </label>
            <input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="IKADI Jawa Timur"
            />
          </div>

          {/* LOGO */}
          <div className="mb-4">
            <label className="text-sm text-emerald-dark mb-2 block">
              Logo Brand
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  setLogoFile(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-emerald-300 rounded-xl p-5 text-center bg-emerald-50 hover:bg-emerald-100/50 transition"
            >
              {logoFile ? (
                <img
                  src={URL.createObjectURL(logoFile)}
                  className="h-16 mx-auto object-contain"
                />
              ) : logoUrl ? (
                <img src={logoUrl} className="h-16 mx-auto object-contain" />
              ) : (
                <div className="text-sm text-emerald-700">
                  Drag & drop logo di sini
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="logoUpload"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setLogoFile(e.target.files[0]);
                  }
                }}
              />

              <label
                htmlFor="logoUpload"
                className="mt-3 inline-block px-4 py-2 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer transition shadow-sm"
              >
                Pilih Logo
              </label>
            </div>
          </div>

          <button
            onClick={saveBrand}
            disabled={savingBrand}
            className="bg-emerald-dark hover:bg-emerald-800 text-white px-4 py-2 rounded transition"
          >
            {savingBrand ? "Menyimpan..." : "Simpan Brand"}
          </button>
        </div>

        {/* ================= GLOBAL ================= */}
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <div className="font-semibold text-emerald-dark mb-4">
            Pengaturan Website
          </div>

          {/* SITE TITLE */}
          <div className="mb-4">
            <label className="text-sm text-emerald-dark mb-1 block">
              Judul Situs
            </label>
            <input
              value={globalSettings.site_title || ""}
              onChange={(e) => updateSetting("site_title", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-4">
            <label className="text-sm text-emerald-dark mb-1 block">
              Deskripsi
            </label>
            <input
              value={globalSettings.site_description || ""}
              onChange={(e) =>
                updateSetting("site_description", e.target.value)
              }
              className="w-full border rounded p-2"
            />
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-sm text-emerald-dark mb-1 block">
              Email Kontak
            </label>
            <input
              value={globalSettings.contact_email || ""}
              onChange={(e) => updateSetting("contact_email", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {/* PHONE */}
          <div className="mb-4">
            <label className="text-sm text-emerald-dark mb-1 block">
              Telepon
            </label>
            <input
              value={globalSettings.contact_phone || ""}
              onChange={(e) => updateSetting("contact_phone", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {/* ADDRESS */}
          <div className="mb-4">
            <label className="text-sm text-emerald-dark mb-1 block">
              Alamat
            </label>
            <textarea
              value={globalSettings.address || ""}
              onChange={(e) => updateSetting("address", e.target.value)}
              className="w-full border rounded p-2"
              rows={3}
            />
          </div>

          {/* FOOTER */}
          <div className="mb-4">
            <label className="text-sm text-emerald-dark mb-1 block">
              Footer
            </label>
            <input
              value={globalSettings.footer_text || ""}
              onChange={(e) => updateSetting("footer_text", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <button
            onClick={saveGlobal}
            disabled={savingGlobal}
            className="bg-emerald-dark hover:bg-emerald-800 text-white px-4 py-2 rounded transition"
          >
            {savingGlobal ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
