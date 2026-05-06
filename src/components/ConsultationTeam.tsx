import { Users } from "lucide-react";

const ConsultationTeam = () => {
  const team = ["H. Agung Cahyadi, MA", "Amin Syukroni, Lc"];

  return (
    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-lg relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Users size={20} className="text-gold" />
          <h3 className="font-display font-bold text-lg text-emerald-50">
            Tim Konsultasi Syariah
          </h3>
        </div>

        <div className="space-y-3">
          {team.map((name, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/5"
            >
              <div className="h-2 w-2 rounded-full bg-gold" />
              <span className="text-sm font-bold tracking-wide">{name}</span>
            </div>
          ))}
          <p className="text-[10px] text-emerald-200/60 mt-4 italic">
            ...dan dewan asatidz lainnya.
          </p>
        </div>
      </div>

      {/* Background Icon Decoration */}
      <Users
        size={120}
        className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700"
      />
    </div>
  );
};

export default ConsultationTeam;
