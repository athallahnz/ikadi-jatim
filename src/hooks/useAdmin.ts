import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export type Admin = {
  id: string;
  name: string;
  role: "admin" | "editor";
  scope: "jatim" | "daerah";
  status: "pending" | "active" | "rejected" | "blocked";
  daerah?: string | null;
  daerah_slug?: string | null;
  brand_name?: string | null;
  brand_logo?: string | null;
};

export function useAdmin() {
  const { session } = useAuth();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;
  const email = session?.user?.email;

  /* ================= LOAD ADMIN ================= */

  useEffect(() => {
    if (!userId) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    const loadAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from("admins")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;

        // ================= AUTO REGISTER =================
        if (!data) {
          const { data: newAdmin, error: insertError } = await supabase
            .from("admins")
            .insert({
              id: userId,
              name: email,
              role: "editor",
              scope: "daerah",
              status: "pending",
            })
            .select()
            .single();

          if (insertError) throw insertError;

          setAdmin(newAdmin);
        } else {
          setAdmin(data);

          // ================= STATUS SECURITY =================

          if (data.status === "blocked") {
            await supabase.auth.signOut();
            window.location.href = "/admin/blocked";
            return;
          }

          if (data.status === "rejected") {
            await supabase.auth.signOut();
            window.location.href = "/admin/rejected";
            return;
          }
        }
      } catch (err) {
        console.error("Admin load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, [userId, email]);

  /* ================= REALTIME STATUS WATCH ================= */

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("admin-status-watch")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admins",
          filter: `id=eq.${userId}`,
        },
        async (payload) => {
          const newStatus = payload.new.status;

          console.log("Realtime status change:", newStatus);

          if (newStatus === "active") {
            window.location.href = "/admin";
          }

          if (newStatus === "blocked") {
            await supabase.auth.signOut();
            window.location.href = "/admin/blocked";
          }

          if (newStatus === "rejected") {
            await supabase.auth.signOut();
            window.location.href = "/admin/rejected";
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { admin, loading };
}
