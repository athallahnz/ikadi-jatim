import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  /* ================= LOGIN EMAIL ================= */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        Swal.fire({
          icon: "success",
          title: "Login berhasil",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/admin");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login gagal";

      Swal.fire({
        icon: "error",
        title: "Login gagal",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGIN GOOGLE ================= */

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "consent select_account",
        },
      },
    });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Login Google gagal",
        text: error.message,
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/admin");
      }
    });
  }, [navigate]);
  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern px-4">
      <div className="w-full max-w-md bg-card backdrop-blur shadow-2xl p-8 rounded-2xl border border-border">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Lock className="text-primary w-8 h-8" />
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Portal
          </h1>

          <p className="text-muted-foreground text-sm mt-2">
            Login untuk mengelola konten IKADI Jatim
          </p>
        </div>

        {/* GOOGLE LOGIN */}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-border rounded-lg py-2.5 mb-5 hover:bg-muted transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          <span className="font-medium text-sm">Login dengan Google</span>
        </button>

        {/* Divider */}

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5">
          <div className="flex-1 h-px bg-border" />
          ATAU
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* FORM LOGIN */}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* EMAIL */}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>

            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ikadijatim.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition" />

              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/30 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="rounded border-border text-primary focus:ring-primary
              focus:ring-2 focus:ring-offset-0"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-primary hover:underline"
            >
              Lupa password?
            </button>
          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

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
