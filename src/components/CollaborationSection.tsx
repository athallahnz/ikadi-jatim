import { useEffect, useState } from "react";
import { Users, Mic2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

type FormType = "anggota" | "dai" | "donasi";

const tabs = [
  {
    key: "anggota",
    label: "Daftar Anggota",
    icon: Users,
    desc: "Bergabunglah menjadi bagian dari keluarga besar IKADI Jawa Timur.",
  },
  {
    key: "dai",
    label: "Undang Da'i",
    icon: Mic2,
    desc: "Hadirkan da'i profesional untuk acara atau kegiatan Anda.",
  },
  {
    key: "donasi",
    label: "Donasi Dakwah",
    icon: Heart,
    desc: "Dukung program dakwah kami agar semakin luas manfaatnya.",
  },
] as const;

export default function CollaborationSection() {
  const [active, setActive] = useState<FormType>("anggota");
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [loadingQris, setLoadingQris] = useState(true);

  const activeTab = tabs.find((t) => t.key === active)!;

  /* ================= NORMALIZE PHONE ================= */
  const normalizePhone = (p: string) => {
    const clean = p.replace(/\D/g, "");
    if (clean.startsWith("0")) return "62" + clean.slice(1);
    if (clean.startsWith("62")) return clean;
    return clean;
  };

  /* ================= LOAD QRIS ================= */
  useEffect(() => {
    const loadQris = async () => {
      setLoadingQris(true);

      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "qris")
        .single();

      if (data?.value) setQrisUrl(data.value);

      setLoadingQris(false);
    };

    loadQris();
  }, []);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash; // #kolaborasi?tab=dai
      if (!hash.includes("kolaborasi")) return;

      const [section, query] = hash.split("?");
      const params = new URLSearchParams(query);
      const tab = params.get("tab");

      if (tab === "anggota" || tab === "dai" || tab === "donasi") {
        setActive(tab);
      }

      const el = document.getElementById("kolaborasi");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setErrors({});
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (active === "donasi") return;

    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = "Nama wajib diisi";

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) newErrors.phone = "Nomor WhatsApp wajib diisi";
    else if (cleanPhone.length < 8) newErrors.phone = "Nomor minimal 8 digit";

    if (email && !/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = "Format email tidak valid";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const normalizedPhone = normalizePhone(phone);

    const { error } = await supabase.from("invitations").insert([
      {
        type: active,
        name,
        email,
        phone: normalizedPhone,
        message,
      },
    ]);

    if (!error) {
      setSubmitted(true);
      resetForm();
      setTimeout(() => setSubmitted(false), 3000);
    } else {
      console.error("Insert error:", error);
      alert("Gagal mengirim. Silakan coba lagi.");
    }
  };

  return (
    <section id="kolaborasi" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Mari Ambil Bagian Dalam Dakwah
          </h2>
          <div className="gold-divider mx-auto" />
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 justify-center flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActive(tab.key);
                  setSubmitted(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active === tab.key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
            <p className="text-muted-foreground text-center mb-6">
              {activeTab.desc}
            </p>

            {/* ================= DONASI ================= */}
            {active === "donasi" ? (
              <div className="text-center py-6 space-y-4">
                {loadingQris ? (
                  <div className="text-sm text-muted-foreground">
                    Memuat QRIS...
                  </div>
                ) : qrisUrl ? (
                  <img
                    src={qrisUrl}
                    alt="QRIS Donasi"
                    className="h-44 mx-auto object-contain"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    QRIS belum tersedia
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Scan QRIS untuk berdonasi. Tanpa perlu mengisi form.
                </p>
              </div>
            ) : submitted ? (
              /* SUCCESS */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <p className="font-display font-semibold text-foreground text-lg">
                  Jazakallahu Khairan!
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Kami akan segera menghubungi Anda.
                </p>
              </div>
            ) : (
              /* FORM */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Nama Lengkap"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((p) => ({ ...p, name: undefined }));
                    }}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Nomor WhatsApp"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((p) => ({ ...p, phone: undefined }));
                    }}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: undefined }));
                    }}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Textarea
                    placeholder="Pesan atau keterangan tambahan"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  {active === "anggota" && "Daftar Sekarang"}
                  {active === "dai" && "Kirim Permintaan"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
