import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  ArrowRight,
  LogOut,
  User,
  Loader2,
  ChevronLeft,
  Calendar,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Mail, // Tambahan icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

// --- Interfaces ---
export interface ConsultationTicket {
  categories: {
    name: string;
  } | null;
  id: string;
  name: string | null;
  contact_info: string;
  email: string | null; // Tambahkan email sesuai skema DB
  subject: string | null;
  message: string;
  reply_message: string | null;
  category_id: number | null;
  status: string;
  created_at: string;
  answered_at?: string | null;
}

// Tipe data untuk melacak jenis kredensial yang aktif
type AuthColumn = "email" | "contact_info";

const PortalKonsultasi: React.FC = () => {
  // --- States ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginInput, setLoginInput] = useState<string>(""); // Menggantikan phoneNumber
  const [activeCredential, setActiveCredential] = useState<{
    column: AuthColumn;
    value: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tickets, setTickets] = useState<ConsultationTicket[]>([]);
  const [activeChat, setActiveChat] = useState<ConsultationTicket | null>(null);
  const [showMobileList, setShowMobileList] = useState<boolean>(true);

  // --- Logic: Auth ---
  const handleLogin = async (): Promise<void> => {
    const rawInput = loginInput.trim();
    if (!rawInput) return;

    setIsLoading(true);

    // 1. Deteksi Email vs Nomor Telepon
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawInput);
    let searchColumn: AuthColumn;
    let searchValue: string;

    if (isEmail) {
      searchColumn = "email";
      searchValue = rawInput.toLowerCase();
    } else {
      searchColumn = "contact_info";
      // 2. Pembersihan Nomor Global:
      // Hapus semua karakter non-angka KECUALI tanda '+' di paling awal.
      searchValue = rawInput.replace(/(?!^\+)[^\d]/g, "");
    }

    // Jika setelah dibersihkan string kosong, batalkan
    if (!searchValue) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("inbox_consultations")
        .select(`*, categories:category_id (name)`)
        .eq(searchColumn, searchValue)
        .not("status", "eq", "trashed")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTickets(data as ConsultationTicket[]);
        setIsLoggedIn(true);
        setActiveCredential({ column: searchColumn, value: searchValue });
      } else {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: `Pastikan ${isEmail ? "Email" : "Nomor WA"} yang dimasukkan sama saat bertanya.`,
          confirmButtonColor: "#047857",
        });
      }
    } catch (err) {
      console.error("Portal Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = (): void => {
    setIsLoggedIn(false);
    setTickets([]);
    setActiveChat(null);
    setLoginInput("");
    setActiveCredential(null);
    setShowMobileList(true);
  };

  // --- Realtime Sync ---
  useEffect(() => {
    if (!isLoggedIn || !activeCredential) return;

    const channel = supabase
      .channel(`inbox_${activeCredential.value}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "inbox_consultations",
          // Filter disesuaikan dengan kolom login (email atau contact_info)
          filter: `${activeCredential.column}=eq.${activeCredential.value}`,
        },
        (payload) => {
          const newData = payload.new as ConsultationTicket;

          // Update Tickets List
          setTickets((prev) =>
            prev.map((t) =>
              t.id === newData.id
                ? { ...t, ...newData, categories: t.categories }
                : t,
            ),
          );

          // Update Active Chat
          setActiveChat((current) => {
            if (current?.id === newData.id) {
              return { ...current, ...newData, categories: current.categories };
            }
            return current;
          });
        },
      )
      .subscribe((status: unknown) => {
        if (status === "SUBSCRIPTION_ERROR" || status === "CHANNEL_ERROR") {
          console.error("Koneksi realtime Safari bermasalah.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn, activeCredential]);

  // --- Render: Login View ---
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[500px] p-4">
        <div className="bg-white dark:bg-emerald-950 p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-emerald-100 dark:border-emerald-900 text-center w-full max-w-lg mx-auto">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="text-emerald-700 dark:text-emerald-400 h-8 w-8" />
          </div>
          <h1 className="font-bold text-2xl mb-2 text-foreground">
            Cek Jawaban Anda
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Masukkan Nomor WhatsApp atau Email Anda untuk melihat riwayat
            konsultasi.
          </p>
          <div className="relative mb-6 text-left">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Contoh: +62812... atau email@anda.com"
                className="w-full bg-emerald-50/50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          <Button
            onClick={handleLogin}
            disabled={isLoading || !loginInput.trim()}
            className="w-full h-14 rounded-2xl bg-emerald-700 hover:bg-emerald-800 shadow-lg"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Masuk"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  }

  // --- Render: Main App View ---
  return (
    <div className="w-full bg-white dark:bg-emerald-950 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-emerald-100 dark:border-emerald-900 flex flex-col md:flex-row overflow-hidden h-[85vh] max-h-[750px]">
      {/* Sidebar Riwayat */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-emerald-100 dark:border-emerald-900 flex flex-col bg-emerald-50/10 dark:bg-emerald-900/5 ${!showMobileList ? "hidden md:flex" : "flex h-full"}`}
      >
        {/* Header Sidebar (Sticky) */}
        <div className="p-6 border-b border-emerald-100 dark:border-emerald-900 bg-white dark:bg-emerald-950/50 backdrop-blur-md shrink-0">
          <div className="flex justify-between items-start mb-1">
            <h2 className="font-black text-xl tracking-tight text-emerald-900 dark:text-emerald-50">
              Riwayat
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20 group"
            >
              <LogOut className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[11px] font-bold font-mono text-emerald-600/70 tracking-tighter truncate max-w-[200px]">
              {activeCredential?.value}
            </p>
          </div>
        </div>

        {/* List Riwayat Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
              <MessageSquare size={40} className="mb-2 text-emerald-600" />
              <p className="text-xs font-bold uppercase tracking-widest">
                Belum Ada Riwayat
              </p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const isActive = activeChat?.id === ticket.id;
              const isAnswered = ticket.status === "answered";
              return (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setActiveChat(ticket);
                    setShowMobileList(false);
                  }}
                  className={`group relative p-5 rounded-[2rem] cursor-pointer transition-all duration-300 border-2 ${
                    isActive
                      ? "bg-emerald-600 border-emerald-400 shadow-xl shadow-emerald-900/20 -translate-y-1 text-white"
                      : "bg-white dark:bg-emerald-900/10 border-emerald-50 dark:border-emerald-900/50 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`p-1 rounded-full ${isActive ? "bg-white/20" : isAnswered ? "bg-emerald-100 dark:bg-emerald-800" : "bg-amber-100 dark:bg-amber-900/40"}`}
                      >
                        {isAnswered ? (
                          <CheckCircle2
                            size={10}
                            className={
                              isActive ? "text-white" : "text-emerald-600"
                            }
                          />
                        ) : (
                          <Clock
                            size={10}
                            className={
                              isActive ? "text-white" : "text-amber-600"
                            }
                          />
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-white" : "text-muted-foreground"}`}
                      >
                        {isAnswered ? "Dijawab" : "Menunggu"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-tighter ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600"
                      }`}
                    >
                      {ticket.categories?.name || "Umum"}
                    </span>
                  </div>

                  <p
                    className={`text-[11px] line-clamp-2 leading-relaxed ${isActive ? "text-emerald-50" : "text-muted-foreground"}`}
                  >
                    {ticket.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Viewport Chat */}
      <div
        className={`flex-1 flex flex-col bg-[#fcfdfc] dark:bg-[#080f0c] relative min-w-0 ${showMobileList ? "hidden md:flex" : "flex h-full"}`}
      >
        {activeChat ? (
          <>
            {/* Header Chat */}
            <div className="p-4 md:p-6 bg-white dark:bg-emerald-950 border-b border-emerald-100 dark:border-emerald-900 flex items-center gap-4 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileList(true)}
                className="md:hidden rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center shrink-0">
                <User className="text-emerald-700 dark:text-emerald-300 h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm md:text-base truncate">
                  {activeChat.subject ||
                    activeChat.categories?.name ||
                    "Konsultasi Umum"}
                </h3>
                <p className="text-[10px] text-muted-foreground italic truncate">
                  Kategori: {activeChat.categories?.name || "Umum"}
                </p>
              </div>
            </div>

            {/* Area Chat Scrollable */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8 custom-scrollbar min-w-0">
              {/* Pesan User (Anda) */}
              <div className="flex flex-col items-end gap-1 ml-auto max-w-[90%] md:max-w-[80%] min-w-0">
                <div className="bg-emerald-700 text-white p-4 md:p-5 rounded-[2rem] rounded-tr-none text-sm shadow-md leading-relaxed w-full overflow-hidden break-words">
                  <p className="whitespace-pre-wrap break-words">
                    {activeChat.message}
                  </p>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase px-2">
                  Pertanyaan Anda
                </span>
              </div>

              {/* Jawaban Asatidz */}
              <div className="flex flex-col items-start gap-3 max-w-[95%] md:max-w-[85%] animate-in fade-in slide-in-from-left-4 duration-500 min-w-0">
                <div className="flex items-center gap-2.5 ml-1">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-emerald-900 shrink-0">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white dark:border-emerald-950 rounded-full"></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest leading-none">
                      Asatidz Ikadi
                    </span>
                    <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">
                      Official Consultant
                    </span>
                  </div>
                </div>

                {/* Bubble Jawaban */}
                <div className="bg-white dark:bg-emerald-900/40 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] rounded-tl-none shadow-xl border border-emerald-100/50 dark:border-emerald-800/50 w-full min-w-0 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 dark:bg-emerald-800/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>

                  {activeChat.status === "pending" ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500/40" />
                      <p className="text-[11px] text-muted-foreground italic">
                        Mohon bersabar, ustadz sedang meninjau pesan Anda...
                      </p>
                    </div>
                  ) : activeChat.reply_message ? (
                    <div className="space-y-5 relative w-full overflow-hidden">
                      <p className="text-[13px] md:text-sm leading-[1.8] text-foreground/90 font-medium whitespace-pre-wrap break-words">
                        {activeChat.reply_message}
                      </p>

                      <div className="pt-4 border-t border-emerald-50 dark:border-emerald-800/60 flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-800/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-700">
                          <BadgeCheck
                            size={12}
                            className="text-amber-500 animate-pulse"
                          />
                          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                            Terverifikasi Syar'i
                          </span>
                        </div>

                        {activeChat.answered_at && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar size={10} className="text-emerald-600" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">
                              {new Date(
                                activeChat.answered_at,
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2 italic text-muted-foreground text-xs font-medium">
                      <Loader2 className="h-3 w-3 animate-spin" /> Ustadz sedang
                      merumuskan jawaban...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Statis */}
            <div className="p-4 md:p-6 bg-white dark:bg-emerald-950 border-t border-emerald-100 dark:border-emerald-900 shrink-0">
              <div className="bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center border border-dashed border-emerald-200 dark:border-emerald-800">
                <p className="text-[10px] md:text-[11px] font-medium text-emerald-800 dark:text-emerald-300 italic">
                  Fitur balasan dinonaktifkan. Silakan ajukan pertanyaan baru
                  untuk konsultasi tambahan.
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="hidden md:flex flex-1 flex-col items-center justify-center opacity-20 text-center p-8">
            <MessageSquare
              size={100}
              strokeWidth={1}
              className="mb-4 text-emerald-600"
            />
            <h3 className="font-black uppercase tracking-widest text-lg">
              Pilih Konsultasi
            </h3>
            <p className="text-sm italic">
              Klik pada riwayat di samping untuk melihat detail jawaban.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalKonsultasi;
