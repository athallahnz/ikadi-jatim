import { useEffect, useRef, useState } from "react";
import { useIslamicCalendar } from "@/hooks/useIslamicCalendar";
import HijriCalendar from "@/components/HijriCalendar";

const SeasonBadge = () => {
  const islamic = useIslamicCalendar();
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const dayOnly = islamic.day;
  const fullLabel = `${islamic.badge.text} • ${islamic.year} H`;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <div
        ref={ref}
        className={`
          fixed top-24 sm:top-36 right-6 z-50
          flex items-center
          bg-white/90 dark:bg-emerald-950/60 backdrop-blur-2xl
          border border-gold/30 dark:border-gold/20
          shadow-[0_12px_40px_rgba(212,175,55,0.12)]
          /* Menggunakan cubic-bezier untuk gerakan 'organic' */
          transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          cursor-pointer select-none
          ${expanded ? "rounded-2xl p-2 pr-5" : "rounded-full w-14 h-14 justify-center"}
        `}
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center relative">
          {/* TOGGLE AREA (Angka) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className={`
              relative flex items-center justify-center shrink-0
              bg-gradient-to-br from-gold/30 via-gold/10 to-transparent
              border border-gold/40
              transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
              ${expanded ? "h-11 w-11 rounded-xl" : "h-12 w-12 rounded-full"}
              hover:brightness-110 active:scale-90
            `}
          >
            {/* Animasi Ping yang terisolasi sepenuhnya */}
            {!expanded && (
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute inset-0 rounded-full bg-gold/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
              </div>
            )}

            <span className="relative text-sm font-black text-gold tracking-tight">
              {dayOnly}
            </span>
          </div>

          {/* CONTENT AREA (Label) */}
          <div
            className={`
              flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
              ${
                expanded
                  ? "ml-4 opacity-100 translate-x-0 scale-100"
                  : "opacity-0 -translate-x-4 scale-95 pointer-events-none w-0"
              }
            `}
          >
            <span className="text-[9px] font-bold text-gold/60 uppercase tracking-[0.25em] leading-none mb-1.5">
              Hijriah
            </span>
            <span className="text-[13px] font-extrabold text-emerald-950 dark:text-emerald-50 whitespace-nowrap">
              {fullLabel}
            </span>
          </div>
        </div>
      </div>

      {/* MODAL CALENDAR */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md animate-in fade-in duration-500"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-2xl transform animate-in zoom-in-95 slide-in-from-bottom-8 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <HijriCalendar large />
          </div>
        </div>
      )}
    </>
  );
};

export default SeasonBadge;
