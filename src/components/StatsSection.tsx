const stats = [
  { value: "38", label: "DPD di Jawa Timur" },
  { value: "1.200+", label: "Da'i Aktif" },
  { value: "2005", label: "Berdiri Sejak" },
  { value: "50+", label: "Program Tahunan" },
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-emerald-dark islamic-pattern-dark relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="animate-on-scroll text-center"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <p className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-2">
                {stat.value}
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
