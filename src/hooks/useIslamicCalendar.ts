import { useEffect, useState } from "react";

/* ================================
   HIJRI DATE
================================ */
export type HijriDate = {
  day: number;
  month: number;
  monthName: string;
  year: number;
};

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadan",
  "Syawal",
  "Dzulkaidah",
  "Dzulhijjah",
];

export function getHijriDate(date = new Date()): HijriDate {
  const formatter = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const parts = formatter.formatToParts(date);

  const day = Number(parts.find((p) => p.type === "day")?.value);
  const monthName = parts.find((p) => p.type === "month")?.value || "";
  const year = Number(parts.find((p) => p.type === "year")?.value);

  const month =
    HIJRI_MONTHS.findIndex((m) =>
      monthName.toLowerCase().includes(m.toLowerCase()),
    ) + 1;

  return { day, month, monthName, year };
}

/* ================================
   HIJRI MONTH LENGTH (29/30)
================================ */
export function getHijriMonthLength(date = new Date()) {
  const h = getHijriDate(date);

  let lastDay = 29;

  for (let i = 29; i <= 30; i++) {
    const test = new Date(date);
    test.setDate(date.getDate() + (i - h.day));
    const th = getHijriDate(test);
    if (th.month === h.month) lastDay = i;
  }

  return lastDay;
}

/* ================================
   EVENTS
================================ */
export type HijriEvent =
  | "ramadan_last10"
  | "eid_fitr"
  | "eid_adha"
  | "arafah"
  | "ayyamul_bidh"
  | "monday"
  | "thursday";

export function detectHijriEvents(date = new Date()): HijriEvent[] {
  const h = getHijriDate(date);
  const weekday = date.getDay();

  const events: HijriEvent[] = [];

  if (h.month === 9 && h.day >= 21) events.push("ramadan_last10");
  if (h.month === 10 && h.day === 1) events.push("eid_fitr");
  if (h.month === 12 && h.day === 10) events.push("eid_adha");
  if (h.month === 12 && h.day === 9) events.push("arafah");
  if (h.day >= 13 && h.day <= 15) events.push("ayyamul_bidh");
  if (weekday === 1) events.push("monday");
  if (weekday === 4) events.push("thursday");

  return events;
}

/* ================================
   BADGE PRIORITY
================================ */
export type IslamicBadge = {
  icon: string;
  text: string;
};

export function getIslamicBadge(
  h: HijriDate,
  events: HijriEvent[],
): IslamicBadge {
  if (events.includes("eid_fitr"))
    return { icon: "🎉", text: "Idul Fitri 1 Syawal" };

  if (events.includes("eid_adha"))
    return { icon: "🐄", text: "Idul Adha 10 Dzulhijjah" };

  if (events.includes("arafah"))
    return { icon: "🕋", text: "Puasa Arafah 9 Dzulhijjah" };

  if (events.includes("ramadan_last10"))
    return { icon: "🌙", text: `10 malam terakhir Ramadhan • ${h.day}` };

  if (events.includes("ayyamul_bidh"))
    return { icon: "🌿", text: `Puasa Ayyamul Bidh ${h.day}` };

  if (events.includes("monday")) return { icon: "🌿", text: "Puasa Senin" };

  if (events.includes("thursday")) return { icon: "🌿", text: "Puasa Kamis" };

  return {
    icon: "🕌",
    text: `${h.day} ${h.monthName}`,
  };
}

/* ================================
   HOOK
================================ */
export function useIslamicCalendar() {
  const [state, setState] = useState(() => {
    const h = getHijriDate();
    const events = detectHijriEvents();
    const badge = getIslamicBadge(h, events);

    return {
      ...h,
      monthLength: getHijriMonthLength(),
      events,
      badge,
    };
  });

  useEffect(() => {
    const update = () => {
      const h = getHijriDate();
      const events = detectHijriEvents();
      const badge = getIslamicBadge(h, events);

      setState({
        ...h,
        monthLength: getHijriMonthLength(),
        events,
        badge,
      });
    };

    update();
    const i = setInterval(update, 1000 * 60 * 60);
    return () => clearInterval(i);
  }, []);

  return state;
}
