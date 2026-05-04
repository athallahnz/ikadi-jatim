import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  scope?: string;
  compactTitle?: boolean; // ✅ tambahkan ini
};

type TimeFilter = "all" | "today" | "week" | "month";

type EventItem = {
  id: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  date: string | null;
  display_date: string | null;
  slug: string;
  scope: string;
  daerah: string | null;
  daerah_slug: string | null;
};

const EventsSection = ({ scope, compactTitle }: Props) => {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [isLoading, setIsLoading] = useState(true);

  /* ================= FETCH SUPABASE ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true); // Mulai loading
        let query = supabase
          .from("events")
          .select(
            "id,title,excerpt,cover,date,display_date,slug,scope,daerah,daerah_slug,publish_at",
          )
          .eq("published", true)
          .order("publish_at", { ascending: false });

        if (scope === "jatim") query = query.eq("scope", "jatim");
        if (scope === "daerah") query = query.eq("scope", "daerah");

        const { data } = await query;
        setAllEvents((data as EventItem[]) || []);
      } finally {
        setIsLoading(false); // Selesai loading
      }
    };

    load();
  }, [scope]);

  /* ================= TIME FILTER ================= */
  const filterLabel =
    timeFilter === "today"
      ? "hari ini"
      : timeFilter === "week"
        ? "1 pekan terakhir"
        : timeFilter === "month"
          ? "bulan ini"
          : "";

  const now = new Date();

  const events = allEvents.filter((e) => {
    if (timeFilter === "all") return true;
    if (!e.date) return false;

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

  const title =
    scope === "daerah"
      ? "Kabar IKADI Daerah"
      : scope === "jatim"
        ? "Kabar IKADI Jawa Timur"
        : "Agenda & Kegiatan IKADI";

  /* ================= CAROUSEL (UNCHANGED) ================= */
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => setIndex(0), [scope, timeFilter]);

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
    if (index > events.length - visible) setIndex(0);
  }, [index, events.length, visible]);

  const handleStart = (x: number) => {
    setDragStart(x);
    setIsDragging(true);
  };

  const handleMove = (x: number) => {
    if (dragStart !== null) setDragOffset(x - dragStart);
  };

  const handleEnd = () => {
    if (dragOffset > 100 && index > 0) setIndex((p) => p - 1);
    else if (dragOffset < -100 && index < events.length - visible)
      setIndex((p) => p + 1);

    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const cardWidth = 100 / visible;
  const translate = -index * cardWidth + (dragOffset / window.innerWidth) * 100;

  const EventSkeleton = ({ cardWidth }: { cardWidth: number }) => (
    <div className="flex-shrink-0 px-4 my-4" style={{ width: `${cardWidth}%` }}>
      <div className="bg-card rounded-xl overflow-hidden border border-border shadow-md h-full flex flex-col">
        <Skeleton className="h-56 w-full" /> {/* Image placeholder */}
        <div className="p-6 flex-1 space-y-3">
          <Skeleton className="h-4 w-24" /> {/* Date placeholder */}
          <Skeleton className="h-6 w-full" /> {/* Title placeholder */}
          <Skeleton className="h-6 w-3/4" />
          <div className="pt-2">
            <Skeleton className="h-9 w-28 rounded-md" />{" "}
            {/* Button placeholder */}
          </div>
        </div>
      </div>
    </div>
  );

  /* ================= RENDER (UNCHANGED) ================= */
  return (
    <section className="py-14 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2
            className={`font-display font-bold text-foreground mb-6 ${
              compactTitle
                ? "text-3xl md:text-4xl mb-2"
                : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2"
            }`}
          >
            {title}
          </h2>
          <div className="gold-divider mx-auto" />

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap justify-center gap-2 my-6">
            {(["all", "today", "week", "month"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  timeFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {f === "all"
                  ? "Semua"
                  : f === "today"
                    ? "Hari Ini"
                    : f === "week"
                      ? "1 Pekan"
                      : "Bulan Ini"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          /* ✅ LOADING STATE: SKELETON */
          <div className="overflow-hidden">
            <div className="flex">
              {[...Array(visible)].map((_, i) => (
                <EventSkeleton key={i} cardWidth={cardWidth} />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-24">
            <div className="inline-flex flex-col items-center gap-3 text-muted-foreground">
              <CalendarDays className="h-8 w-8 opacity-40" />
              <p className="text-sm">Tidak ada konten {filterLabel}</p>
            </div>
          </div>
        ) : (
          /* DATA STATE: CAROUSEL */
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
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex-shrink-0 px-4 my-4"
                  style={{ width: `${cardWidth}%` }}
                >
                  <div className="bg-card rounded-xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                    {/* IMAGE */}
                    <div className="relative h-56 overflow-hidden group bg-muted">
                      {event.cover ? (
                        <img
                          src={event.cover}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/600x400?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
                          <CalendarDays className="h-12 w-12 opacity-20 mb-2" />
                          <span className="text-xs opacity-50">
                            Gambar tidak tersedia
                          </span>
                        </div>
                      )}

                      {/* Label Overlay */}
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className={`text-sm px-3 py-1 rounded-full font-semibold shadow ${
                            event.scope === "jatim"
                              ? "bg-gold text-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {event.scope === "jatim"
                            ? "PW Jawa Timur"
                            : `PD ${event.daerah}`}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* CONTENT */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <CalendarDays className="h-4 w-4" />
                        {event.display_date}
                      </div>

                      <h3 className="font-display font-semibold mb-2 line-clamp-2 text-foreground">
                        {event.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {event.excerpt}
                      </p>

                      <div className="mt-auto">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            to={
                              event.scope === "daerah"
                                ? `/kabar/daerah/${event.daerah_slug}/${event.slug}`
                                : `/kabar/jatim/${event.slug}`
                            }
                          >
                            Lihat Detail
                          </Link>
                        </Button>
                      </div>
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
