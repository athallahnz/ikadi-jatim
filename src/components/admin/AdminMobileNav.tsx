import { useLocation, useNavigate } from "react-router-dom";
import { adminMenu } from "./adminMenu";
import Dock, { DockItemData } from "@/components/ui/dock";
import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminMobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const pathname = location.pathname;

  const [openSettings, setOpenSettings] = useState(false);

  // Normalisasi scope untuk pengecekan
  const currentScope = admin?.scope?.toLowerCase() || "";

  // Close sheet when route changes
  useEffect(() => {
    setOpenSettings(false);
  }, [pathname]);

  const isChildActive = useCallback(
    (to?: string) => {
      if (!to) return false;
      return pathname === to;
    },
    [pathname],
  );

  // ✅ LOGIKAL FILTER: Memisahkan menu yang boleh dilihat berdasarkan scope
  const { items, activeIndex, filteredSettingsMenu } = useMemo(() => {
    let activeIndex = -1;

    // 1. Filter Menu Utama
    const filteredMainMenu = adminMenu.filter((menu) => {
      if (!menu.scopes) return true;
      return menu.scopes.includes(currentScope);
    });

    // 2. Siapkan data untuk Dock
    const dockItems: DockItemData[] = filteredMainMenu.map((menu, index) => {
      const Icon = menu.icon;

      // Cek apakah ada anak yang aktif (untuk menu Settings)
      const hasActiveChild =
        menu.children?.some((child) => isChildActive(child.to)) ?? false;

      // Cek apakah route utama aktif
      const isRouteActive =
        menu.to === "/admin"
          ? pathname === "/admin"
          : menu.to
            ? pathname.startsWith(menu.to)
            : false;

      const isActive = hasActiveChild || isRouteActive;
      if (isActive) activeIndex = index;

      return {
        icon: (
          <Icon
            size={24}
            className={isActive ? "text-emerald-500" : "text-muted-foreground"}
          />
        ),
        label: menu.label,
        active: isActive,
        onClick: () => {
          navigator.vibrate?.(10);
          if (menu.children) {
            setOpenSettings(true);
          } else if (menu.to) {
            navigate(menu.to);
          }
        },
      };
    });

    // 3. Filter khusus untuk isi di dalam Bottom Sheet Settings
    const settingsObj = adminMenu.find((m) => m.label === "Settings");
    const filteredSettings =
      settingsObj?.children?.filter((child) => {
        if (!child.scopes) return true;
        return child.scopes.includes(currentScope);
      }) || [];

    return {
      items: dockItems,
      activeIndex,
      filteredSettingsMenu: filteredSettings,
    };
  }, [pathname, navigate, isChildActive, currentScope]);

  return (
    <>
      {/* NAVIGATION DOCK */}
      <Dock items={items} activeIndex={activeIndex} />

      {/* SETTINGS SHEET (BOTTOM DRAWER) */}
      <AnimatePresence>
        {openSettings && (
          <>
            {/* BACKDROP */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenSettings(false)}
            />

            {/* BOTTOM SHEET */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t rounded-t-2xl p-4 pb-10 shadow-2xl"
            >
              {/* Drag Handle Visual */}
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />

              <h3 className="text-sm font-bold text-foreground mb-4 px-1">
                Pengaturan Akun & Web
              </h3>

              <div className="space-y-1">
                {filteredSettingsMenu.map((child) => {
                  const Icon = child.icon;
                  const active = isChildActive(child.to);

                  return (
                    <button
                      key={child.label}
                      onClick={() => {
                        navigator.vibrate?.(10);
                        setOpenSettings(false);
                        if (child.to) navigate(child.to);
                      }}
                      className={`
                        flex items-center gap-3 w-full rounded-xl px-4 py-3 transition-all
                        ${
                          active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                            : "text-muted-foreground hover:bg-muted active:scale-95"
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="text-sm">{child.label}</span>

                      {active && (
                        <motion.span
                          layoutId="activeDot"
                          className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
