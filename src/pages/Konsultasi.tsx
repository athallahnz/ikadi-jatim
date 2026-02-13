const Konsultasi = () => {
  return (
    <section className="py-24 bg-cream islamic-pattern min-h-screen">
      <div className="container mx-auto px-4">
        {/* Frame Container */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-xl border border-border bg-background">
          <iframe
            src="https://konsultasisyariah.net"
            title="Konsultasi Syariah"
            className="w-full h-screen border-0"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default Konsultasi;
