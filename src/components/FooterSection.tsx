import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, MapPin, Phone } from "lucide-react";
import logoIkadi from "@/assets/logo-ikadi.png";

type SocialLink = {
  id: string;
  platform: string;
  url: string;
};

const FooterSection = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: socialData } = await supabase
        .from("social_links")
        .select("*")
        .order("order_num", { ascending: true });

      if (socialData) setSocials(socialData);

      const { data: settingData } = await supabase
        .from("settings")
        .select("key, value");

      if (settingData) {
        const map = settingData.reduce<Record<string, string>>((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        setSettings(map);
      }
    };

    fetchData();
  }, []);

  // ✅ Font Awesome icon mapper
  const getFaIcon = (platform: string) => {
    const p = platform.toLowerCase();

    if (p.includes("instagram")) return "fa-instagram";
    if (p.includes("facebook")) return "fa-facebook-f";
    if (p.includes("youtube")) return "fa-youtube";
    if (p.includes("twitter") || p.includes("x")) return "fa-x-twitter";
    if (p.includes("tiktok")) return "fa-tiktok";
    if (p.includes("linkedin")) return "fa-linkedin-in";

    return "fa-link";
  };

  return (
    <footer className="bg-emerald-dark islamic-pattern-dark py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 text-primary-foreground/80">
          {/* Brand */}
          <div>
            <img
              src={logoIkadi}
              alt="Logo"
              className="h-20 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm leading-relaxed text-primary-foreground/60 italic">
              {settings.site_description || "Memuat deskripsi..."}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Kontak Kami
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <span>{settings.contact_phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <span>{settings.contact_email}</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Media Sosial
            </h4>

            <div className="flex gap-4 text-xl">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground hover:text-gold transition-colors hover:scale-110"
                  title={social.platform}
                >
                  <i className={`fa-brands ${getFaIcon(social.platform)}`} />
                </a>
              ))}
            </div>

            <p className="mt-6 text-xs font-bold text-gold uppercase tracking-tighter">
              {settings.site_title}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()}{" "}
            {settings.footer_text || "IKADI Jawa Timur"}. Hak Cipta Dilindungi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
