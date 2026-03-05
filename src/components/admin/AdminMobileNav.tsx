"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { adminMenu } from "./adminMenu";
import Dock, { DockItemData } from "@/components/ui/dock";
import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [openSettings, setOpenSettings] = useState(false);

  const settingsMenu = adminMenu.find((m) => m.label === "Settings");

  // close sheet when route changes
  useEffect(() => {
    setOpenSettings(false);
  }, [pathname]);

  const isChildActive = useCallback(
    (to?: string) => {
      if (!to) return false;

      // exact match only
      return pathname === to;
    },
    [pathname],
  );

  const { items, activeIndex } = useMemo(() => {
    let activeIndex = -1;

    const items: DockItemData[] = adminMenu.map((menu, index) => {
      const Icon = menu.icon;

      const childActive =
        menu.children?.some((child) => isChildActive(child.to)) ?? false;

      const routeActive =
        menu.to === "/admin"
          ? pathname === "/admin"
          : menu.to
            ? pathname.startsWith(menu.to)
            : false;

      const isActive = childActive || routeActive;

      if (isActive) activeIndex = index;

      if (menu.children) {
        return {
          icon: (
            <Icon
              size={24}
              className={
                isActive ? "text-emerald-500" : "text-muted-foreground"
              }
            />
          ),
          label: menu.label,
          active: isActive,
          onClick: () => {
            navigator.vibrate?.(10);
            setOpenSettings(true);
          },
        };
      }

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
          if (menu.to) navigate(menu.to);
        },
      };
    });

    return { items, activeIndex };
  }, [pathname, navigate, isChildActive]);

  return (
    <>
      <Dock items={items} activeIndex={activeIndex} />

      {/* SETTINGS SHEET */}
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
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t rounded-t-2xl p-4 pb-8"
            >
              {/* drag handle */}
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />

              <h3 className="text-sm font-semibold mb-3">Settings</h3>

              <div className="space-y-1">
                {settingsMenu?.children?.map((child) => {
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
                        flex items-center gap-3 w-full rounded-lg px-3 py-2 transition
                        ${
                          active
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground hover:bg-muted"
                        }
                      `}
                    >
                      <Icon size={20} />

                      <span>{child.label}</span>

                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />
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
