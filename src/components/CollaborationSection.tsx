import { useState } from "react";
import { Users, Mic2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FormType = "anggota" | "dai" | "donasi";

const tabs: { key: FormType; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "anggota", label: "Daftar Anggota", icon: Users, desc: "Bergabunglah menjadi bagian dari keluarga besar IKADI Jawa Timur." },
  { key: "dai", label: "Undang Da'i", icon: Mic2, desc: "Hadirkan da'i profesional untuk acara atau kegiatan Anda." },
  { key: "donasi", label: "Donasi Dakwah", icon: Heart, desc: "Dukung program dakwah kami agar semakin luas manfaatnya." },
];

const CollaborationSection = () => {
  const [active, setActive] = useState<FormType>("anggota");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const activeTab = tabs.find((t) => t.key === active)!;

  return (
    <section id="kolaborasi" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Mari Ambil Bagian Dalam Dakwah
          </h2>
          <div className="gold-divider mx-auto" />
        </div>

        <div className="max-w-2xl mx-auto animate-on-scroll">
          {/* Tab selector */}
          <div className="flex gap-2 mb-8 justify-center flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActive(tab.key); setSubmitted(false); }}
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

          {/* Form */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
            <p className="text-muted-foreground text-center mb-6">{activeTab.desc}</p>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <p className="font-display font-semibold text-foreground text-lg">Jazakallahu Khairan!</p>
                <p className="text-muted-foreground text-sm mt-1">Kami akan segera menghubungi Anda.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Nama Lengkap" required />
                <Input placeholder="Nomor WhatsApp" type="tel" required />
                <Input placeholder="Email" type="email" required />
                <Textarea placeholder="Pesan atau keterangan tambahan" rows={3} />
                <Button type="submit" className="w-full" size="lg">
                  {active === "anggota" && "Daftar Sekarang"}
                  {active === "dai" && "Kirim Permintaan"}
                  {active === "donasi" && "Lanjutkan Donasi"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollaborationSection;
