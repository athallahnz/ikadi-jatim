import { useEffect, useRef, useState } from "react";

const Counter = ({
  end,
  duration = 2000,
}: {
  end: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
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

const stats = [
  { value: 38, label: "DPD di Jawa Timur", suffix: "" },
  { value: 1200, label: "Da'i Aktif", suffix: "+" },
  { value: 2002, label: "Berdiri Sejak", suffix: "" },
  { value: 50, label: "Program Tahunan", suffix: "+" },
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-emerald-dark islamic-pattern-dark relative -mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <p className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-2">
                <Counter end={stat.value} />
                {stat.suffix}
              </p>
              <p className="text-sm text-primary-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
