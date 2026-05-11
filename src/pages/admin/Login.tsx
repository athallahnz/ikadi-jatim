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
    <div className="relative min-h-screen overflow-hidden bg-[#06110f]">
      {/* =====================================================
        BACKGROUND
    ===================================================== */}

      {/* Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.12),_transparent_30%),linear-gradient(to_bottom_right,#06110f,#081815,#0b1f1b)]" />

      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-[0.035]" />

      {/* Glow Orb 1 */}
      <div
        className="
        absolute
        -top-32
        -left-32
        w-[420px]
        h-[420px]
        rounded-full
        bg-emerald-500/10
        blur-3xl
        animate-pulse
      "
      />

      {/* Glow Orb 2 */}
      <div
        className="
        absolute
        bottom-0
        right-0
        w-[500px]
        h-[500px]
        rounded-full
        bg-yellow-500/10
        blur-3xl
      "
      />

      {/* Grid Overlay */}
      <div
        className="
        absolute inset-0
        opacity-[0.03]
        [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]
        [background-size:60px_60px]
      "
      />

      {/* =====================================================
        CONTENT WRAPPER
    ===================================================== */}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
          {/* =================================================
            LEFT SIDE
        ================================================= */}

          <div className="hidden lg:flex flex-col justify-center">
            {/* Badge */}

            <div
              className="
              inline-flex items-center gap-2
              px-4 py-2
              rounded-full
              border border-emerald-400/20
              bg-emerald-500/10
              backdrop-blur-xl
              text-emerald-300
              text-sm
              font-medium
              w-fit
              mb-6
            "
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Secure Admin System
            </div>

            {/* Title */}

            <h1
              className="
              text-5xl xl:text-6xl
              font-display
              font-bold
              text-white
              leading-tight
              mb-6
            "
            >
              Dashboard
              <span className="block text-gold">IKADI Jawa Timur</span>
            </h1>

            {/* Subtitle */}

            <p
              className="
              text-lg
              text-white/70
              leading-relaxed
              max-w-xl
              mb-10
            "
            >
              Sistem administrasi terintegrasi untuk mengelola artikel, agenda
              dakwah, media publikasi, dan aktivitas organisasi, serta mengelola
              data konsultasi syariah secara realtime.
            </p>

            {/* Feature List */}

            <div className="space-y-4">
              {[
                "Realtime Content Management",
                "Role Based Access Control",
                "Secure Authentication System",
                "Cloud Integrated Dashboard",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className="
                    w-10 h-10
                    rounded-xl
                    bg-white/5
                    border border-white/10
                    flex items-center justify-center
                    backdrop-blur
                  "
                  >
                    <div className="w-2 h-2 rounded-full bg-gold" />
                  </div>

                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================
            LOGIN CARD
        ================================================= */}

          <div className="w-full flex justify-center">
            <div
              className="
              relative
              w-full
              max-w-md
              overflow-hidden
              rounded-3xl
              border border-white/10
              bg-white/[0.04]
              backdrop-blur-2xl
              shadow-[0_20px_80px_rgba(0,0,0,0.45)]
            "
            >
              {/* Card Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

              {/* Top Accent */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

              <div className="relative z-10 p-8 md:p-10">
                {/* Logo */}

                <div className="text-center mb-8">
                  <div
                    className="
                    inline-flex items-center justify-center
                    w-20 h-20
                    rounded-2xl
                    bg-gradient-to-br
                    from-emerald-400/20
                    to-yellow-400/20
                    border border-white/10
                    shadow-lg
                    mb-5
                  "
                  >
                    <Lock className="text-gold w-9 h-9" />
                  </div>

                  <h1 className="text-3xl font-display font-bold text-white">
                    Admin Portal
                  </h1>

                  <p className="text-white/60 text-sm mt-3">
                    Login untuk mengakses dashboard IKADI
                  </p>
                </div>

                {/* GOOGLE LOGIN */}

                <button
                  onClick={handleGoogleLogin}
                  className="
                  w-full
                  flex items-center justify-center gap-3
                  rounded-xl
                  border border-white/10
                  bg-white/[0.03]
                  hover:bg-white/[0.06]
                  py-3
                  transition-all
                  duration-300
                  text-white
                  font-medium
                  backdrop-blur
                "
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    className="w-5 h-5"
                  />
                  Login dengan Google
                </button>

                {/* Divider */}

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/10" />

                  <span className="text-xs tracking-widest text-white/40">
                    ATAU
                  </span>

                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* FORM */}

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* EMAIL */}

                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Email</label>

                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-300 transition" />

                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@ikadijatim.org"
                        className="
                        w-full
                        pl-11 pr-4 py-3
                        rounded-xl
                        border border-white/10
                        bg-white/[0.03]
                        text-white
                        placeholder:text-white/30
                        outline-none
                        transition-all
                        focus:border-emerald-400/40
                        focus:ring-4
                        focus:ring-emerald-400/10
                        backdrop-blur
                      "
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}

                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Password</label>

                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-300 transition" />

                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="
                        w-full
                        pl-11 pr-12 py-3
                        rounded-xl
                        border border-white/10
                        bg-white/[0.03]
                        text-white
                        placeholder:text-white/30
                        outline-none
                        transition-all
                        focus:border-emerald-400/40
                        focus:ring-4
                        focus:ring-emerald-400/10
                        backdrop-blur
                      "
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* OPTIONS */}

                  <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center gap-2 text-white/60">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                        className="rounded border-white/20 bg-transparent"
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-emerald-300 hover:text-gold transition"
                    >
                      Lupa password?
                    </button>
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                    w-full
                    h-12
                    rounded-xl
                    bg-gradient-to-r
                    from-emerald-500
                    to-emerald-600
                    hover:from-emerald-400
                    hover:to-emerald-500
                    text-white
                    font-semibold
                    transition-all
                    duration-300
                    shadow-lg
                    shadow-emerald-500/20
                    flex items-center justify-center gap-2
                    disabled:opacity-60
                  "
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Masuk ke Dashboard"
                    )}
                  </button>
                </form>

                {/* FOOTER */}

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-xs text-white/40">
                    © 2026 PW IKADI Jawa Timur
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
