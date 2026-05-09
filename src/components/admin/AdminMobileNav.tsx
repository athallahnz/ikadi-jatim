import { useLocation, useNavigate } from "react-router-dom";
import Dock, { DockItemData } from "@/components/ui/dock";
import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminMenuItem } from "./adminMenu";
import { useAdmin } from "@/hooks/useAdmin";

type Props = {
  menuItems: AdminMenuItem[];
};

export default function AdminMobileNav({ menuItems }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading: authLoading } = useAdmin();
  const pathname = location.pathname;

  const [openSettings, setOpenSettings] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setOpenSettings(false);
    setIsNavigating(false);
  }, [pathname]);

  const isChildActive = useCallback(
    (to?: string) => (to ? pathname === to : false),
    [pathname],
  );

  const handleNavigation = useCallback(
    (to: string) => {
      if (pathname === to) {
        setOpenSettings(false);
        return;
      }
      if (navigator.vibrate) navigator.vibrate(5);
      setIsNavigating(true);

      requestAnimationFrame(() => {
        setTimeout(() => {
          navigate(to);
        }, 100);
      });
    },
    [pathname, navigate],
  );

  const isLoading = authLoading || isNavigating;

  const { items, activeIndex, filteredSettingsMenu } = useMemo(() => {
    let currentIdx = -1;

    // Jika sedang loading, buat 5 item dummy untuk skeleton di Dock
    if (isLoading && menuItems.length === 0) {
      const skeletonItems: DockItemData[] = [...Array(5)].map(() => ({
        icon: <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />,
        label: "...",
        active: false,
        onClick: () => {},
      }));
      return {
        items: skeletonItems,
        activeIndex: -1,
        filteredSettingsMenu: [],
      };
    }

    const mainItems = menuItems.filter((m) => !m.isLabel);

    const dockItems: DockItemData[] = mainItems.map((menu, index) => {
      const Icon = menu.icon!;
      const hasActiveChild =
        menu.children?.some((child) => isChildActive(child.to)) ?? false;
      const isRouteActive =
        menu.to === "/admin"
          ? pathname === "/admin"
          : menu.to
            ? pathname.startsWith(menu.to)
            : false;

      const isActive = hasActiveChild || isRouteActive;
      if (isActive) currentIdx = index;

      return {
        icon: (
          <div className="relative">
            {/* SKELETON ICON JIKA SEDANG NAVIGASI */}
            {isLoading && isActive ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 animate-pulse flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              </div>
            ) : (
              <Icon
                size={22}
                className={`transition-colors duration-300 ${
                  isActive ? "text-emerald-500" : "text-muted-foreground/70"
                }`}
              />
            )}

            {isActive && !isLoading && (
              <motion.div
                layoutId="dockActiveGlow"
                className="absolute -inset-2 bg-emerald-500/10 blur-lg rounded-full -z-10"
              />
            )}
          </div>
        ),
        label: menu.label,
        active: isActive,
        onClick: () => {
          if (menu.children) {
            if (navigator.vibrate) navigator.vibrate(5);
            setOpenSettings(true);
          } else if (menu.to) {
            handleNavigation(menu.to);
          }
        },
      };
    });

    const settingsObj = menuItems.find((m) => m.label === "Settings");
    const filteredSettings = settingsObj?.children || [];

    return {
      items: dockItems,
      activeIndex: currentIdx,
      filteredSettingsMenu: filteredSettings,
    };
  }, [pathname, isChildActive, menuItems, handleNavigation, isLoading]);

  return (
    <>
      {/* DOCK DENGAN STATE LOADING INTERNAL */}
      <Dock items={items} activeIndex={activeIndex} />

      <AnimatePresence>
        {openSettings && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenSettings(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-xl border-t border-border rounded-t-[2.5rem] p-4 pb-12 shadow-2xl"
            >
              <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-muted-foreground/20" />

              <div className="px-2 mb-6">
                <h3 className="text-lg font-bold text-foreground">
                  Pengaturan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Kelola profil dan preferensi sistem Anda
                </p>
              </div>

              <div className="space-y-1.5">
                {isLoading
                  ? /* SKELETON DALAM DRAWER */
                    [...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-muted/10 animate-pulse"
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted" />
                        <div className="h-4 bg-muted rounded-md w-1/2" />
                      </div>
                    ))
                  : filteredSettingsMenu.map((child) => {
                      const Icon = child.icon!;
                      const active = isChildActive(child.to);

                      return (
                        <button
                          key={child.label}
                          onClick={() => {
                            if (child.to) handleNavigation(child.to);
                          }}
                          className={`flex items-center gap-4 w-full rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.97] ${
                            active
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl transition-colors ${active ? "bg-emerald-500/20" : "bg-muted"}`}
                          >
                            <Icon size={20} />
                          </div>
                          <span className="text-sm font-medium">
                            {child.label}
                          </span>
                          {active && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="ml-auto"
                            >
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            </motion.div>
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
