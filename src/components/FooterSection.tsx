import { Mail, MapPin, Phone } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="bg-emerald-dark islamic-pattern-dark py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-10 text-primary-foreground/80">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-bold text-primary-foreground mb-4">
              PW IKADI <span className="text-gold text-sm font-sans">Jawa Timur</span>
            </h3>
            <p className="text-sm leading-relaxed text-primary-foreground/60">
              Pengurus Wilayah Ikatan Da'i Indonesia Jawa Timur. Bersama membangun dakwah yang profesional, hangat, dan berdampak.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Kontak</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>Jl. Dakwah No. 123, Surabaya, Jawa Timur 60000</span>
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

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Tautan</h4>
            <div className="space-y-2 text-sm">
              <a href="#tentang" className="block hover:text-primary-foreground transition-colors">Tentang Kami</a>
              <a href="#program" className="block hover:text-primary-foreground transition-colors">Program</a>
              <a href="#agenda" className="block hover:text-primary-foreground transition-colors">Agenda</a>
              <a href="#artikel" className="block hover:text-primary-foreground transition-colors">Artikel</a>
              <a href="#kolaborasi" className="block hover:text-primary-foreground transition-colors">Kolaborasi</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} PW IKADI Jawa Timur. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
