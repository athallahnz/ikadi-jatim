import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { PanelLeft, ChevronDown, ChevronRight } from "lucide-react";
import { adminMenu } from "./adminMenu";
import { useAdmin } from "@/hooks/useAdmin";

type Props = {
  collapsed: boolean;
  toggleCollapse: () => void;
};

export default function AdminDesktopSidebar({
  collapsed,
  toggleCollapse,
}: Props) {
  const location = useLocation();
  const { admin } = useAdmin();

  const [openSettings, setOpenSettings] = useState(
    location.pathname.startsWith("/admin/settings"),
  );

  const scope = admin?.scope?.toLowerCase();

  return (
    <aside
      className={`
        hidden md:flex flex-col fixed top-0 left-0 h-screen
        bg-card border-r border-border
        transition-colors duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* HEADER */}
      {/* HEADER */}
      <div
        className={`relative flex items-center border-b border-border ${
          collapsed ? "justify-center h-20" : "justify-center h-24"
        }`}
      >
        {/* COLLAPSED MODE */}
        {collapsed && (
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg border border-border hover:bg-muted transition"
          >
            <PanelLeft size={18} />
          </button>
        )}

        {/* EXPANDED MODE */}
        {!collapsed && (
          <>
            {admin?.brand_logo ? (
              <img
                src={admin.brand_logo}
                alt="brand"
                className="h-16 object-contain transition-colors duration-300"
              />
            ) : (
              <div className="text-lg font-display text-gold">
                {admin?.brand_name ||
                  (admin?.scope === "jatim"
                    ? "IKADI Jawa Timur"
                    : `IKADI ${admin?.daerah}`)}
              </div>
            )}

            {/* FLOAT COLLAPSE BTN */}
            <button
              onClick={toggleCollapse}
              className="
          absolute -right-3 top-1/2 -translate-y-1/2
          bg-card border border-border
          rounded-full shadow-sm p-1.5
          hover:scale-110 transition
        "
            >
              <PanelLeft size={16} />
            </button>
          </>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {adminMenu

          // ✅ TAMBAHKAN FILTER UTAMA DI SINI
          .filter((m) => {
            if (!m.scopes) return true;
            return m.scopes.includes(scope ?? "");
          })
          .map((m) => {
            const Icon = m.icon;

            if (m.children) {
              const children = m.children.filter((c) => {
                if (!c.scopes) return true;
                return c.scopes.includes(scope ?? "");
              });

              if (!children.length) return null;

              return (
                <div key={m.label}>
                  <button
                    onClick={() => setOpenSettings(!openSettings)}
                    className={`flex items-center w-full ${
                      collapsed ? "justify-center" : "gap-3"
                    } px-3 py-3 rounded-lg text-sm text-muted-foreground hover:bg-muted`}
                  >
                    <Icon size={18} />

                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{m.label}</span>
                        {openSettings ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </>
                    )}
                  </button>

                  {openSettings && !collapsed && (
                    <div className="pl-3 mt-1 space-y-1">
                      {children.map((c) => {
                        const CIcon = c.icon;

                        return (
                          <NavLink
                            key={c.to}
                            to={c.to!}
                            end={c.to === "/admin/settings"}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-3 py-3 rounded-lg text-sm ${
                                isActive
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                  : "text-muted-foreground hover:bg-muted"
                              }`
                            }
                          >
                            <CIcon size={16} />
                            {c.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (!m.to) return null;

            return (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? "justify-center" : "gap-3"
                  } px-3 py-3 rounded-lg text-sm ${
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "text-muted-foreground hover:bg-muted"
                  }`
                }
              >
                <Icon size={18} />
                {!collapsed && <span>{m.label}</span>}
              </NavLink>
            );
          })}
      </nav>

      {/* FOOTER */}
      {!collapsed && (
        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          {scope === "jatim"
            ? "PW Jawa Timur"
            : admin?.daerah
              ? `PD ${admin.daerah}`
              : ""}
        </div>
      )}
    </aside>
  );
}
