import { useEffect, useRef, useState } from "react";
import { useIslamicCalendar } from "@/hooks/useIslamicCalendar";
import HijriCalendar from "@/components/HijriCalendar";

const SeasonBadge = () => {
  const islamic = useIslamicCalendar();

  const [expanded, setExpanded] = useState(false);
  const [showHoverCal, setShowHoverCal] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const label = `${islamic.badge.text} • ${islamic.year} H`;
  const icon = islamic.badge.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* DESKTOP BADGE */}
      <div
        ref={ref}
        onMouseEnter={() => setShowHoverCal(true)}
        onMouseLeave={() => setShowHoverCal(false)}
        onClick={() => setShowModal(true)}
        className="
          hidden sm:flex
          fixed top-32 right-6 z-50
          px-5 py-3 mt-6 rounded-xl
          bg-background/10 backdrop-blur-xl
          border border-gold/40
          shadow-[0_0_25px_rgba(212,175,55,0.28)]
          transition-all duration-500
          hover:scale-105
          cursor-pointer
        "
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
          </div>

          <p className="text-sm font-semibold text-gold whitespace-nowrap">
            {icon} {label}
          </p>
        </div>
      </div>

      {/* HOVER PREVIEW */}
      {showHoverCal && (
        <div className="hidden sm:block fixed top-44 right-6 z-40 pointer-events-none">
          <div className="relative inline-flex flex-col items-end">
            {/* BUBBLE */}
            <div
              className="
      px-3 py-2 mt-8
      text-xs font-medium
      text-gold
      bg-white/80
      backdrop-blur-xl
      border border-black/10
      rounded-xl
      shadow-[0_10px_20px_rgba(0,0,0,0.10)]
      whitespace-nowrap
      animate-in fade-in zoom-in-95 duration-200
    "
            >
              Click for more calendar
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BADGE */}
      <div
        ref={ref}
        className={`
          sm:hidden
          fixed top-24 right-4 z-50
          flex items-center mt-6
          rounded-full
          bg-background/20 backdrop-blur-xl
          border border-gold/40
          shadow-[0_0_20px_rgba(212,175,55,0.3)]
          transition-all duration-300
          overflow-hidden
          ${expanded ? "pl-3 pr-4 py-2 gap-2" : "w-12 h-12 justify-center"}
        `}
        onClick={() => {
          setExpanded((v) => !v);
          setShowModal(true);
        }}
      >
        <span className="text-xl">{icon}</span>
        <span
          className={`
            text-xs font-semibold text-gold whitespace-nowrap
            transition-all duration-300
            ${expanded ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0"}
          `}
        >
          {label}
        </span>
      </div>

      {/* MODAL CALENDAR */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-[92vw] max-w-2xl">
            <HijriCalendar large />
          </div>
        </div>
      )}
    </>
  );
};

export default SeasonBadge;
