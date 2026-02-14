import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail } from "lucide-react";
import Swal from "sweetalert2"; // Import SweetAlert2

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Toast Success: Lebih elegan daripada alert biasa
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      await Toast.fire({
        icon: "success",
        title: "Login Berhasil!",
        text: "Selamat datang kembali, Admin.",
      });

      navigate("/admin");
    } catch (error) {
      // TypeScript secara default menganggap error adalah 'unknown'
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal login. Periksa kembali akun Anda.";

      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: errorMessage,
        confirmButtonColor: "#111827",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-dark islamic-pattern px-4">
      <div className="w-full max-w-md bg-emerald-light backdrop-blur-md shadow-2xl p-8 rounded-2xl border border-gold/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-4">
            <Lock className="text-gold w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Portal
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Silakan login untuk mengelola konten IKADI Jatim
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                placeholder="admin@ikadijatim.org"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-white font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 PW IKADI Jawa Timur. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
