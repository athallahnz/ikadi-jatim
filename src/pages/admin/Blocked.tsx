import { ShieldX } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Blocked() {
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
      <div className="w-full max-w-md bg-card backdrop-blur shadow-2xl p-8 rounded-2xl border border-border text-center">
        {/* ICON */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <ShieldX className="text-red-600 w-8 h-8" />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Akses Diblokir
        </h1>

        {/* MESSAGE */}
        <p className="text-sm text-muted-foreground mb-6">
          Akun admin Anda telah diblokir oleh administrator pusat.
          <br />
          Jika Anda merasa ini adalah kesalahan, silakan hubungi tim pusat IKADI
          Jawa Timur.
        </p>

        {/* BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition"
        >
          Kembali ke Login
        </button>

        {/* FOOTER */}
        <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
          © {new Date().getFullYear()} PW IKADI Jawa Timur
        </div>
      </div>
    </div>
  );
}
