import { useEffect, useRef, useState } from "react";

type SeasonConfig = {
  name: string;
  hijriYear: string;
  startDate: Date;
  icon: string;
  beforeLabel: (days: number) => string;
  activeLabel: string;
};

const seasonConfig: SeasonConfig = {
  name: "Ramadhan",
  hijriYear: "1447 H",
  startDate: new Date("2026-02-17T18:00:00+07:00"),
  icon: "🌙",
  beforeLabel: (days) => `H-${days} Ramadhan 1447 H`,
  activeLabel: "Marhaban Ya Ramadhan 1447 H",
};

const SeasonBadge = () => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const diff = seasonConfig.startDate.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (days <= 0) {
        setIsActive(true);
        setDaysLeft(null);
      } else {
        setIsActive(false);
        setDaysLeft(days);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  // close when click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const label = isActive
    ? seasonConfig.activeLabel
    : daysLeft !== null
      ? seasonConfig.beforeLabel(daysLeft)
      : "";

  return (
    <>
      {/* DESKTOP */}
      <div
        className="
          hidden sm:flex
          fixed top-32 right-6 z-50
          px-5 py-3 rounded-xl
          bg-background/10 backdrop-blur-xl
          border border-gold/40
          shadow-[0_0_25px_rgba(212,175,55,0.28)]
          transition-all duration-500
          hover:scale-105
        "
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
          </div>

          <p className="text-sm font-semibold text-gold whitespace-nowrap">
            {seasonConfig.icon} {label}
          </p>
        </div>
      </div>

      {/* MOBILE EXPANDABLE */}
      <div
        ref={ref}
        className={`
          sm:hidden
          fixed top-24 right-4 z-50
          flex items-center
          rounded-full
          bg-background/20 backdrop-blur-xl
          border border-gold/40
          shadow-[0_0_20px_rgba(212,175,55,0.3)]
          transition-all duration-300
          overflow-hidden
          ${expanded ? "pl-3 pr-4 py-2 gap-2" : "w-12 h-12 justify-center"}
        `}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-xl">{seasonConfig.icon}</span>

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
    </>
  );
};

export default SeasonBadge;
