import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ================= TYPES ================= */
interface StatRow {
  id: string;
  label: string;
  value: string;
  order_num: number;
}

/* ================= COMPONENT COUNTER ================= */
const Counter = ({
  end,
  duration = 2000,
}: {
  end: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16);
    const animate = () => {
      start += increment;
      if (start >= end) {
        setCount(end);
        return;
      }
      setCount(Math.floor(start));
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}</span>;
};

/* ================= MAIN SECTION ================= */
const StatsSection = () => {
  // Ganti 'any[]' menjadi 'StatRow[]' untuk memperbaiki error ESLint
  const [stats, setStats] = useState<StatRow[]>([]);
  const [hasAppeared, setHasAppeared] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("stats")
        .select("*")
        .order("order_num", { ascending: true });

      if (!error && data) {
        setStats(data as StatRow[]);
      }
    };
    fetchStats();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasAppeared(true);
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const parseValue = (val: string) => {
    // Mengambil hanya angka (untuk dihitung)
    const num = parseInt(val.replace(/[^0-9]/g, "")) || 0;
    // Mengambil karakter selain angka (sebagai suffix)
    const suffix = val.replace(/[0-9]/g, "");
    return { num, suffix };
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-emerald-dark islamic-pattern-dark relative -mt-20 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, i) => {
            const { num, suffix } = parseValue(stat.value);

            return (
              <div
                key={stat.id}
                className={`text-center transform transition-colors duration-1000 ease-out ${
                  hasAppeared
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <p className="text-5xl md:text-6xl font-display font-bold text-white mb-2 flex items-center justify-center">
                  {/* Angka yang beranimasi */}
                  <Counter end={num} />

                  {/* Suffix yang muncul statis (atau beri animasi fade) */}
                  {suffix && (
                    <span className="text-gold text-2xl md:text-4xl ml-1 self-start mt-1">
                      {suffix}
                    </span>
                  )}
                </p>

                <p className="text-[10px] md:text-xs mt-5 font-bold uppercase tracking-[0.2em] text-white/60">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
