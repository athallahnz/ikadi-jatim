import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";

type Props = {
  onMenuClick: () => void;
};

export default function AdminHeader({ onMenuClick }: Props) {
  const { admin } = useAdmin();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4 md:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* MOBILE MENU */}
        <button onClick={onMenuClick} className="md:hidden text-emerald-dark">
          ☰
        </button>

        <div className="font-semibold text-emerald-dark">Admin Panel</div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* SCOPE BADGE */}
        {admin && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800">
              {admin.scope === "jatim" ? "PW Jatim" : `PD ${admin.daerah}`}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="text-sm bg-emerald-dark text-white px-3 py-1.5 rounded hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
