import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  {
    title: "Pelatihan Da'i Muda Jawa Timur 2026",
    date: "15–17 Maret 2026",
    desc: "Workshop intensif bagi da'i muda di seluruh Jawa Timur untuk meningkatkan kapasitas dakwah digital.",
    color: "bg-primary",
  },
  {
    title: "Kajian Akbar: Dakwah di Era Digital",
    date: "5 April 2026",
    desc: "Kajian bersama ulama dan pakar komunikasi tentang strategi dakwah menghadapi tantangan era digital.",
    color: "bg-accent",
  },
  {
    title: "Musyawarah Wilayah PW IKADI Jatim",
    date: "20 Mei 2026",
    desc: "Musyawarah tahunan untuk evaluasi program dan perencanaan strategis dakwah tahun mendatang.",
    color: "bg-primary",
  },
];

const EventsSection = () => {
  return (
    <section id="agenda" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Agenda & Kegiatan Terbaru
          </h2>
          <div className="gold-divider mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {events.map((event, i) => (
            <div
              key={event.title}
              className="animate-on-scroll bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className={`${event.color} h-2`} />
              <div className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <CalendarDays className="h-4 w-4" />
                  {event.date}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{event.desc}</p>
                <Button variant="outline" size="sm">
                  Lihat Detail
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
