import { Users, ShieldCheck, PenTool } from "lucide-react";

const ConsultationTeam = () => {
  // Data tim dengan path foto (pastikan path sesuai dengan lokasi penyimpanan Anda)
  const experts = [
    {
      name: "Ust. H. Agung Cahyadi, MA",
      image: "/pakar1.png", // Ganti dengan path foto H. Agung Cahyadi
    },
    {
      name: "Ust. Amin Syukroni, Lc",
      image: "/pakar2.png", // Ganti dengan path foto Amin Syukroni
    },
  ];

  const editor = {
    name: "Ust. Samsul Hadi, S.Pd.",
    image: "/editor.png", // Ganti dengan path foto Ust Samsul Hadi
  };

  return (
    <div className="p-8 md:p-10 rounded-[3rem] bg-[#064e3b] text-white shadow-2xl relative overflow-hidden group border border-emerald-800">
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-10">
          <Users size={24} className="text-emerald-400 opacity-80" />
          <h3 className="font-display font-black text-xl md:text-2xl text-emerald-50 tracking-tight">
            Struktur Dewan Konsultasi
          </h3>
        </div>

        <div className="space-y-12">
          {/* Section: Dewan Pakar Syariah */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4 px-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h4 className="text-[12px] font-black uppercase tracking-[0.25em] text-emerald-400/70">
                Dewan Pakar Syariah
              </h4>
            </div>

            <div className="space-y-5">
              {experts.map((person, index) => (
                <div
                  key={index}
                  className="flex items-center gap-6 bg-emerald-900/30 backdrop-blur-sm p-5 rounded-[2.5rem] border border-emerald-800/50 hover:bg-emerald-800/40 transition-all duration-500 group/item"
                >
                  {/* Photo Container - Diperbesar */}
                  <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover/item:bg-emerald-500/40 transition-all" />
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover/item:scale-110"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base md:text-xl font-black tracking-tight text-white leading-tight">
                      {person.name}
                    </span>
                    <span className="text-xs md:text-sm text-emerald-400/80 font-bold uppercase tracking-widest">
                      Konsultan Syariah
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Redaktur Utama */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4 px-2">
              <PenTool size={18} className="text-emerald-400" />
              <h4 className="text-[12px] font-black uppercase tracking-[0.25em] text-emerald-400/70">
                Redaktur Utama
              </h4>
            </div>

            <div className="flex items-center gap-6 bg-emerald-900/40 backdrop-blur-md p-5 rounded-[2.5rem] border-2 border-emerald-500/30 border-l-[6px] border-l-emerald-500 hover:bg-emerald-800/50 transition-all duration-500 group/editor">
              <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 relative">
                <div className="absolute inset-0 bg-emerald-400/10 rounded-full blur-lg" />
                <img
                  src={editor.image}
                  alt={editor.name}
                  className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover/editor:scale-110"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base md:text-xl font-black tracking-tight text-white leading-tight">
                  {editor.name}
                </span>
                <span className="text-xs md:text-sm text-emerald-400 font-bold uppercase tracking-widest">
                  Manajemen Redaksi
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-emerald-200/40 mt-10 italic font-medium tracking-wide">
            ...dan dewan asatidz lainnya yang tergabung dalam komite syariah.
          </p>
        </div>
      </div>

      {/* Background Icon Decoration */}
      <Users
        size={200}
        className="absolute -right-20 -bottom-20 opacity-[0.03] text-white rotate-12"
      />
    </div>
  );
};

export default ConsultationTeam;
