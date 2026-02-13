import { Mail, MapPin, Phone, Instagram, Facebook } from "lucide-react";
import logoIkadi from "@/assets/logo-ikadi.png";

const FooterSection = () => {
  return (
    <footer className="bg-emerald-dark islamic-pattern-dark py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 text-primary-foreground/80">
          {/* Brand */}
          <div>
            <img
              src={logoIkadi}
              alt="Logo IKADI Jawa Timur"
              className="h-24 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm leading-relaxed text-primary-foreground/60">
              Pengurus Wilayah Ikatan Da'i Indonesia Jawa Timur. Bersama
              membangun dakwah yang profesional, hangat, dan berdampak.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Informasi & Kontak
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>
                  Jl. Ahmad Yani No.153, Gayungan, Kec. Wonocolo, Surabaya, Jawa
                  Timur 60235
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <span>info@ikadijatim.or.id</span>
              </div>
            </div>
          </div>

          {/* Links & Social */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {/* Social Media - LEFT */}
              <div>
                <h4 className="font-semibold text-primary-foreground mb-4">
                  Sosial Media
                </h4>
                <div className="space-y-3 text-sm">
                  <a
                    href="#"
                    className="flex items-center gap-2 hover:text-gold transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>

                  <a
                    href="#"
                    className="flex items-center gap-2 hover:text-gold transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>

                  <a
                    href="#"
                    className="flex items-center gap-2 hover:text-gold transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3a8.5 8.5 0 0 1-4.5-1.5v6a6 6 0 1 1-6-6c.3 0 .6 0 .9.1v3a3 3 0 1 0 2.1 2.9V3h3z" />
                    </svg>
                    TikTok
                  </a>
                </div>
              </div>

              {/* Tautan - RIGHT */}
              <div>
                <h4 className="font-semibold text-primary-foreground mb-4">
                  Tautan
                </h4>
                <div className="space-y-2 text-sm">
                  <a
                    href="#tentang"
                    className="block hover:text-gold transition-colors"
                  >
                    Tentang Kami
                  </a>
                  <a
                    href="#program"
                    className="block hover:text-gold transition-colors"
                  >
                    Program
                  </a>
                  <a
                    href="#agenda"
                    className="block hover:text-gold transition-colors"
                  >
                    Agenda
                  </a>
                  <a
                    href="#artikel"
                    className="block hover:text-gold transition-colors"
                  >
                    Artikel
                  </a>
                  <a
                    href="#kolaborasi"
                    className="block hover:text-gold transition-colors"
                  >
                    Kolaborasi
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} PW IKADI Jawa Timur. Hak cipta
            dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
