import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function WaitingApproval() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user?.id) return;

    const userId = session.user.id;

    // fungsi cek status
    const checkStatus = async () => {
      const { data, error } = await supabase
        .from("admins")
        .select("status")
        .eq("id", userId)
        .single();

      if (!error && data?.status === "active") {
        navigate("/admin");
      }
    };

    // cek sekali saat halaman load
    checkStatus();

    // fallback polling setiap 5 detik
    const interval = setInterval(checkStatus, 5000);

    // realtime listener
    const channel = supabase
      .channel("admin-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admins",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log("Realtime payload:", payload);

          if (payload.new.status === "active") {
            navigate("/admin");
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [session, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center max-w-md">
        <Loader2 className="animate-spin w-10 h-10 mx-auto mb-4 text-emerald-600" />

        <h1 className="text-2xl font-bold mb-3">Menunggu Persetujuan Admin</h1>

        <p className="text-muted-foreground">
          Akun Anda sedang diverifikasi oleh admin pusat. Halaman ini akan
          otomatis terbuka jika akun Anda sudah disetujui.
        </p>
      </div>
    </div>
  );
}
