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
import { UnifiedConsultation } from "@/types/database";

export interface DetailConsultationProps {
  data: UnifiedConsultation;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DetailConsultation({
  data,
  onClose,
  onSuccess,
}: DetailConsultationProps) {
  const [answerContent, setAnswerContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state dengan data reply_message (kolom baru dari inbox_consultations)
  useEffect(() => {
    if (data?.reply_message) {
      setAnswerContent(data.reply_message);
    } else {
      setAnswerContent("");
    }
  }, [data]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Helper pembuat Slug (Pastikan ini ada di komponen Anda)
  const createUniqueSlug = (text: string) => {
    const baseSlug = text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
      .substring(0, 50);
    return `${baseSlug}-${Date.now()}`;
  };

  const handleSubmitAnswer = async () => {
    if (!data) return;
    if (!answerContent.trim()) {
      Swal.fire("Peringatan", "Jawaban tidak boleh kosong", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🚀 1. DAPATKAN ID ADMIN YANG SEDANG LOGIN
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error("Sesi login tidak valid. Silakan login ulang.");
      }
      const adminId = authData.user.id; // UUID Admin

      const now = new Date().toISOString();

      if (data.inbox_id) {
        // 🔥 ALUR DATA BARU (Dari tabel Inbox)
        const uniqueSlug = createUniqueSlug(data.subject || "konsultasi-agama");

        // Update status di Inbox (Tambahkan answered_by jika di tabel Anda ada kolomnya, opsional)
        const { error: errInbox } = await supabase
          .from("inbox_consultations")
          .update({
            reply_message: answerContent,
            status: "answered",
            answered_at: now,
            // answered_by: adminId, // Uncomment baris ini jika tabel inbox_consultations juga punya kolom answered_by
          })
          .eq("id", data.inbox_id);

        if (errInbox) throw errInbox;

        // Publish ke Publik
        const { error: errPublic } = await supabase
          .from("consultations")
          .upsert(
            {
              inbox_id: data.inbox_id,
              author_name: data.name ?? "Hamba Allah",
              city: data.city ?? "Tidak disebutkan",
              title: data.subject ?? "Konsultasi Agama",
              slug: uniqueSlug,
              question: data.message,
              answer: answerContent,
              category_id: data.category_id,
              status: 1,
              created_at: data.created_at || now,
              answered_at: now,
              answered_by: adminId, // ✅ ID Admin dimasukkan di sini
            },
            { onConflict: "inbox_id" },
          );

        if (errPublic) throw errPublic;
      } else {
        // 🔥 ALUR DATA LAMA (Hanya ada di tabel Consultations publik)
        const { error: errOld } = await supabase
          .from("consultations")
          .update({
            answer: answerContent,
            status: 1,
            answered_at: now,
            answered_by: adminId, // ✅ ID Admin dimasukkan di sini
          })
          .eq("id", data.id);

        if (errOld) throw errOld;
      }

      await Swal.fire("Berhasil", "Jawaban berhasil dipublikasikan", "success");
      onSuccess();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; details?: string };
      console.error("Gagal Submit:", errorObj);
      Swal.fire(
        "Gagal",
        errorObj.message || "Terjadi kesalahan sistem",
        "error",
      );
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
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Detail Konsultasi
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              ID: {data.id.split("-")[0]}... {/* Menampilkan potongan UUID */}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pengirim</p>
                <p className="text-sm font-medium text-foreground">
                  {data.name || "Hamba Allah (Anonim)"}
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

          {/* Question Section */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              {data.subject || "Tanpa Judul"}
            </h3>
            <div className="p-4 bg-muted/20 border border-border rounded-xl text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {data.message || "Tidak ada isi pertanyaan."}
            </div>
          </div>

          {/* Answer Section */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              Tanggapan / Jawaban
              {data.status === "answered" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 font-medium uppercase tracking-wider">
                  <CheckCircle2 size={12} /> Terjawab
                </span>
              )}
            </h3>

            {data.status === "answered" ? (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {data.reply_message}
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

        {/* Modal Footer */}
        <div className="p-5 border-t border-border bg-muted/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-muted transition-colors active:scale-95"
          >
            Tutup
          </button>

          {data.status === "pending" && (
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !answerContent.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
