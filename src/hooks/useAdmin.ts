import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// Interface yang sudah diperluas
export interface Admin {
  id: string;
  name: string;
  // ✅ Tambahkan "konsultan" agar tidak crash/error typing
  role: "admin" | "editor" | "konsultan";
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
    if (!userId) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    const loadAdminData = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("admins")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // Registrasi otomatis jika belum ada
          const { data: newAdmin, error: insertError } = await supabase
            .from("admins")
            .insert({
              id: userId,
              name: email || "User Baru",
              role: "editor", // Default role
              scope: "daerah",
              status: "pending",
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setAdmin(newAdmin as Admin);
        } else {
          setAdmin(data as Admin);

          // 🛡️ PROTEKSI KEAMANAN
          // 1. Kick jika diblokir/ditolak
          if (data.status === "blocked" || data.status === "rejected") {
            await supabase.auth.signOut();
            window.location.replace(`/admin/${data.status}`);
            return;
          }

          // 2. Opsional: Berikan peringatan jika masih pending
          if (data.status === "pending") {
            console.warn("Akun masih pending, akses terbatas.");
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

  // ✅ Tambahkan helper isAuthorized agar pemakaian di komponen lebih gampang
  const isAuthorized = admin?.status === "active";

  return { admin, loading, isAuthorized };
}
