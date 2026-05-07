import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  User,
  MapPin,
  Calendar,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { Consultation } from "@/pages/admin/Consultations";

export interface DetailConsultationProps {
  data: Consultation | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DetailConsultation({
  data,
  onClose,
  onSuccess,
}: DetailConsultationProps) {
  const [answerContent, setAnswerContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (data?.answer) {
      setAnswerContent(data.answer);
    } else {
      setAnswerContent("");
    }
  }, [data]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmitAnswer = async () => {
    if (!data) return;
    if (!answerContent.trim()) {
      Swal.fire("Peringatan", "Jawaban tidak boleh kosong", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("consultations")
        .update({
          answer: answerContent,
          status: 1,
          answered_at: new Date().toISOString(),
        })
        .eq("id", data.id);

      if (error) throw error;

      await Swal.fire("Berhasil", "Jawaban berhasil dikirim", "success");

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan jawaban", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Detail Konsultasi
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              ID: #{data.id} • {data.slug || "-"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pengirim</p>
                <p className="text-sm font-medium text-foreground">
                  {data.author_name || "Hamba Allah (Anonim)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kota Asal</p>
                <p className="text-sm font-medium text-foreground">
                  {data.city || "Tidak disebutkan"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                <Tag size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kategori</p>
                <p className="text-sm font-medium text-foreground">
                  {data.consultation_categories?.name || "Umum"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tanggal Kirim</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(data.created_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              {data.title || "Tanpa Judul"}
            </h3>
            <div className="p-4 bg-muted/20 border border-border rounded-xl text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {data.question || "Tidak ada isi pertanyaan."}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              Tanggapan / Jawaban
              {data.status === 1 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 font-medium uppercase tracking-wider">
                  <CheckCircle2 size={12} /> Terjawab
                </span>
              )}
            </h3>

            {data.status === 1 ? (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {data.answer}
                </div>
                {data.answered_at && (
                  <p className="text-xs text-muted-foreground text-right">
                    Dijawab pada:{" "}
                    {new Date(data.answered_at).toLocaleString("id-ID", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={answerContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setAnswerContent(e.target.value)
                  }
                  placeholder="Ketik jawaban Anda di sini..."
                  rows={6}
                  className="w-full p-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none transition-all"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-border bg-muted/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-muted transition-colors"
          >
            Tutup
          </button>

          {data.status === 0 && (
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !answerContent.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Menyimpan..."
              ) : (
                <>
                  Kirim Jawaban <Send size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
