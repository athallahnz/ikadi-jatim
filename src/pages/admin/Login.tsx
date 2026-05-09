import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

// --- Interfaces ---
interface AuthError {
  message: string;
  status?: number;
}

interface AdminData {
  role: "admin" | "editor" | "konsultan";
  status: "pending" | "active" | "rejected" | "blocked";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  /* ================= LOGIN EMAIL ================= */

  // --- handleLogin Function ---
  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign In ke Auth Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError as AuthError;

      if (authData.session) {
        // 2. Ambil data profil admin
        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("role, status")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (adminError) throw adminError as AuthError;

        // Proteksi jika data di tabel admins belum dibuat
        if (!adminData) {
          await supabase.auth.signOut();
          throw new Error("Profil admin tidak ditemukan. Hubungi IT Support.");
        }

        // Proteksi status akun
        const admin = adminData as AdminData;
        if (admin.status !== "active") {
          await supabase.auth.signOut();
          const statusMsg: Record<string, string> = {
            pending: "Akun Anda masih dalam antrean aktivasi.",
            blocked: "Akun Anda telah diblokir oleh sistem.",
            rejected: "Pendaftaran akun Anda ditolak.",
          };
          throw new Error(statusMsg[admin.status] || "Akses ditolak.");
        }

        // 3. Notifikasi Berhasil
        Swal.fire({
          icon: "success",
          title: "Login Berhasil",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
        });

        // 4. Role-Based Redirect
        if (admin.role === "konsultan") {
          navigate("/admin/consultations");
        } else {
          navigate("/admin");
        }
      }
    } catch (err: unknown) {
      // Penanganan error tanpa 'any'
      let errorMessage = "Terjadi kesalahan saat login.";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as AuthError).message;
      }

      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
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

  // Efek ini menangani jika user sudah punya session aktif saat buka halaman login
  useEffect(() => {
    const checkActiveSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Cek ulang role untuk redirect
        const { data } = await supabase
          .from("admins")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (data?.role === "konsultan") {
          navigate("/admin/consultations");
        } else {
          navigate("/admin");
        }
      }
    };
    checkActiveSession();
  }, [navigate]);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern px-4">
      {/* ... (UI tetap sama seperti sebelumnya) ... */}
      <div className="w-full max-w-md bg-card backdrop-blur shadow-2xl p-8 rounded-2xl border border-border">
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

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5">
          <div className="flex-1 h-px bg-border" />
          ATAU
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
                className="rounded border-border text-primary focus:ring-primary focus:ring-2 focus:ring-offset-0"
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

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 PW IKADI Jawa Timur
          </p>
        </div>
      </div>
    </div>
  );
}
