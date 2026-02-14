import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Admin = {
  id: string;
  name: string;
  role: string;
  scope: "jatim" | "daerah";
  daerah?: string | null;
  daerah_slug?: string | null;
  brand_name?: string | null;
  brand_logo?: string | null;
};


export function useAdmin() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        setLoading(false);
        return;
      }

      const { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setAdmin(adminData as Admin);
      setLoading(false);
    }

    load();
  }, []);

  return { admin, loading };
}
