import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// Interface spesifik sesuai struktur tabel admins
export interface Admin {
  id: string;
  name: string;
  role: "admin" | "editor";
  scope: "jatim" | "daerah";
  status: "pending" | "active" | "rejected" | "blocked";
  daerah?: string | null;
  daerah_slug?: string | null;
  brand_name?: string | null;
  brand_logo?: string | null;
}

export function useAdmin() {
  const { session } = useAuth();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const userId = session?.user?.id;
  const email = session?.user?.email;

  useEffect(() => {
    // Jika tidak ada session, hentikan proses
    if (!userId) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    const loadAdminData = async () => {
      try {
        setLoading(true);

        // 1. Ambil data admin berdasarkan ID user yang login
        const { data, error } = await supabase
          .from("admins")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // 2. Registrasi otomatis jika data belum ada di tabel admins
          const { data: newAdmin, error: insertError } = await supabase
            .from("admins")
            .insert({
              id: userId,
              name: email || "User Baru",
              role: "editor",
              scope: "daerah",
              status: "pending",
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setAdmin(newAdmin as Admin);
        } else {
          // 3. Set data admin jika ditemukan
          setAdmin(data as Admin);

          // 4. Proteksi Keamanan: Kick user jika status diblokir atau ditolak
          if (data.status === "blocked" || data.status === "rejected") {
            await supabase.auth.signOut();
            window.location.replace(`/admin/${data.status}`);
          }
        }
      } catch (err) {
        console.error("Gagal memuat profil admin:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [userId, email]);

  return { admin, loading };
}
