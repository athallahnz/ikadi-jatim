import { Info, Sparkles } from "lucide-react";

const ConsultationAbout = () => {
  return (
    <section className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900 p-8 md:p-10 relative overflow-hidden">
      {/* Decorative Background Icon */}
      <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-emerald-200/20 dark:text-emerald-700/10 rotate-12" />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="h-10 w-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
          <Info size={20} />
        </div>
        <h3 className="font-display font-bold text-xl dark:text-emerald-50">
          Tentang Layanan
        </h3>
      </div>

      <div className="space-y-6 text-slate-600 dark:text-emerald-100/70 leading-loose text-sm md:text-base relative z-10">
        <p>
          <strong className="text-emerald-800 dark:text-emerald-400">
            Pengurus Wilayah IKADI (Ikatan Dai Indonesia) Jawa Timur
          </strong>
          , bekerjasama dengan Lembaga Amil Zakat Nasional (LAZNAS)
          <strong className="text-emerald-800 dark:text-emerald-400">
            {" "}
            LMI (Lembaga Manajemen Infaq)
          </strong>
          , menghadirkan portal{" "}
          <span className="italic">Konsultasi Syariah</span> sebagai solusi
          bimbingan keagamaan digital bagi umat.
        </p>

        <p>
          Layanan ini hadir untuk menjawab berbagai permasalahan kehidupan
          menurut perspektif Islam secara akurat. Rubrik konsultasi kami susun
          berdasarkan kategori masalah untuk memudahkan Anda menelusuri jawaban
          sesuai kebutuhan syariat Anda.
        </p>

        {/* NEW SECTION: AI RAG TECHNOLOGY */}
        <div className="p-6 bg-white/60 dark:bg-emerald-900/40 rounded-3xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
            <Sparkles size={16} className="animate-pulse" />
            Teknologi Baru: Smart AI Assistant
          </div>
          <p className="text-sm md:text-[15px] leading-relaxed">
            Kini kami dilengkapi dengan{" "}
            <strong className="text-emerald-800 dark:text-emerald-300 text-sm md:text-[15px]">
              AI Assistant berteknologi RAG (Retrieval-Augmented Generation)
            </strong>
            . Melalui fitur Robot Virtual, Anda dapat memperoleh jawaban instan
            yang bersumber langsung dari basis data fatwa dan arsip konsultasi
            dewan asatidz kami secara cerdas, cepat, dan akurat selama 24 jam.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConsultationAbout;
