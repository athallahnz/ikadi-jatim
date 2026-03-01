import { useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Landmark,
  Star,
  Moon,
} from "lucide-react";
import { getHijriDate } from "@/hooks/useIslamicCalendar";

type DayCell = {
  gregorian: Date;
  hijriDay: number;
  isToday: boolean;
};

type HijriCalendarProps = {
  large?: boolean;
};

const WEEKDAYS = ["Ahad", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function addHijriMonths(base: Date, offset: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + offset * 29.530588);
  return d;
}

export default function HijriCalendar({ large = false }: HijriCalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);

  const baseDate = addHijriMonths(new Date(), monthOffset);
  const islamic = getHijriDate(baseDate);

  /* SWIPE */
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const dx = touchStartX.current - touchEndX.current;
    if (Math.abs(dx) > 40) {
      if (dx > 0) setMonthOffset((o) => o + 1);
      else setMonthOffset((o) => o - 1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  /* BUILD DAYS */
  const days = useMemo(() => {
    const today = new Date();
    const todayHijri = getHijriDate(baseDate);

    const start = new Date(baseDate);
    start.setDate(baseDate.getDate() - (todayHijri.day - 1));

    let length = 29;
    for (let i = 29; i <= 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const h = getHijriDate(d);
      if (h.month === islamic.month) length = i;
    }

    const result: DayCell[] = [];
    for (let i = 0; i < length; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const h = getHijriDate(d);

      result.push({
        gregorian: d,
        hijriDay: h.day,
        isToday: d.toDateString() === today.toDateString(),
      });
    }

    return result;
  }, [baseDate, islamic.month]);

  const firstWeekday = days[0].gregorian.getDay();
  const blanks = Array.from({ length: firstWeekday });

  const todayHijri = getHijriDate(new Date());
  const isCurrentMonth =
    islamic.month === todayHijri.month && islamic.year === todayHijri.year;

  const hijriMonth = islamic.month;
  const hasRamadan = hijriMonth === 9;
  const hasSyawal = hijriMonth === 10;
  const hasDzulhijjah = hijriMonth === 12;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="
        w-full
        p-3 sm:p-4 md:p-6
        rounded-2xl
        border border-border
        bg-white
        shadow-sm
      "
    >
      {/* HEADER */}
      <div className="mb-2 sm:mb-3 flex items-center justify-between">
        <button
          onClick={() => setMonthOffset((o) => o - 1)}
          className="p-1.5 rounded-md hover:bg-muted"
        >
          <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span className="text-sm sm:text-base font-medium">
              {islamic.monthName} {islamic.year} H
            </span>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={() => setMonthOffset(0)}
              className="
                mt-0.5
                text-[10px] sm:text-xs
                px-2 py-0.5
                rounded
                bg-accent/20
                text-accent-foreground
              "
            >
              Hari ini
            </button>
          )}
        </div>

        <button
          onClick={() => setMonthOffset((o) => o + 1)}
          className="p-1.5 rounded-md hover:bg-muted"
        >
          <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* WEEKDAYS */}
      <div className="grid grid-cols-7 mb-1 text-[10px] sm:text-[11px] text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center">
            {w}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {blanks.map((_, i) => (
          <div key={"b" + i} />
        ))}

        {days.map((day) => {
          const isRamadanLast10 = hasRamadan && day.hijriDay >= 21;
          const isEidFitri = hasSyawal && day.hijriDay === 1;
          const isArafah = hasDzulhijjah && day.hijriDay === 9;
          const isEidAdha = hasDzulhijjah && day.hijriDay === 10;

          return (
            <div
              key={day.gregorian.toISOString()}
              title={day.gregorian.toLocaleDateString("id-ID")}
              className={`
                aspect-square
                flex flex-col items-center justify-center
                rounded-lg
                text-sm sm:text-xs
                transition-all

                ${
                  day.isToday
                    ? "bg-accent text-accent-foreground font-bold"
                    : "hover:bg-muted"
                }

                ${isEidFitri || isEidAdha ? "bg-primary text-primary-foreground" : ""}
                ${isArafah ? "bg-blue-500/15 text-blue-600" : ""}
                ${isRamadanLast10 ? "ring-1 ring-accent/60" : ""}
              `}
            >
              {(isEidFitri || isEidAdha || isArafah || isRamadanLast10) && (
                <span className="mb-0.5 sm:mb-1">
                  {(isEidFitri || isEidAdha) && (
                    <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  )}
                  {isArafah && (
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  )}
                  {isRamadanLast10 && (
                    <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  )}
                </span>
              )}

              <span>{day.hijriDay}</span>
            </div>
          );
        })}
      </div>

      {/* LEGEND */}
      <div className="mt-3 sm:mt-5 flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
        {hasSyawal && (
          <span className="flex items-center gap-1">
            <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Idul Fitri
          </span>
        )}
        {hasDzulhijjah && (
          <>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              Arafah
            </span>
            <span className="flex items-center gap-1">
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              Idul Adha
            </span>
          </>
        )}
        {hasRamadan && (
          <span className="flex items-center gap-1">
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            10 malam terakhir
          </span>
        )}
      </div>
    </div>
  );
}
