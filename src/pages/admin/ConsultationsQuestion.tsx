import React, { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Search,
  MessageSquare,
  User,
  Send,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Calendar,
  Phone,
  Trash2,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

// --- Interfaces ---
export interface ConsultationCategory {
  id: number;
  name: string;
}

export interface ConsultationTicket {
  id: string;
  name: string | null;
  contact_info: string | null;
  subject: string | null;
  message: string;
  reply_message: string | null;
  status: "pending" | "answered" | "closed" | "trashed";
  created_at: string;
  answered_at: string | null;
  category_id: number | null;
}

type FilterStatus = "all" | "pending" | "answered" | "trashed";

const AdminConsultations: React.FC = () => {
  // --- States ---
  const [tickets, setTickets] = useState<ConsultationTicket[]>([]);
  const [categories, setCategories] = useState<ConsultationCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeChat, setActiveChat] = useState<ConsultationTicket | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all",
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileList, setShowMobileList] = useState<boolean>(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Logic: Load Data ---
  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("consultation_categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data as ConsultationCategory[]);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    const { data, error } = await supabase
      .from("inbox_consultations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTickets(data as ConsultationTicket[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTickets();
    loadCategories();
  }, [loadTickets, loadCategories]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat]);

  // --- Logic: Counters (Powerfull & Dynamic) ---
  const getCountByStatus = (status: FilterStatus): number => {
    return tickets.filter((t) => {
      const matchesStatus =
        status === "all" ? t.status !== "trashed" : t.status === status;
      const matchesCategory =
        selectedCategoryId === "all" || t.category_id === selectedCategoryId;
      return matchesStatus && matchesCategory;
    }).length;
  };

  // --- Logic: Send Reply ---
  const handleSendReply = async (): Promise<void> => {
    if (!activeChat || !replyText.trim()) return;
    setIsSending(true);

    try {
      const { error } = await supabase
        .from("inbox_consultations")
        .update({
          reply_message: replyText,
          status: "answered",
          answered_at: new Date().toISOString(),
        })
        .eq("id", activeChat.id);

      if (error) throw error;

      await loadTickets();
      setActiveChat(null);
      setReplyText("");
      setShowMobileList(true);

      Swal.fire({
        icon: "success",
        title: "Terkirim",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengirim balasan", "error");
    } finally {
      setIsSending(false);
    }
  };

  // --- Filtering & Searching ---
  const filteredTickets = tickets.filter((t) => {
    const search = searchQuery.toLowerCase();

    // Gunakan optional chaining dan fallback string kosong
    const matchesSearch =
      (t.name?.toLowerCase() || "").includes(search) ||
      (t.contact_info?.toLowerCase() || "").includes(search) ||
      (t.subject?.toLowerCase() || "").includes(search) ||
      (t.message?.toLowerCase() || "").includes(search) ||
      (t.reply_message?.toLowerCase() || "").includes(search);

    const matchesStatus =
      filter === "all" ? t.status !== "trashed" : t.status === filter;
    const matchesCategory =
      selectedCategoryId === "all" || t.category_id === selectedCategoryId;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleMoveToTrash = async (id: string) => {
    try {
      const { error } = await supabase
        .from("inbox_consultations")
        .update({ status: "trashed" })
        .eq("id", id);

      if (error) throw error;

      await loadTickets();
      if (activeChat?.id === id) setActiveChat(null);

      Swal.fire({
        icon: "info",
        title: "Dipindahkan ke Sampah",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      Swal.fire("Error", "Gagal membuang pertanyaan", "error");
    }
  };

  const handleRestore = async (id: string, replyMessage: string | null) => {
    try {
      // Jika sudah ada reply, kembalikan ke 'answered', jika belum ke 'pending'
      const targetStatus = replyMessage ? "answered" : "pending";

      const { error } = await supabase
        .from("inbox_consultations")
        .update({ status: targetStatus })
        .eq("id", id);

      if (error) throw error;

      await loadTickets();
      if (activeChat?.id === id) setActiveChat(null);

      Swal.fire({
        icon: "success",
        title: "Berhasil Dikembalikan",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      Swal.fire("Error", "Gagal mengembalikan pertanyaan", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-160px)]">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              Inbox Konsultasi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Management Portal untuk Pertanyaan & Konsultasi Asatidz kepada
              Ikadi Jatim.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Custom Category Dropdown */}
            <div className="relative group w-full sm:w-auto sm:min-w-[160px]">
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategoryId(val === "all" ? "all" : Number(val));
                }}
                className="w-full h-11 pl-4 pr-10 rounded-2xl border border-emerald-100 dark:border-emerald-900 bg-card text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 pointer-events-none" />
            </div>

            {/* Status Filter with Dynamic Counts */}
            <div className="flex bg-muted/40 dark:bg-emerald-950/20 p-1.5 rounded-[1.25rem] border border-emerald-100/50 dark:border-emerald-900/30 overflow-x-auto no-scrollbar backdrop-blur-sm">
              {(
                ["all", "pending", "answered", "trashed"] as FilterStatus[]
              ).map((s) => {
                const isActive = filter === s;
                const dynamicCount = getCountByStatus(s);

                return (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`relative flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                    }`}
                  >
                    <span>
                      {s === "all"
                        ? "Semua"
                        : s === "pending"
                          ? "Perlu Dijawab"
                          : s === "answered"
                            ? "Selesai"
                            : "Sampah"}
                    </span>
                    <span
                      className={`flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-md text-[9px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-muted dark:bg-emerald-900/50 text-muted-foreground"
                      }`}
                    >
                      {dynamicCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex border border-emerald-100 dark:border-emerald-900 rounded-[2rem] bg-card overflow-hidden shadow-2xl relative">
          {/* Sidebar List */}
          <div
            className={`w-full lg:w-[400px] border-r border-emerald-50 dark:border-emerald-900 flex flex-col bg-muted/5 transition-all ${!showMobileList ? "hidden lg:flex" : "flex"}`}
          >
            <div className="p-4 border-b border-emerald-50 dark:border-emerald-900 bg-card/50 backdrop-blur-md sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Cari Pertanyaan..."
                  className="w-full pl-11 pr-4 py-3 text-sm bg-muted/50 dark:bg-emerald-900/10 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading && tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Loader2 className="animate-spin text-emerald-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Memuat Data...
                  </span>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-10 opacity-40 italic text-sm text-foreground">
                  Tidak ada pertanyaan.
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => {
                      setActiveChat(ticket);
                      setShowMobileList(false);
                      setReplyText(ticket.reply_message || "");
                    }}
                    className={`w-full text-left p-4 rounded-3xl transition-all border flex flex-col gap-3 relative group ${
                      activeChat?.id === ticket.id
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-card border-emerald-50 dark:border-emerald-900/50 hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            activeChat?.id === ticket.id
                              ? "bg-emerald-500"
                              : ticket.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {ticket.status === "pending" ? "Menunggu" : "Selesai"}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            activeChat?.id === ticket.id
                              ? "bg-white/20 border-white/30"
                              : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          {ticket.subject || "Umum"}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium opacity-70 whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 pr-8">
                      <h4 className="font-bold text-sm truncate">
                        {ticket.name || "Hamba Allah"}
                      </h4>
                      <p
                        className={`text-xs line-clamp-1 italic transition-colors ${
                          activeChat?.id === ticket.id
                            ? "text-white/90"
                            : "text-muted-foreground opacity-80"
                        }`}
                      >
                        "{ticket.message}"
                      </p>
                    </div>

                    {ticket.status === "trashed" ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(ticket.id, ticket.reply_message);
                        }}
                        className={`absolute bottom-4 right-4 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${
                          activeChat?.id === ticket.id
                            ? "text-emerald-200 hover:text-white"
                            : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                        title="Kembalikan dari sampah"
                      >
                        <RotateCcw size={14} />
                      </div>
                    ) : (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveToTrash(ticket.id);
                        }}
                        className={`absolute bottom-4 right-4 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${
                          activeChat?.id === ticket.id
                            ? "text-emerald-200 hover:text-white"
                            : "text-muted-foreground hover:text-red-500"
                        }`}
                      >
                        <Trash2 size={14} />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Viewport */}
          <div
            className={`flex-1 flex flex-col bg-[#fcfdfc] dark:bg-[#080f0c] transition-all min-w-0 ${showMobileList ? "hidden lg:flex" : "flex"}`}
          >
            {activeChat ? (
              <>
                <div className="p-4 lg:p-6 bg-card border-b border-emerald-50 dark:border-emerald-900 flex items-center gap-4 sticky top-0 z-20 backdrop-blur-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileList(true)}
                    className="lg:hidden rounded-full shrink-0"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shadow-inner shrink-0">
                    <User className="text-emerald-700 dark:text-emerald-400 h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-foreground leading-tight truncate">
                        {activeChat.name || "Hamba Allah"}
                      </h3>
                      <span className="text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-lg border">
                        {activeChat.subject || "Umum"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-muted-foreground text-[10px]">
                      <span className="flex items-center gap-1 font-bold italic truncate">
                        <Phone size={10} /> {activeChat.contact_info}
                      </span>
                      <span className="flex items-center gap-1 border-l pl-3 shrink-0 font-bold">
                        <Calendar size={10} />{" "}
                        {new Date(activeChat.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-8 custom-scrollbar"
                >
                  <div className="flex flex-col items-start gap-2 max-w-[90%] lg:max-w-[75%]">
                    <div className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 p-5 rounded-[2rem] rounded-tl-none shadow-sm text-sm text-foreground leading-[1.6] w-full">
                      <span className="block text-[9px] font-black text-emerald-600 mb-2 uppercase tracking-widest italic">
                        Pertanyaan Masuk:
                      </span>
                      <p className="whitespace-pre-wrap break-words">
                        {activeChat.message}
                      </p>
                    </div>
                  </div>

                  {activeChat.reply_message && (
                    <div className="flex flex-col items-end gap-2 ml-auto max-w-[90%] lg:max-w-[75%] animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-emerald-700 dark:bg-emerald-600 text-white p-5 rounded-[2rem] rounded-tr-none shadow-xl text-sm leading-[1.6] w-full">
                        <span className="block text-[9px] font-black text-emerald-200 mb-2 uppercase tracking-widest text-right italic">
                          Jawaban Anda:
                        </span>
                        <p className="whitespace-pre-wrap break-words">
                          {activeChat.reply_message}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase mr-2">
                        ✓ Terjawab{" "}
                        {activeChat.answered_at
                          ? new Date(activeChat.answered_at).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" },
                            )
                          : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 lg:p-6 bg-card border-t border-emerald-50 dark:border-emerald-900">
                  {/* Container Input: max-w-4xl diubah menjadi max-w-full */}
                  <div className="max-w-full mx-auto bg-muted/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 rounded-[2rem] p-3 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300">
                    <textarea
                      disabled={activeChat.status === "trashed"}
                      value={replyText} // Pastikan menggunakan value agar reaktif
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={
                        activeChat.status === "trashed"
                          ? "Kembalikan pesan ini untuk membalas..."
                          : "Ketik jawaban syar'i..."
                      }
                      className={`w-full bg-transparent p-3 outline-none min-h-[100px] resize-none text-sm leading-relaxed ${
                        activeChat.status === "trashed"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                    <div className="flex justify-between items-center p-2 border-t border-emerald-100/50 mt-2 gap-4">
                      <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                        <CheckCircle2 size={12} /> Terverifikasi Ikadi
                      </div>
                      <Button
                        onClick={handleSendReply}
                        disabled={isSending || !replyText.trim()}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl px-8 h-12 shadow-lg transition-all active:scale-95"
                      >
                        {isSending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Send size={16} className="mr-2" /> Kirim
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 p-12 text-center">
                <MessageSquare
                  size={80}
                  strokeWidth={1}
                  className="mb-4 text-emerald-600 animate-pulse"
                />
                <h3 className="text-xl font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-100">
                  Pilih Konsultasi
                </h3>
                <p className="text-sm italic mt-2 text-foreground">
                  Menunggu asatidz untuk meninjau pertanyaan...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminConsultations;
