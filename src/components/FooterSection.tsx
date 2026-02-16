import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Mail,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Music2,
  Link as LinkIcon,
} from "lucide-react";
import logoIkadi from "@/assets/logo-ikadi.png";

type SocialLink = {
  id: string;
  platform: string;
  url: string;
};

const FooterSection = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [socials, setSocials] = useState<SocialLink[]>([]);

  // GABUNGKAN SEMUA FETCH KE SATU EFFECT
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Socials
      const { data: socialData } = await supabase
        .from("social_links")
        .select("*")
        .order("order_num", { ascending: true });
      if (socialData) setSocials(socialData);

      // 2. Fetch Settings
      const { data: settingData } = await supabase
        .from("settings")
        .select("key, value");
      if (settingData) {
        const map = settingData.reduce(
          (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
          {},
        );
        setSettings(map);
      }
    };
    fetchData();
  }, []);

  const renderIcon = (platform: string) => {
    const p = platform.toLowerCase();
    const props = {
      className: "hover:text-gold cursor-pointer transition-colors",
      size: 22,
    };

    if (p.includes("instagram")) return <Instagram {...props} />;
    if (p.includes("facebook")) return <Facebook {...props} />;
    if (p.includes("youtube")) return <Youtube {...props} />;
    if (p.includes("twitter") || p.includes("x")) return <Twitter {...props} />;
    if (p.includes("tiktok")) return <Music2 {...props} />;
    return <LinkIcon {...props} />;
  };

  return (
    <footer className="bg-emerald-dark islamic-pattern-dark py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 text-primary-foreground/80">
          {/* Brand & site_description */}
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

          {/* Media Sosial */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Media Sosial
            </h4>
            <div className="flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground"
                  title={social.platform}
                >
                  {renderIcon(social.platform)}
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs font-bold text-gold uppercase tracking-tighter">
              {settings.site_title}
            </p>
          </div>
        </div>

        {/* Footer Text Copyright */}
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
