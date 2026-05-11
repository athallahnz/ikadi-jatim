import { useState } from "react";

import { supabase } from "@/lib/supabase";

import { Mail, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =======================================================
     RESET PASSWORD
  ======================================================= */

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
        confirmButtonColor: "#ef4444",
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Email reset dikirim",
        text: "Silakan cek email Anda untuk melanjutkan proses reset password.",
        confirmButtonColor: "#10b981",
      });
    }

    setLoading(false);
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06110f]">
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      {/* Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.12),_transparent_30%),linear-gradient(to_bottom_right,#06110f,#081815,#0b1f1b)]" />

      {/* Islamic Pattern */}
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

      {/* ===================================================
          CONTENT
      =================================================== */}

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
              <ShieldCheck className="w-4 h-4" />
              Secure Account Recovery
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
              Lupa
              <span className="block text-gold">Password?</span>
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
              Masukkan email akun Anda dan kami akan mengirimkan link reset
              password untuk memulihkan akses dashboard administrasi.
            </p>

            {/* Features */}

            <div className="space-y-4">
              {[
                "Encrypted Password Recovery",
                "Secure Reset Verification",
                "Realtime Authentication System",
                "Protected Admin Access",
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
              RESET CARD
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
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

              {/* Accent */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

              <div className="relative z-10 p-8 md:p-10">
                {/* HEADER */}

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
                    <Mail className="text-gold w-9 h-9" />
                  </div>

                  <h1 className="text-3xl font-display font-bold text-white">
                    Reset Password
                  </h1>

                  <p className="text-white/60 text-sm mt-3 leading-relaxed">
                    Masukkan email akun Anda untuk menerima link reset password
                  </p>
                </div>

                {/* FORM */}

                <form onSubmit={handleReset} className="space-y-6">
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

                    <p className="text-xs text-white/40 leading-relaxed pt-1">
                      Kami akan mengirimkan link reset password ke email yang
                      terdaftar.
                    </p>
                  </div>

                  {/* BUTTON */}

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
                      "Kirim Link Reset"
                    )}
                  </button>
                </form>

                {/* BACK BUTTON */}

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate("/admin/login")}
                    className="
                      inline-flex items-center gap-2
                      text-sm
                      text-emerald-300
                      hover:text-gold
                      transition-colors
                    "
                  >
                    <ArrowLeft size={16} />
                    Kembali ke Login
                  </button>
                </div>

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
