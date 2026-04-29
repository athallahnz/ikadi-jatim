import { useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Landmark,
  Star,
  Moon,
} from "lucide-react";
import {
  getHijriDate,
  detectHijriEvents,
  HijriEvent,
} from "@/hooks/useIslamicCalendar"; // Sesuaikan path jika berbeda

type DayCell = {
  gregorian: Date;
  hijriDay: number;
  isToday: boolean;
  events: HijriEvent[];
};

type HijriCalendarProps = {
  large?: boolean;
};

const WEEKDAYS = ["Ahad", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/* ================================
   HELPER: FIND 1ST OF MONTH
================================ */
// Mencari tanggal Masehi yang tepat jatuh pada tanggal 1 bulan Hijriah saat ini
function getStartOfHijriMonth(date: Date): Date {
  const current = new Date(date);
  let h = getHijriDate(current);

  // Mundur 1 hari terus menerus sampai ketemu tanggal 1
  while (h.day > 1) {
    current.setDate(current.getDate() - 1);
    h = getHijriDate(current);
  }
  return current;
}

export default function HijriCalendar({ large }: HijriCalendarProps) {
  // State menyimpan tanggal 1 (Masehi) dari bulan Hijriah yang sedang dilihat
  const [currentMonthStart, setCurrentMonthStart] = useState<Date>(() =>
    getStartOfHijriMonth(new Date()),
  );

  const islamicMonth = getHijriDate(currentMonthStart);

  /* ================= NAVIGASI ================= */
  const nextMonth = () => {
    setCurrentMonthStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 30); // Lompat ke bulan depan
      return getStartOfHijriMonth(next);
    });
  };

  const prevMonth = () => {
    setCurrentMonthStart((prev) => {
      const prevMonthDate = new Date(prev);
      prevMonthDate.setDate(prevMonthDate.getDate() - 1); // Lompat ke hari terakhir bulan lalu
      return getStartOfHijriMonth(prevMonthDate);
    });
  };

  const goToToday = () => {
    setCurrentMonthStart(getStartOfHijriMonth(new Date()));
  };

  /* ================= SWIPE ================= */
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
      if (dx > 0) nextMonth();
      else prevMonth();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  /* ================= BUILD GRID ================= */
  const days = useMemo(() => {
    const result: DayCell[] = [];
    const todayString = new Date().toDateString();

    // Tentukan apakah bulan ini 29 atau 30 hari
    let length = 29;
    const day30 = new Date(currentMonthStart);
    day30.setDate(day30.getDate() + 29); // +29 = hari ke 30
    if (getHijriDate(day30).month === islamicMonth.month) {
      length = 30;
    }

    // Bangun array kalender
    for (let i = 0; i < length; i++) {
      const d = new Date(currentMonthStart);
      d.setDate(currentMonthStart.getDate() + i);
      const h = getHijriDate(d);

      result.push({
        gregorian: d,
        hijriDay: h.day,
        isToday: d.toDateString() === todayString,
        events: detectHijriEvents(d), // Ambil event langsung dari Hook
      });
    }

    return result;
  }, [currentMonthStart, islamicMonth.month]);

  const firstWeekday = currentMonthStart.getDay(); // 0 = Minggu, dst.
  const blanks = Array.from({ length: firstWeekday });

  const isCurrentMonth =
    getHijriDate(new Date()).month === islamicMonth.month &&
    getHijriDate(new Date()).year === islamicMonth.year;

  /* ================= RENDER ================= */
  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`
        w-full rounded-2xl border border-border bg-card text-card-foreground shadow-sm 
        transition-colors duration-300
        ${large ? "p-6 md:p-8" : "p-4 sm:p-5"}
      `}
    >
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-primary">
            <CalendarDays className="w-4 h-4" />
            <span className="text-base sm:text-lg font-semibold tracking-wide">
              {islamicMonth.monthName} {islamicMonth.year} H
            </span>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="mt-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              Kembali ke Hari Ini
            </button>
          )}
        </div>

        <button
          onClick={nextMonth}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Bulan Berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* WEEKDAYS */}
      <div className="grid grid-cols-7 mb-2 text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center ${i === 0 ? "text-destructive/80" : ""}`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {blanks.map((_, i) => (
          <div key={"blank" + i} />
        ))}

        {days.map((day) => {
          const { isToday, events } = day;

          const isEid =
            events.includes("eid_fitr") || events.includes("eid_adha");
          const isArafah = events.includes("arafah");
          const isRamadanLast10 = events.includes("ramadan_last10");
          const isSunnahFast =
            events.includes("ayyamul_bidh") ||
            events.includes("monday") ||
            events.includes("thursday");

          return (
            <div
              key={day.gregorian.toISOString()}
              title={day.gregorian.toLocaleDateString("id-ID", {
                dateStyle: "full",
              })}
              className={`
                relative aspect-square flex flex-col items-center justify-center
                rounded-xl text-sm sm:text-base font-medium
                transition-all duration-200 cursor-default select-none

                ${isToday ? "ring-2 ring-primary bg-primary/10 font-bold" : "hover:bg-muted"}
                ${isEid ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" : ""}
                ${isArafah ? "bg-accent/20 text-accent-foreground border border-accent/30" : ""}
                ${isRamadanLast10 && !isEid ? "border border-gold/50" : ""}
                ${!isEid && !isArafah && !isToday ? "text-foreground" : ""}
              `}
            >
              {/* Ikon Event Besar */}
              {(isEid || isArafah || isRamadanLast10) && (
                <span className="absolute top-1 sm:top-1.5 opacity-80 scale-75 sm:scale-100">
                  {isEid && (
                    <Landmark className="w-3.5 h-3.5 text-primary-foreground" />
                  )}
                  {isArafah && (
                    <Star className="w-3.5 h-3.5 text-accent-foreground" />
                  )}
                  {isRamadanLast10 && !isEid && (
                    <Moon className="w-3.5 h-3.5 text-gold" />
                  )}
                </span>
              )}

              {/* Tanggal */}
              <span
                className={
                  isEid || isArafah || isRamadanLast10 ? "mt-3 sm:mt-4" : ""
                }
              >
                {day.hijriDay}
              </span>

              {/* Dot Puasa Sunnah (Kecil di bawah) */}
              {isSunnahFast && !isEid && (
                <span className="absolute bottom-1 sm:bottom-1.5 flex gap-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* LEGEND / KETERANGAN */}
      <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground font-medium">
        {islamicMonth.month === 10 && (
          <span className="flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-primary" /> Idul Fitri
          </span>
        )}
        {islamicMonth.month === 12 && (
          <>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-accent" /> Arafah
            </span>
            <span className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-primary" /> Idul Adha
            </span>
          </>
        )}
        {islamicMonth.month === 9 && (
          <span className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-gold" /> 10 Malam Terakhir
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500/60" /> Puasa
          Sunnah
        </span>
      </div>
    </div>
  );
}
