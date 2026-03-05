import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Email reset dikirim",
        text: "Silakan cek email Anda",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern px-4">
      <div className="w-full max-w-md bg-card backdrop-blur shadow-2xl p-8 rounded-2xl border border-border">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mail className="text-primary w-8 h-8" />
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground">
            Reset Password
          </h1>

          <p className="text-muted-foreground text-sm mt-2">
            Masukkan email Anda untuk menerima link reset password
          </p>
        </div>

        {/* FORM */}

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>

            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition" />

              <input
                type="email"
                required
                placeholder="admin@ikadijatim.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Kirim Link Reset"
            )}
          </button>
        </form>

        {/* BACK */}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-primary flex items-center justify-center gap-2 hover:underline"
          >
            <ArrowLeft size={16} />
            Kembali ke Login
          </button>
        </div>

        {/* FOOTER */}

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 PW IKADI Jawa Timur
          </p>
        </div>
      </div>
    </div>
  );
}
