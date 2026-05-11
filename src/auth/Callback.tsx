import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      /**
       * GET ADMIN DATA
       */

      const { data: admin } = await supabase
        .from("admins")
        .select("role")
        .eq("email", session.user.email)
        .single();

      /**
       * ROLE BASED REDIRECT
       */

      if (admin?.role === "konsultan") {
        navigate("/admin/consultations", {
          replace: true,
        });
      } else {
        navigate("/admin", {
          replace: true,
        });
      }
    };

    handle();
  }, [navigate]);

  return <LoadingSpinner />;
}
