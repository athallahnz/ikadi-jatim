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

      if (session) {
        navigate("/admin", {
          replace: true,
        });
      } else {
        navigate("/admin/login", {
          replace: true,
        });
      }
    };

    handle();
  }, [navigate]);

  return <LoadingSpinner />;
}
