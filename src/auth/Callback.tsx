import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        navigate("/admin");
      } else {
        navigate("/admin/login");
      }
    };

    handle();
  }, [navigate]);

  return <LoadingSpinner />;
  ;
}
