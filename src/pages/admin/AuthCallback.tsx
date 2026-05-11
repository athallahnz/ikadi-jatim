import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("SESSION:", session);

        if (error || !session) {
          console.error("Auth Error:", error);

          navigate("/admin/login");

          return;
        }

        navigate("/admin");
      } catch (err) {
        console.error(err);

        navigate("/admin/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Memproses login Google...</p>
    </div>
  );
}
