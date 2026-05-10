import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useConsultation } from "@/hooks/useConsultation";
import { Consultation } from "@/hooks/useConsultation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Calendar,
  User,
  Tag,
  Share2,
  MessageSquare,
  HelpCircle,
  Mic, // Tambahkan ikon Mic
} from "lucide-react";

import { Link } from "react-router-dom";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import CustomAudioPlayer from "@/components/ui/CustomAudioPlayer"; // Impor Audio Player
import Swal from "sweetalert2";

const ConsultationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { fetchConsultationBySlug, loading } = useConsultation();
  const [consultation, setConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    if (slug) {
      fetchConsultationBySlug(slug).then((res) => setConsultation(res));
    }
  }, [slug, fetchConsultationBySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 container mx-auto px-6">
        <Skeleton className="h-10 w-2/3 mb-6" />
        <Skeleton className="h-4 w-1/4 mb-12" />
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
      </div>
    );
  }

  if (!consultation) return null;

  const handleShare = async () => {
    if (!consultation) return;

    const shareData = {
      title: consultation.title,
      text: `Baca Konsultasi Agama: ${consultation.title}`,
      url: window.location.href, // Mengambil URL halaman saat ini
    };

    try {
      // Cek apakah browser mendukung fitur Share Native (seperti di HP)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy Link ke Clipboard jika di Desktop
        await navigator.clipboard.writeText(window.location.href);

        // Tampilkan toast sukses (menggunakan Swal yang sudah Anda impor)
        Swal.fire({
          icon: "success",
          title: "Link Tersalin",
          text: "Tautan berhasil disalin ke papan klip.",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (err: unknown) {
      // Abaikan error jika user membatalkan share
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share failed:", err.message);
      }
    }
  };
  return (
    <main className="min-h-screen bg-background islamic-pattern pt-32 pb-20 transition-colors duration-500">
      <div className="container mx-auto pt-8 px-4 md:px-6 max-w-4xl">
        {/* BACK BUTTON */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 md:mb-8 group text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
        >
          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Arsip
        </Button>

        <article className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 shadow-xl shadow-emerald-900/5 dark:shadow-black/20 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
          {/* HEADER SECTION */}
          <header className="p-6 md:p-12 border-b border-emerald-50 dark:border-emerald-900 bg-gradient-to-b from-emerald-50/30 dark:from-emerald-900/10 to-transparent">
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6">
              <Badge className="bg-gold/10 text-gold border-gold/20 px-4 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
                {consultation.consultation_categories?.name}
              </Badge>
              <div className="flex flex-wrap items-center text-muted-foreground text-xs md:sm gap-3 md:gap-4">
                <span className="flex items-center gap-1.5 leading-none">
                  <Calendar
                    size={14}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  {new Date(consultation.created_at).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </span>
                <span className="flex items-center gap-1.5 leading-none">
                  <User
                    size={14}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  {consultation.author_name || "Hamba Allah"}
                </span>
              </div>
            </div>

            <h1 className="font-display font-bold text-2xl md:text-4xl lg:text-5xl text-foreground leading-tight tracking-tight">
              {consultation.title}
            </h1>
          </header>

          <div className="p-6 md:p-12 space-y-10 md:space-y-16">
            {/* PERTANYAAN */}
            <section className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                  <MessageSquare size={20} />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground">
                  Pertanyaan
                </h2>
              </div>

              <div className="relative group">
                <div className="absolute -left-2 top-4 w-4 h-4 bg-emerald-100 dark:bg-emerald-900/50 rotate-45 rounded-sm" />
                <div className="bg-emerald-50/50 dark:bg-emerald-900/30 rounded-3xl rounded-tl-none p-6 md:p-8 border border-emerald-100/50 dark:border-emerald-800 italic text-foreground/80 leading-relaxed text-base md:text-lg shadow-sm">
                  <span className="text-3xl text-emerald-300 dark:text-emerald-700 font-serif absolute -top-2 -left-1 opacity-50">
                    "
                  </span>
                  {consultation.question}
                  <span className="text-3xl text-emerald-300 dark:text-emerald-700 font-serif absolute -bottom-6 right-4 opacity-50">
                    "
                  </span>
                </div>
              </div>
            </section>

            {/* JAWABAN */}
            <section className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-2xl bg-gold flex items-center justify-center text-emerald-900 shadow-lg shadow-gold/20">
                  <Tag size={20} />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground">
                  Jawaban Asatidz
                </h2>
              </div>

              {/* VOICE NOTE SECTION */}
              {consultation.reply_audio_url && (
                <div className="mb-8 p-4 md:p-6 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/50 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-1000">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <Mic size={14} className="text-emerald-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                      Dengarkan Penjelasan Suara
                    </span>
                  </div>
                  <CustomAudioPlayer src={consultation.reply_audio_url} />
                </div>
              )}

              {/* Teks Jawaban */}
              <div className="font-sans text-foreground/90 leading-[1.8] md:leading-[2] text-base md:text-xl whitespace-pre-wrap selection:bg-emerald-100 dark:selection:bg-emerald-800">
                {consultation.answer}
              </div>

              {/* FOOTNOTE: Dijawab Oleh */}
              {/* FOOTNOTE: Dijawab Oleh */}
              <div className="mt-10 pt-6 border-t border-dashed border-emerald-100 dark:border-emerald-900/50 flex flex-col gap-1">
                <p className="text-xs md:text-sm text-muted-foreground italic">
                  Wallahu a'lam bish-shawabi.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {/* Garis aksen emas */}
                  <div className="h-px w-8 bg-gold/50" />

                  <p className="text-sm md:text-base font-display font-bold text-emerald-800 dark:text-emerald-400">
                    Dijawab oleh:{" "}
                    <span className="text-foreground">
                      {/* Menggunakan data dari join tabel public.admins */}
                      {consultation.admins?.name || "Admin"}
                    </span>
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* FOOTER ACTION */}
          <footer className="p-6 md:p-8 bg-slate-50 dark:bg-emerald-900/20 border-t border-emerald-50 dark:border-emerald-900 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-xs md:text-sm text-muted-foreground font-medium order-2 sm:order-1">
              ID Konsultasi:{" "}
              <span className="font-mono text-emerald-700 dark:text-emerald-400">
                #{consultation.id.toString().substring(0, 8)}
              </span>
            </div>
            <div className="flex gap-4 order-1 sm:order-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleShare} // <--- Tambahkan Event Click di sini
                className="w-full sm:w-auto rounded-full border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all active:scale-95"
              >
                <Share2 size={16} className="mr-2" /> Bagikan
              </Button>
            </div>
          </footer>
        </article>

        {/* RELATED INFO CARD */}
        <div className="mt-8 md:mt-12 p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-emerald-900 dark:bg-emerald-800 text-white relative overflow-hidden group shadow-2xl shadow-emerald-900/20">
          <div className="relative z-10 max-w-lg">
            <h4 className="font-display font-bold text-2xl md:text-3xl mb-3">
              Punya Pertanyaan Serupa?
            </h4>
            <p className="text-emerald-100/70 text-sm md:text-base mb-8 leading-relaxed">
              Jangan ragu untuk berkonsultasi langsung dengan dewan asatidz kami
              melalui fitur pesan interaktif. Kami siap membantu persoalan
              syariah Anda.
            </p>

            <Link to="/konsultasi?tab=tanya">
              <Button className="bg-gold hover:bg-white text-emerald-900 font-bold rounded-2xl px-8 h-12 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20">
                Tanya Sekarang
              </Button>
            </Link>
          </div>
          <HelpCircle className="absolute -right-8 -bottom-8 text-white/5 h-48 w-48 md:h-64 md:w-64 transition-transform group-hover:scale-110 group-hover:-rotate-12 duration-700" />
        </div>
      </div>
      <FloatingChatWidget
        onDirectConsult={() => {
          navigate("/konsultasi?tab=tanya");
        }}
      />
    </main>
  );
};

export default ConsultationDetail;
