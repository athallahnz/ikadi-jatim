import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import {
  ChevronDown,
  ChevronRight,
  PanelLeft,
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Image,
  Layers,
  MessageSquareText,
  Settings,
  User,
  Users,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
};

export default function AdminSidebar({
  open,
  onClose,
  onCollapseChange,
}: Props) {
  const { admin } = useAdmin();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  /* LOAD COLLAPSE STATE */
  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    if (saved) {
      const val = saved === "true";
      setCollapsed(val);
      onCollapseChange?.(val);
    }
  }, [onCollapseChange]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("adminSidebarCollapsed", String(next));
    onCollapseChange?.(next);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(
    location.pathname.includes("/admin/settings"),
  );

  const menu = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/articles", label: "Kajian & Artikel", icon: Newspaper },
    { to: "/admin/events", label: "Agenda / Event", icon: CalendarDays },
    { to: "/admin/gallery", label: "Galeri", icon: Image },
    { to: "/admin/programs", label: "Program", icon: Layers },
    {
      to: "/admin/runningtexts",
      label: "Running Text",
      icon: MessageSquareText,
    },
    { to: "/admin/invitations", label: "Undangan", icon: Layers },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          bg-emerald-dark text-white
          flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"}
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* BRAND */}
        <div
          className={`
    relative flex items-center border-b border-gold
    transition-all duration-300
    ${collapsed ? "justify-center h-20" : "h-24 px-5"}
  `}
        >
          {/* EXPANDED MODE */}
          {!collapsed && (
            <>
              {admin?.brand_logo ? (
                <img
                  src={admin.brand_logo}
                  alt="brand"
                  className="h-16 object-contain transition-all duration-300"
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
          bg-white text-emerald-dark
          rounded-full shadow-md p-1.5
          hover:scale-110 transition
        "
              >
                <PanelLeft size={16} />
              </button>
            </>
          )}

          {/* COLLAPSED MODE */}
          {collapsed && (
            <button
              onClick={toggleCollapse}
              className="
        flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-white text-emerald-dark
        shadow-md
        hover:scale-110 transition
      "
            >
              <PanelLeft size={18} />
            </button>
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <NavLink
                key={m.to}
                to={m.to}
                onClick={onClose}
                end={m.to === "/admin"}
                className={({ isActive }) =>
                  `
                  group relative flex items-center
                  ${collapsed ? "justify-center w-12 mx-auto px-0" : "gap-3 px-3"}
                  py-3 rounded-lg text-sm transition
                  overflow-hidden
                  ${
                    isActive
                      ? "bg-gold text-emerald-dark font-semibold"
                      : "text-white/90 hover:bg-emerald-700"
                  }
                  `
                }
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{m.label}</span>}

                {collapsed && (
                  <span
                    className="
                      pointer-events-none
                      absolute left-full top-1/2 -translate-y-1/2
                      ml-3 px-2 py-1 rounded
                      bg-black/80 text-white text-xs
                      opacity-0 group-hover:opacity-100
                      whitespace-nowrap
                    "
                  >
                    {m.label}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* SETTINGS */}
          <div className="pt-2 mt-2">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`
                group relative w-full flex items-center
                ${collapsed ? "justify-center w-12 mx-auto px-0" : "gap-3 px-3"}
                py-3 rounded-lg text-sm transition overflow-hidden text-white/90 hover:bg-emerald-700
              `}
            >
              <Settings size={18} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Settings</span>
                  {isSettingsOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>

            {isSettingsOpen && !collapsed && (
              <div className="pl-3 mt-1 space-y-1">
                <NavLink
                  to="/admin/settings/profile"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    flex items-center
                    ${collapsed ? "justify-center px-0" : "gap-2 px-3"}
                    py-3 rounded-lg text-sm
                    ${isActive ? "bg-gold text-emerald-dark font-semibold" : "text-white/80 hover:bg-emerald-700"}
                    `
                  }
                >
                  <User size={16} /> My Profile
                </NavLink>

                {admin?.scope === "jatim" && (
                  <>
                    <NavLink
                      to="/admin/settings/users"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-3 rounded-lg text-sm ${
                          isActive
                            ? "bg-gold text-emerald-dark font-semibold"
                            : "text-white/80 hover:bg-emerald-700"
                        }`
                      }
                    >
                      <Users size={16} /> Manage Users
                    </NavLink>

                    <NavLink
                      to="/admin/settings"
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-3 rounded-lg text-sm ${
                          isActive
                            ? "bg-gold text-emerald-dark font-semibold"
                            : "text-white/80 hover:bg-emerald-700"
                        }`
                      }
                    >
                      <Settings size={16} /> General
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-gold text-xs text-white">
            {admin?.scope === "jatim" ? "PW Jawa Timur" : `PD ${admin?.daerah}`}
          </div>
        )}
      </aside>
    </>
  );
}
