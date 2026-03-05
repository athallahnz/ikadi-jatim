import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ShieldX, LogOut, Mail } from "lucide-react";

export default function Rejected() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: "global" });

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-")) {
        localStorage.removeItem(key);
      }
    });

    sessionStorage.clear();

    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern px-4">
      <div className="w-full max-w-lg bg-card shadow-2xl rounded-2xl border border-border p-10 text-center">
        {/* ICON */}
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100 text-red-600">
          <ShieldX size={40} />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-display font-bold text-foreground mb-3">
          Permohonan Akses Ditolak
        </h1>

        {/* DESCRIPTION */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Maaf, akun Anda tidak disetujui untuk mengakses panel admin IKADI Jawa
          Timur. Jika Anda merasa ini adalah kesalahan atau memerlukan
          klarifikasi, silakan hubungi admin pusat.
        </p>

        {/* CONTACT */}
        <div className="bg-muted/40 border border-border rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Hubungi Admin Pusat:
          </p>

          <a
            href="mailto:admin@ikadijatim.org"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <Mail size={16} />
            admin@ikadijatim.org
          </a>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition"
          >
            Kembali ke Website
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-border py-2.5 rounded-lg hover:bg-muted transition"
          >
            <LogOut size={16} />
            Keluar dari Akun
          </button>
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
          © {new Date().getFullYear()} PW IKADI Jawa Timur
        </div>
      </div>
    </div>
  );
}
