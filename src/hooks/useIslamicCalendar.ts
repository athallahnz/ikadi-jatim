import { useEffect, useState } from "react";

/* ================================
   TYPES & CONSTANTS
================================ */
export interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
}

export type HijriEvent =
  | "ramadan_last10"
  | "eid_fitr"
  | "eid_adha"
  | "arafah"
  | "ayyamul_bidh"
  | "monday"
  | "thursday";

export interface IslamicBadge {
  icon: string;
  text: string;
}

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
] as const;

/* ================================
   1. CORE: HIJRI CONVERTER
================================ */
export function getHijriDate(inputDate: Date = new Date()): HijriDate {
  try {
    // STANDARISASI 1: Gunakan kalender Umm al-Qura (standar paling akurat)
    // STANDARISASI 2: Kunci zona waktu ke WIB agar konsisten se-Indonesia
    // STANDARISASI 3: Paksa output menjadi numeric untuk hari, bulan, tahun
    const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const parts = formatter.formatToParts(inputDate);

    const dayStr = parts.find((p) => p.type === "day")?.value;
    const monthStr = parts.find((p) => p.type === "month")?.value;
    const yearStr = parts.find((p) => p.type === "year")?.value;

    const day = dayStr ? parseInt(dayStr, 10) : 1;
    const monthNumeric = monthStr ? parseInt(monthStr, 10) : 1;
    const year = yearStr ? parseInt(yearStr, 10) : 1445;

    // Mapping angka bulan (1-12) ke nama bulan lokal yang baku
    const monthName = HIJRI_MONTHS[monthNumeric - 1] || "Muharram";

    return { day, month: monthNumeric, monthName, year };
  } catch (error) {
    // Fallback ekstrem jika browser pengguna sangat kuno dan tidak dukung Intl Islamic
    console.error("Gagal mengkonversi tanggal Hijriah:", error);
    return { day: 1, month: 1, monthName: "Muharram", year: 1445 };
  }
}

/* ================================
   2. HIJRI MONTH LENGTH (29/30)
================================ */
export function getHijriMonthLength(date: Date = new Date()): number {
  const currentHijri = getHijriDate(date);
  let lastDay = 29;

  // Kita cek apakah hari ke-30 masih di bulan yang sama
  const testDate = new Date(date.getTime());
  testDate.setDate(date.getDate() + (30 - currentHijri.day));

  const testHijri = getHijriDate(testDate);

  if (testHijri.month === currentHijri.month) {
    lastDay = 30;
  }

  return lastDay;
}

/* ================================
   3. EVENT DETECTOR
================================ */
export function detectHijriEvents(date: Date = new Date()): HijriEvent[] {
  const h = getHijriDate(date);

  // Ambil hari dari tanggal masehi dengan timezone WIB untuk puasa sunnah
  const wibDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
  const weekday = wibDate.getDay(); // 0 = Minggu, 1 = Senin, 4 = Kamis

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
   4. BADGE RENDERER
================================ */
export function getIslamicBadge(
  h: HijriDate,
  events: HijriEvent[],
): IslamicBadge {
  // Pengecekan berurutan berdasarkan prioritas
  if (events.includes("eid_fitr")) {
    return { icon: "🎉", text: "Idul Fitri 1 Syawal" };
  }
  if (events.includes("eid_adha")) {
    return { icon: "🐄", text: "Idul Adha 10 Dzulhijjah" };
  }
  if (events.includes("arafah")) {
    return { icon: "🕋", text: "Puasa Arafah 9 Dzulhijjah" };
  }
  if (events.includes("ramadan_last10")) {
    return { icon: "🌙", text: `10 malam terakhir Ramadhan • ${h.day}` };
  }
  if (events.includes("ayyamul_bidh")) {
    return { icon: "🌿", text: `Puasa Ayyamul Bidh ${h.day}` };
  }
  if (events.includes("monday")) return { icon: "🌿", text: "Puasa Senin" };
  if (events.includes("thursday")) return { icon: "🌿", text: "Puasa Kamis" };

  return {
    icon: "🕌",
    text: `${h.day} ${h.monthName} ${h.year} H`,
  };
}

/* ================================
   5. REACT HOOK
================================ */
export interface IslamicCalendarState extends HijriDate {
  monthLength: number;
  events: HijriEvent[];
  badge: IslamicBadge;
}

export function useIslamicCalendar(): IslamicCalendarState {
  const [state, setState] = useState<IslamicCalendarState>(() => {
    const now = new Date();
    const h = getHijriDate(now);
    const events = detectHijriEvents(now);

    return {
      ...h,
      monthLength: getHijriMonthLength(now),
      events,
      badge: getIslamicBadge(h, events),
    };
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = getHijriDate(now);
      const events = detectHijriEvents(now);

      setState({
        ...h,
        monthLength: getHijriMonthLength(now),
        events,
        badge: getIslamicBadge(h, events),
      });
    };

    // Update state saat komponen di-mount untuk memastikan sinkronisasi SSR vs Client
    update();

    // Set interval untuk mengecek pergantian hari (cek setiap 1 jam)
    const interval = setInterval(update, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  return state;
}
