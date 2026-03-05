import { NavLink, useLocation } from "react-router-dom";
import { adminMenu } from "./adminMenu";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMobileNav() {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState("");

  const [openSettings, setOpenSettings] = useState(false);

  const menu = [
    ...adminMenu.filter((m) => m.to && m.label !== "Settings"),
    adminMenu.find((m) => m.label === "Settings"),
  ];

  const settingsMenu = adminMenu.find((m) => m.label === "Settings");

  const isRouteActive = (path?: string) => {
    if (!path) return false;

    if (path === "/admin/settings") {
      return location.pathname === path;
    }

    return location.pathname.startsWith(path);
  };

  const settingsActive =
    settingsMenu?.children?.some((c) => isRouteActive(c.to)) ?? false;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const active = container.querySelector(".nav-active-anchor");

    if (active instanceof HTMLElement) {
      requestAnimationFrame(() => {
        const left =
          active.offsetLeft -
          container.clientWidth / 2 +
          active.clientWidth / 2;

        const current = container.scrollLeft;

        if (Math.abs(current - left) > 10) {
          container.scrollTo({
            left,
            behavior: "smooth",
          });
        }
      });
    }
    setActiveKey(location.pathname);
  }, [location.pathname]);

  let rafId: number;

  return (
    <>
      {/* DOCK */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+18px)] left-0 right-0 z-50 flex justify-center md:hidden">
        <div className="relative w-[92%] max-w-md">
          <div
            className="
  relative
  rounded-[36px]
  backdrop-blur-3xl
  bg-white/20 dark:bg-white/[0.06]
  border border-white/30 dark:border-white/10
  shadow-xl
  before:absolute before:inset-0
  before:rounded-[36px]
  before:bg-gradient-to-b
  before:from-white/20 before:to-transparent
  before:pointer-events-none
  glass-container
"
          >
            <div
              ref={(node) => {
                scrollRef.current = node;
                dockRef.current = node;
              }}
              className="flex overflow-x-auto gap-3 px-4 py-3 scrollbar-none dock snap-x"
              onMouseMove={(e) => {
                cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                  const icons = dockRef.current?.querySelectorAll(".dock-icon");
                  if (!icons) return;

                  icons.forEach((icon) => {
                    const rect = icon.getBoundingClientRect();
                    const center = rect.left + rect.width / 2;

                    const dx = e.clientX - center;
                    const dist = Math.abs(dx);

                    const scale = Math.max(1, 1.6 - dist / 140);
                    const translateX = dx * 0.04;
                    const translateY = Math.max(0, 24 - dist / 5);

                    (icon as HTMLElement).style.transform =
                      `translateX(${translateX}px) translateY(-${translateY}px) scale(${scale})`;
                  });
                });
              }}
              onMouseLeave={() => {
                const icons = dockRef.current?.querySelectorAll(".dock-icon");

                icons?.forEach((icon) => {
                  (icon as HTMLElement).style.transform =
                    "translateX(0px) translateY(0px) scale(1)";
                });
              }}
            >
              {menu.map((m) => {
                if (!m) return null;

                const Icon = m.icon;
                const isSettings = m.label === "Settings";
                const active = location.pathname === m.to;
                const isActive = isSettings ? settingsActive : active;

                if (isSettings) {
                  return (
                    <button
                      key="settings"
                      onClick={() => setOpenSettings(true)}
                      className={`flex-shrink-0 p-2 flex items-center justify-center snap-center relative ${
                        isActive ? "nav-active-anchor" : ""
                      }`}
                    >
                      <Icon
                        size={36}
                        className={`
                          dock-icon
                          transition-colors duration-200
                          ${
                            isActive
                              ? "text-emerald-500 animate-[bounce_0.4s]"
                              : "text-muted-foreground"
                          }
                        `}
                      />

                      {isActive && (
                        <span
                          className="
  absolute -bottom-1.5
  h-1.5 w-1.5
  rounded-full
  bg-emerald-400
  shadow-[0_18px_50px_rgba(0,0,0,0.45)]
"
                        />
                      )}
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={m.to}
                    to={m.to!}
                    className={`flex-shrink-0 p-2 flex items-center justify-center snap-center relative ${
                      isActive ? "nav-active-anchor" : ""
                    }`}
                  >
                    <Icon
                      size={36}
                      className={`
    dock-icon transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] will-change-transform
    ${isActive ? "text-emerald-500 scale-[1.08] -translate-y-[2px]" : "text-muted-foreground"}
  `}
                    />

                    {isActive && (
                      <span
                        className="
  absolute -bottom-1.5
  h-1.5 w-1.5
  rounded-full
  bg-emerald-400
  shadow-[0_18px_50px_rgba(0,0,0,0.45)]
"
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 blur-edge-left rounded-l-2xl" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 blur-edge-right rounded-r-2xl" />
          </div>
        </div>
      </div>

      {/* SETTINGS POPUP */}
      <AnimatePresence>
        {openSettings && settingsMenu?.children && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenSettings(false)}
            />

            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 200 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 80) setOpenSettings(false);
              }}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="fixed bottom-0 left-0 right-0 z-[61] flex justify-center md:hidden"
            >
              <div className="w-full max-w-md rounded-t-3xl bg-card border border-border p-5 pb-8">
                <div className="mb-4 text-sm font-semibold text-muted-foreground">
                  Settings
                </div>

                <div className="space-y-2">
                  {settingsMenu.children.map((c) => {
                    const Icon = c.icon;

                    return (
                      <NavLink
                        key={c.to}
                        to={c.to!}
                        end={c.to === "/admin/settings"}
                        onClick={() => setOpenSettings(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                            isActive
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                              : "hover:bg-muted text-muted-foreground"
                          }`
                        }
                      >
                        <Icon size={18} />
                        {c.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
