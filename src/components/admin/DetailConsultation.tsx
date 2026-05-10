import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  User,
  Tag,
  Edit3,
  Trash2,
  Mic,
  Sparkles,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { UnifiedConsultation } from "@/types/database";
import CustomAudioPlayer from "@/components/ui/CustomAudioPlayer";
import VoiceRecorder from "@/components/VoiceRecorder";
import { Button } from "@/components/ui/button";

export interface DetailConsultationProps {
  data: UnifiedConsultation;
  onClose: () => void;
  onSuccess: () => void;
}

interface SupabaseError {
  message: string;
}

export default function DetailConsultation({
  data,
  onClose,
  onSuccess,
}: DetailConsultationProps) {
  const [answerContent, setAnswerContent] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false); // State baru
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Sync state awal
  useEffect(() => {
    if (data) {
      setAnswerContent(data.reply_message || "");
      setAudioUrl(data.reply_audio_url || null);
    }
  }, [data]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isRecording && !isTranscribing) {
      onClose();
    }
  };

  const createUniqueSlug = (text: string): string => {
    const baseSlug = text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
      .substring(0, 50);
    return `${baseSlug}-${Date.now()}`;
  };

  // --- FITUR TRANSCRIBE AI ---
  const handleTranscribe = async () => {
    if (!audioUrl) return;

    setIsTranscribing(true);
    try {
      const { data: response, error } = await supabase.functions.invoke(
        "transcribe-vn",
        {
          body: { audioUrl: audioUrl },
        },
      );

      if (error) throw error;

      const transcription = response.text;

      // Append hasil transkripsi ke textarea (tidak me-replace)
      setAnswerContent((prev) => {
        const separator = prev.trim() ? "\n\n" : "";
        return `${prev}${separator}${transcription}`;
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil Transkripsi",
        text: "Teks suara telah ditambahkan ke jawaban.",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const errorObj = err as SupabaseError;
      console.error("Transcription error:", errorObj);
      Swal.fire(
        "Gagal",
        "AI gagal mengubah suara ke teks: " + errorObj.message,
        "error",
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!data) return;
    if (!answerContent.trim()) {
      Swal.fire("Peringatan", "Jawaban teks tidak boleh kosong", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error("Sesi tidak valid.");

      const adminId = authData.user.id;
      const now = new Date().toISOString();

      const payload = {
        reply_message: answerContent,
        reply_audio_url: audioUrl,
        status: "answered" as const,
        answered_at: now,
      };

      if (data.inbox_id) {
        // Update Inbox
        const { error: errInbox } = await supabase
          .from("inbox_consultations")
          .update(payload)
          .eq("id", data.inbox_id);
        if (errInbox) throw errInbox;

        // Upsert ke Public Consultations
        const { error: errPublic } = await supabase
          .from("consultations")
          .upsert(
            {
              inbox_id: data.inbox_id,
              author_name: data.name ?? "Hamba Allah",
              city: data.city ?? "Tidak disebutkan",
              title: data.subject ?? "Konsultasi Agama",
              slug: data.slug || createUniqueSlug(data.subject || "konsultasi"),
              question: data.message,
              answer: answerContent,
              reply_audio_url: audioUrl,
              category_id: data.category_id,
              status: 1,
              created_at: data.created_at || now,
              answered_at: now,
              answered_by: adminId,
            },
            { onConflict: "inbox_id" },
          );
        if (errPublic) throw errPublic;
      } else {
        // Alur lama
        const { error: errOld } = await supabase
          .from("consultations")
          .update({
            answer: answerContent,
            reply_audio_url: audioUrl,
            status: 1,
            answered_at: now,
            answered_by: adminId,
          })
          .eq("id", data.id);
        if (errOld) throw errOld;
      }

      await Swal.fire("Berhasil", "Jawaban telah disimpan", "success");
      setIsEditing(false);
      onSuccess();
    } catch (err: unknown) {
      const errorObj = err as SupabaseError;
      Swal.fire("Gagal", errorObj.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Detail Konsultasi
            </h2>
            <p className="text-sm text-muted-foreground">
              ID: {data.id.split("-")[0]}...
            </p>
          </div>
          {!isRecording && !isTranscribing && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/5 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                <User size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Pengirim
                </p>
                <p className="text-sm font-medium truncate">
                  {data.name || "Anonim"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                <Tag size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Kategori
                </p>
                <p className="text-sm font-medium truncate">
                  {data.consultation_categories?.name || "Umum"}
                </p>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" /> Pertanyaan
            </h3>
            <div className="p-4 bg-muted/20 border border-border rounded-xl text-sm leading-relaxed italic">
              "{data.message}"
            </div>
          </div>

          {/* Answer Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Jawaban
                Admin
              </h3>
              {data.status === "answered" && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 h-8 gap-2"
                >
                  <Edit3 size={14} /> Edit Jawaban
                </Button>
              )}
            </div>

            {data.status === "answered" && !isEditing ? (
              /* VIEW MODE */
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-sm whitespace-pre-wrap">
                  {data.reply_message}
                </div>
                {data.reply_audio_url && (
                  <div className="p-4 bg-background border border-border rounded-xl">
                    <p className="text-[10px] font-bold text-muted-foreground mb-3 flex items-center gap-1 uppercase tracking-wider">
                      <Mic size={12} /> Voice Note Respons
                    </p>
                    <CustomAudioPlayer src={data.reply_audio_url} />
                  </div>
                )}
              </div>
            ) : (
              /* EDIT / PENDING MODE */
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Ketik jawaban tertulis..."
                  rows={5}
                  disabled={isRecording || isTranscribing}
                  className="w-full p-4 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50"
                />

                <div className="p-4 bg-muted/10 border border-dashed border-border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Voice Note (Opsional)
                    </p>

                    {/* TOMBOL AI TRANSCRIBE */}
                    {audioUrl && !isRecording && (
                      <button
                        type="button"
                        onClick={handleTranscribe}
                        disabled={isTranscribing}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-200 hover:bg-amber-500/20 transition-all text-[10px] font-bold uppercase disabled:opacity-50"
                      >
                        {isTranscribing ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Sparkles size={12} className="fill-current" />
                        )}
                        {isTranscribing ? "Processing..." : "AI Transcribe"}
                      </button>
                    )}
                  </div>

                  {audioUrl ? (
                    <div className="flex flex-col gap-3">
                      <CustomAudioPlayer src={audioUrl} />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isTranscribing}
                        className="w-fit h-7 text-[10px]"
                        onClick={() => {
                          setAudioUrl(null);
                        }}
                      >
                        <Trash2 size={12} className="mr-1" /> Hapus & Rekam
                        Ulang
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <VoiceRecorder
                        ticketId={data.inbox_id || data.id}
                        onUploadComplete={(url) => setAudioUrl(url)}
                        onClear={() => setAudioUrl(null)}
                        onRecordingStateChange={(recording) =>
                          setIsRecording(recording)
                        }
                      />
                      {!isRecording && (
                        <span className="text-xs text-muted-foreground italic">
                          Klik mic untuk mulai merekam suara...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-muted/20 flex justify-end gap-3">
          {!isRecording && !isTranscribing && (
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setAnswerContent(data.reply_message || "");
                  setAudioUrl(data.reply_audio_url || null);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-all"
            >
              {isEditing ? "Batal" : "Tutup"}
            </button>
          )}

          {(data.status === "pending" || isEditing) && !isRecording && (
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || isTranscribing || !answerContent.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
            >
              {isSubmitting ? (
                "Menyimpan..."
              ) : (
                <>
                  Simpan Jawaban <Send size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
