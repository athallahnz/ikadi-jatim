import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminHeader() {
  const { admin } = useAdmin();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-foreground">Admin Panel</h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* DARK MODE SWITCH */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

        {/* SCOPE BADGE */}
        {admin && (
          <span className="hidden sm:inline-flex items-center rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {admin.scope === "jatim" ? "PW Jatim" : `PD ${admin.daerah}`}
          </span>
        )}

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white transition hover:bg-emerald-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
