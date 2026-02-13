const Kajian = () => {
  return (
    <section className="pt-32 pb-24 bg-cream islamic-pattern">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-display font-bold mb-4">
          Kajian & Artikel
        </h1>
        <div className="gold-divider mb-12" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">
                Judul Artikel Kajian
              </h3>
              <p className="text-sm text-muted-foreground">
                Ringkasan singkat artikel kajian akan ditampilkan di sini.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Kajian;
