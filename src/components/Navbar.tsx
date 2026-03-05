import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import logoIkadi from "@/assets/logo-ikadi.png";

/* ================= DATA ================= */

const navLinks = [
  {
    label: "Tentang",
    children: [
      { label: "Profil & Sejarah", to: "/tentang/profil" },
      { label: "Struktur Organisasi", to: "/tentang/struktur" },
    ],
  },
  {
    label: "Program",
    children: [
      { label: "Kuliah Agama Islam", to: "/program/kuliah" },
      { label: "Pembinaan Da'i", to: "/program/pembinaan" },
      { label: "Konsultasi", to: "/program/konsultasi" },
    ],
  },
  {
    label: "Kabar IKADI",
    children: [
      { label: "Kabar IKADI Jawa Timur", to: "/kabar/jatim" },
      { label: "Kabar IKADI Daerah", to: "/kabar/daerah" },
    ],
  },
  {
    label: "Kajian",
    children: [
      { label: "Khutbah", to: "/kajian/khutbah" },
      { label: "Mutiara Al Qur'an", to: "/kajian/mutiara-al-quran" },
      { label: "Mutiara Hadits", to: "/kajian/mutiara-hadits" },
      { label: "Hikmah", to: "/kajian/hikmah" },
      { label: "Inspirasi", to: "/kajian/inspirasi" },
      { label: "Taujih", to: "/kajian/taujih" },
      { label: "Kisah", to: "/kajian/kisah" },
    ],
  },
  { label: "Galeri", to: "/galeri" },
  // { label: "Kolaborasi", to: "/kolaborasi" },
];

/* ================= COMPONENT ================= */

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [triggerPulse, setTriggerPulse] = useState(false);

  /* ===== CTA pulse ===== */
  useEffect(() => {
    if (!showCTA) return;

    const timer = setTimeout(() => {
      setTriggerPulse(true);
      setTimeout(() => setTriggerPulse(false), 3600);
    }, 600);

    return () => clearTimeout(timer);
  }, [showCTA]);

  /* ===== Hero observer ===== */
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowCTA(!entry.isIntersecting),
      { threshold: 0.3 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  /* ===== Scroll ===== */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ===== Lock body scroll ===== */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const navInactive = isScrolled ? "text-muted-foreground" : "text-foreground";
  const navActive =
    "text-primary font-semibold after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[2px] after:bg-gold";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 will-change-transform ${
        isScrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-gold/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-20 xl:h-24">
        {/* Logo */}
        <NavLink to="/" className="flex items-center">
          <img src={logoIkadi} alt="IKADI Jawa Timur" className="h-16 w-auto" />
        </NavLink>

        {/* ================= DESKTOP ================= */}
        <div className="hidden xl:flex items-center gap-6">
          <div
            className={`flex items-center gap-10 transition-colors duration-500 ease-smooth ${
              showCTA ? "translate-x-0" : "translate-x-4"
            }`}
          >
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative group">
                  <span
                    className={`relative text-lg font-medium cursor-pointer transition-colors ${
                      link.children.some((c) =>
                        location.pathname.startsWith(c.to),
                      )
                        ? navActive
                        : navInactive
                    } hover:text-primary`}
                  >
                    {link.label}
                  </span>

                  <div className="absolute left-0 top-full mt-8 w-64 bg-background/95 backdrop-blur-md border border-gold/30 shadow-xl opacity-0 invisible scale-95 translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-y-0 transition-colors duration-300 origin-top">
                    <div className="py-3">
                      {link.children.map((child) => (
                        <NavLink
                          key={child.label}
                          to={child.to}
                          className={({ isActive }) =>
                            `block px-6 py-3 text-base transition-colors ${
                              isActive
                                ? "text-primary font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative text-lg font-medium transition-colors ${
                      isActive || location.hash.includes("kolaborasi")
                        ? navActive
                        : navInactive
                    } hover:text-primary`
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}

            <NavLink
              to="/konsultasi"
              className="relative overflow-hidden px-6 py-3 rounded-md bg-primary text-primary-foreground text-lg font-semibold shadow-md hover:shadow-lg transition-colors duration-300 hover:scale-[1.04]"
            >
              <span className="relative z-10">konsultasisyariah.net</span>
              <span className="absolute inset-0 shimmer-effect" />
            </NavLink>
          </div>

          {/* CTA Animated */}
          <div
            className={`transition-colors duration-500 ease-smooth ${
              showCTA
                ? "opacity-100 translate-x-0 scale-100 delay-200"
                : "opacity-0 translate-x-6 scale-95"
            }`}
          >
            <Button
              size="lg"
              className={`px-8 py-6 text-base whitespace-nowrap cta-glow flex items-center gap-2 ${
                triggerPulse ? "pulse-once" : ""
              }`}
              asChild
            >
              <NavLink
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/", { replace: false });
                  setTimeout(() => {
                    window.location.hash = "kolaborasi?tab=anggota";
                  }, 0);
                }}
                className="flex items-center gap-2"
              >
                <UserPlus size={18} />
                Bergabung
              </NavLink>
            </Button>
          </div>

          <ThemeToggle />
        </div>

        {/* ================= MOBILE TOGGLE ================= */}
        <button
          className="xl:hidden text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {isOpen && (
        <div
          className="xl:hidden fixed inset-x-0 top-20 
             bg-background/95 backdrop-blur-xl
             px-6 pt-6 pb-12
             shadow-xl
             overflow-y-auto"
          style={{
            height: "calc(100dvh - 5rem)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="border-b border-border/40">
                <div className="py-4 font-semibold">{link.label}</div>
                <div className="pl-4 pb-4 space-y-3">
                  {link.children.map((child) => (
                    <NavLink
                      key={child.label}
                      to={child.to}
                      onClick={() => setIsOpen(false)}
                      className="block text-muted-foreground hover:text-primary"
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block py-4 border-b border-border/40"
              >
                {link.label}
              </NavLink>
            ),
          )}

          <div className="mt-6 flex items-center justify-center-start gap-6">
            <ThemeToggle />
          </div>

          <NavLink
            to="/konsultasi"
            className="block mt-8 px-6 py-3 rounded-md border border-primary text-primary text-center font-semibold"
          >
            konsultasisyariah.net
          </NavLink>

          <Button
            size="lg"
            className="mt-6 w-full py-6 flex items-center gap-2"
            asChild
          >
            <NavLink to="/" className="flex items-center justify-center gap-2">
              <UserPlus size={18} />
              Bergabung
            </NavLink>
          </Button>
        </div>
      )}

      {isScrolled && (
        <div className="absolute bottom-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
      )}
    </nav>
  );
}
