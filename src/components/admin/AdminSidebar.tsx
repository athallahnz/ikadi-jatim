import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { ChevronDown, ChevronRight } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ open, onClose }: Props) {
  const { admin } = useAdmin();
  const location = useLocation();

  const [isSettingsOpen, setIsSettingsOpen] = useState(
    location.pathname.includes("/admin/settings"),
  );

  const menu = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/articles", label: "Kajian & Artikel" },
    { to: "/admin/events", label: "Agenda / Event" },
    { to: "/admin/gallery", label: "Galeri" },
    { to: "/admin/programs", label: "Program" },
  ];

  return (
    <>
      {/* OVERLAY MOBILE */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-emerald-dark text-white z-50
          flex flex-col
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* BRAND */}
        <div className="h-32 flex items-center px-5 border-b border-gold bg-emerald-dark">
          {admin?.brand_logo ? (
            <img
              src={admin.brand_logo}
              alt={admin.brand_name || "IKADI"}
              className="h-32 object-contain py-3"
            />
          ) : (
            <div className="text-lg font-display text-gold">
              {admin?.brand_name ||
                (admin?.scope === "jatim"
                  ? "IKADI Jawa Timur"
                  : `IKADI ${admin?.daerah}`)}
            </div>
          )}
        </div>

        {/* MENU UTAMA */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={onClose}
              end={m.to === "/admin"}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-gold text-emerald-dark font-semibold shadow-sm"
                    : "text-white/90 hover:bg-emerald-700"
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}

          {/* MENU SETTINGS (Terlihat untuk semua user) */}
          <div className="pt-2 mt-2 border-t border-emerald-800">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-emerald-700 transition"
            >
              <span>Settings</span>
              {isSettingsOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {/* SUB MENU SETTINGS */}
            {isSettingsOpen && (
              <div className="pl-3 pr-2 mt-1 space-y-1">
                {/* PROFILE - Untuk SEMUA user */}
                <NavLink
                  to="/admin/settings/profile"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm transition ${
                      isActive
                        ? "bg-gold text-emerald-dark font-semibold shadow-sm"
                        : "text-white/80 hover:bg-emerald-700"
                    }`
                  }
                >
                  My Profile
                </NavLink>

                {/* MENU KHUSUS ADMIN JATIM */}
                {admin?.scope === "jatim" && (
                  <>
                    <NavLink
                      to="/admin/settings"
                      end
                      onClick={onClose}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm transition ${
                          isActive
                            ? "bg-gold text-emerald-dark font-semibold shadow-sm"
                            : "text-white/80 hover:bg-emerald-700"
                        }`
                      }
                    >
                      General
                    </NavLink>

                    <NavLink
                      to="/admin/settings/users"
                      onClick={onClose}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm transition ${
                          isActive
                            ? "bg-gold text-emerald-dark font-semibold shadow-sm"
                            : "text-white/80 hover:bg-emerald-700"
                        }`
                      }
                    >
                      Manage Users
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gold text-xs text-white">
          {admin?.scope === "jatim" ? "PW Jawa Timur" : `PD ${admin?.daerah}`}
        </div>
      </aside>
    </>
  );
}
