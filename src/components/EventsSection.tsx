import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { kabarData, KabarItem } from "@/data/kabar";

type Props = {
  scope?: string;
};

type TimeFilter = "all" | "today" | "week" | "month";

const EventsSection = ({ scope }: Props) => {
  /* ================= SCOPE FILTER ================= */
  const scopedEvents =
    scope === "daerah"
      ? kabarData.filter((k) => k.scope === "daerah")
      : scope === "jatim"
        ? kabarData.filter((k) => k.scope === "jatim")
        : kabarData;

  const title =
    scope === "daerah"
      ? "Kabar IKADI Daerah"
      : scope === "jatim"
        ? "Kabar IKADI Jawa Timur"
        : "Agenda & Kegiatan IKADI";

  /* ================= TIME FILTER ================= */
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const filterLabel =
    timeFilter === "today"
      ? "hari ini"
      : timeFilter === "week"
        ? "1 pekan terakhir"
        : timeFilter === "month"
          ? "bulan ini"
          : "";

  const now = new Date();

  const events = scopedEvents.filter((e) => {
    if (timeFilter === "all") return true;

    const eventDate = new Date(e.date);

    if (timeFilter === "today") {
      return eventDate.toDateString() === now.toDateString();
    }

    if (timeFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return eventDate >= weekAgo && eventDate <= now;
    }

    if (timeFilter === "month") {
      return (
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });

  /* ================= CAROUSEL ================= */
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [scope, timeFilter]);

  useEffect(() => {
    const handleResize = () => {
      setVisible(window.innerWidth < 768 ? 1 : 3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (events.length <= visible) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev >= events.length - visible ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [visible, events.length]);

  useEffect(() => {
    if (index > events.length - visible) {
      setIndex(0);
    }
  }, [index, events.length, visible]);

  /* ================= DRAG ================= */
  const handleStart = (x: number) => {
    setDragStart(x);
    setIsDragging(true);
  };

  const handleMove = (x: number) => {
    if (dragStart !== null) {
      setDragOffset(x - dragStart);
    }
  };

  const handleEnd = () => {
    if (dragOffset > 100 && index > 0) {
      setIndex((prev) => prev - 1);
    } else if (dragOffset < -100 && index < events.length - visible) {
      setIndex((prev) => prev + 1);
    }

    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const cardWidth = 100 / visible;
  const translate = -index * cardWidth + (dragOffset / window.innerWidth) * 100;

  return (
    <section className="py-14 bg-background">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            {title}
          </h2>

          <div className="gold-divider mx-auto" />

          {/* FILTER */}
          <div className="flex flex-wrap justify-center gap-2 my-6">
            {[
              { key: "all", label: "Semua" },
              { key: "today", label: "Hari Ini" },
              { key: "week", label: "1 Pekan" },
              { key: "month", label: "Bulan Ini" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setTimeFilter(f.key as TimeFilter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  timeFilter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* EMPTY */}
        {events.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex flex-col items-center gap-3 text-muted-foreground">
              <CalendarDays className="h-8 w-8 opacity-40" />
              <p className="text-sm">Tidak ada konten {filterLabel}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div
              className={`flex transition-transform duration-500 ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{ transform: `translateX(${translate}%)` }}
              onMouseDown={(e) => handleStart(e.clientX)}
              onMouseMove={(e) => handleMove(e.clientX)}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={(e) => handleStart(e.touches[0].clientX)}
              onTouchMove={(e) => handleMove(e.touches[0].clientX)}
              onTouchEnd={handleEnd}
            >
              {events.map((event, i) => (
                <div
                  key={event.id}
                  className="flex-shrink-0 px-4 my-4"
                  style={{ width: `${cardWidth}%` }}
                >
                  <div className="bg-card rounded-xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="relative h-56 overflow-hidden group">
                      <img
                        src={event.cover}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute top-3 left-3 z-10">
                        {event.scope === "jatim" ? (
                          <span className="bg-gold text-foreground text-sm px-3 py-1 rounded-full font-semibold shadow">
                            PW Jawa Timur
                          </span>
                        ) : (
                          <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-semibold shadow">
                            PD {event.daerah}
                          </span>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <CalendarDays className="h-4 w-4" />
                        {event.displayDate}
                      </div>

                      <h3 className="font-display font-semibold mb-2">
                        {event.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4">
                        {event.excerpt}
                      </p>

                      <Button asChild variant="outline" size="sm">
                        <Link
                          to={
                            event.scope === "daerah"
                              ? `/kabar/daerah/${event.daerahSlug}/${event.slug}`
                              : `/kabar/jatim/${event.slug}`
                          }
                        >
                          Lihat Detail
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
