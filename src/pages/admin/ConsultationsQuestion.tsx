import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PostgrestError } from "@supabase/postgrest-js";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Search,
  Send,
  Loader2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  Inbox,
  Clock,
  CheckCircle,
  Tag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { Virtuoso } from "react-virtuoso";
import VoiceRecorder from "@/components/VoiceRecorder";
import CustomAudioPlayer from "@/components/ui/CustomAudioPlayer";

// ======================================================
// TYPES
// ======================================================

type TicketStatus = "pending" | "answered" | "closed" | "trashed";

// Tambahan Interface Kategori
interface ConsultationCategory {
  id: number;
  name: string;
}
interface ConsultationTicket {
  id: string;
  name: string | null;
  city: string | null;
  contact_info: string | null;
  subject: string | null;
  message: string;
  reply_message: string | null;
  reply_audio_url?: string | null;
  status: TicketStatus;
  created_at: string;
  answered_at: string | null;
  answered_by: string | null;
  category_id: number | null;
  admins?: { name: string }[] | null;
}

interface ConsultationRow {
  id: number;
  answer: string | null;
  reply_audio_url: string | null;
  slug: string;
}

interface UpsertPayload {
  id?: number; // Primary Key (jika ada)
  inbox_id: string;
  author_name: string;
  city: string;
  title: string;
  slug: string;
  question: string;
  answer: string;
  reply_audio_url: string | null;
  category_id: number | null;
  status: number;
  answered_at: string;
  answered_by: string;
  created_at: string;
}
interface CounterState {
  all: number;
  pending: number;
  answered: number;
  trashed: number;
}

// ======================================================
// CONSTANTS
// ======================================================

const PAGE_SIZE = 50;

// ======================================================
// COMPONENT
// ======================================================

const AdminConsultations = () => {
  // ======================================================
  // STATES & REFS
  // ======================================================
  const [categories, setCategories] = useState<ConsultationCategory[]>([]);
  const [filterCategory, setFilterCategory] = useState<number | "all">("all");
  const [tickets, setTickets] = useState<ConsultationTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [counters, setCounters] = useState<CounterState>({
    all: 0,
    pending: 0,
    answered: 0,
    trashed: 0,
  });

  // Menggunakan useRef untuk pagination agar tidak memicu re-render tak perlu
  // dan memperbaiki masalah dependensi pada useEffect
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Helper pembuat Slug (Pastikan ini ada di komponen Anda)
  const createUniqueSlug = (text: string) => {
    const baseSlug = text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
      .substring(0, 50);
    return `${baseSlug}-${Date.now()}`;
  };

  // ======================================================
  // LOAD CATEGORIES
  // ======================================================

  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("consultation_categories")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, []);

  // ======================================================
  // ACTIVE CHAT
  // ======================================================

  const activeChat = useMemo(() => {
    return tickets.find((x) => x.id === activeId) || null;
  }, [tickets, activeId]);

  // ======================================================
  // TRANSCRIBE FUNCTION
  // ======================================================

  const handleTranscribe = async () => {
    if (!audioUrl) return;

    setIsTranscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke("transcribe-vn", {
        body: { audioUrl: audioUrl },
      });

      if (error) throw error;

      // Append teks hasil transkripsi ke textarea
      const transcription = data.text;
      setReplyText((prev) => {
        const trimmedPrev = prev.trim();
        // Tambahkan spasi/enter jika sebelumnya sudah ada teks
        return trimmedPrev
          ? `${trimmedPrev}\n\n${transcription}`
          : transcription;
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Suara berhasil diubah ke teks.",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      const errorObj = err as { message: string };
      Swal.fire("Gagal Transkripsi", errorObj.message, "error");
    } finally {
      setIsTranscribing(false);
    }
  };

  // ======================================================
  // FETCH COUNTERS
  // ======================================================

  const loadCounters = useCallback(async () => {
    try {
      const [allRes, pendingRes, answeredRes, trashedRes] = await Promise.all([
        supabase
          .from("inbox_consultations")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("inbox_consultations")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("inbox_consultations")
          .select("*", { count: "exact", head: true })
          .eq("status", "answered"),
        supabase
          .from("inbox_consultations")
          .select("*", { count: "exact", head: true })
          .eq("status", "trashed"),
      ]);

      setCounters({
        all: allRes.count || 0,
        pending: pendingRes.count || 0,
        answered: answeredRes.count || 0,
        trashed: trashedRes.count || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ======================================================
  // FETCH TICKETS
  // ======================================================

  const fetchTickets = useCallback(
    async (reset = false) => {
      if (loading) return;

      try {
        setLoading(true);
        const currentPage = reset ? 0 : pageRef.current;

        let query = supabase
          .from("inbox_consultations")
          .select(
            `id, name, city, contact_info, subject, message, reply_message, reply_audio_url, status, created_at, answered_at, answered_by, category_id, admins:answered_by(name)`,
          )
          .order("created_at", { ascending: false })
          .range(
            currentPage * PAGE_SIZE,
            currentPage * PAGE_SIZE + PAGE_SIZE - 1,
          );

        if (filter !== "all") query = query.eq("status", filter);

        // ======================================================
        // APPLY CATEGORY FILTER
        // ======================================================
        if (filterCategory !== "all")
          query = query.eq("category_id", filterCategory);

        if (debouncedSearch.trim()) {
          const keyword = debouncedSearch.trim();
          query = query.or(
            `name.ilike.%${keyword}%,subject.ilike.%${keyword}%,message.ilike.%${keyword}%`,
          );
        }

        const { data, error } = await query;
        if (error) throw error;

        const rows = (data as ConsultationTicket[]) || [];

        if (reset) {
          setTickets(rows);
          pageRef.current = 1;
        } else {
          setTickets((prev) => [...prev, ...rows]);
          pageRef.current = pageRef.current + 1;
        }

        hasMoreRef.current = rows.length === PAGE_SIZE;
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal memuat tiket", "error");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, filterCategory, debouncedSearch],
  );

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadCategories(); // Load categories once
  }, [loadCategories]);

  useEffect(() => {
    fetchTickets(true);
    loadCounters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterCategory, debouncedSearch]);

  // ======================================================
  // REALTIME
  // ======================================================

  useEffect(() => {
    const channel = supabase
      .channel("consultation-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "inbox_consultations" },
        (payload) => {
          const newTicket = payload.new as ConsultationTicket;
          // Hanya tambahkan jika sesuai filter aktif
          if (filter === "all" || newTicket.status === filter) {
            setTickets((prev) => [newTicket, ...prev]);
          }
          loadCounters();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCounters, filter, filterCategory]);

  // ======================================================
  // ACTIONS
  // ======================================================

  const sendReply = async (): Promise<void> => {
    if (!activeChat) return;

    const trimmedText = replyText.trim();
    // Validasi: Harus ada salah satu (Teks atau Audio)
    if (!trimmedText && !audioUrl) {
      Swal.fire(
        "Peringatan",
        "Berikan jawaban teks atau rekaman suara",
        "warning",
      );
      return;
    }

    setSending(true);
    const now = new Date().toISOString();

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error("Sesi login habis.");
      const adminId = authData.user.id;

      // 🚀 1. CEK DATA LAMA (Agar Teks & Audio bisa digabung)
      const { data: existingRecord, error: existingError } =
        await supabase
          .from("consultations")
          .select("id, answer, reply_audio_url, slug")
          .eq("inbox_id", activeChat.id)
          .maybeSingle();
      
      if (existingError) throw existingError;

      // 🚀 2. TENTUKAN ISI JAWABAN (Merging Logic)
      // Jika kirim teks baru, pakai teks itu. Jika tidak, pakai yang lama dari DB.
      const finalAnswer =
        trimmedText ||
        existingRecord?.answer ||
        "Jawaban dikirim melalui rekaman suara.";
      const finalAudio = audioUrl || existingRecord?.reply_audio_url || null;

      // 🚀 3. SIAPKAN PAYLOAD UNTUK TABEL PUBLIK
      const publicPayload: UpsertPayload = {
        inbox_id: activeChat.id,
        author_name: activeChat.name ?? "Hamba Allah",
        city: activeChat.city ?? "Tidak disebutkan",
        title: activeChat.subject ?? "Konsultasi Agama",
        slug:
          existingRecord?.slug ||
          createUniqueSlug(activeChat.subject || "konsultasi"),
        question: activeChat.message,
        category_id: activeChat.category_id,
        status: 1,
        answered_at: now,
        answered_by: adminId,
        created_at: activeChat.created_at || now,
        answer: finalAnswer,
        reply_audio_url: finalAudio,
      };

      // JIKA ID DITEMUKAN, MAKA PAKSA UPDATE KE ID TERSEBUT
      if (existingRecord?.id) {
        publicPayload.id = existingRecord.id;
      }

      // 🚀 4. EKSEKUSI DUAL-UPDATE
      // Update Inbox (Internal)
      const { error: errInbox } = await supabase
        .from("inbox_consultations")
        .update({
          reply_message: finalAnswer,
          reply_audio_url: finalAudio,
          status: "answered",
          answered_at: now,
          answered_by: adminId,
        })
        .eq("id", activeChat.id);

      if (errInbox) throw errInbox;

      // Upsert ke Consultations (Publik)
      const { error: errPublic } = await supabase
        .from("consultations")
        .upsert(publicPayload, {
          onConflict: "id",
      });

      if (errPublic) throw errPublic;

      // 🚀 5. UPDATE UI STATE
      setTickets((prev: ConsultationTicket[]) =>
        prev.map((t) =>
          t.id === activeChat.id
            ? {
                ...t,
                status: "answered",
                reply_message: finalAnswer,
                reply_audio_url: finalAudio,
                answered_at: now,
              }
            : t,
        ),
      );

      // Reset Input
      setReplyText("");
      setAudioUrl(null);
      setIsRecording(false);

      Swal.fire({
        title: "Berhasil!",
        text: "Jawaban berhasil dipublikasikan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Gagal menyimpan data";
      console.error("Detail Error:", error);
      Swal.fire("Gagal", errorMsg, "error");
    } finally {
      setSending(false);
    }
  };

  const moveToTrash = async (id: string) => {
    try {
      const { error } = await supabase
        .from("inbox_consultations")
        .update({ status: "trashed" })
        .eq("id", id);
      if (error) throw error;
      setTickets((prev) => prev.filter((x) => x.id !== id));
      loadCounters();
    } catch (err) {
      console.error(err);
    }
  };

  const restoreTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from("inbox_consultations")
        .update({ status: "pending" })
        .eq("id", id);
      if (error) throw error;
      fetchTickets(true);
      loadCounters();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <AdminLayout>
      <div className="flex flex-col h-[150dvh] lg:h-[calc(100vh-110px)]">
        {/* 1. HEADER & STATS (Scrollable) */}
        <div className="flex flex-col gap-4 mb-3">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-emerald-950 dark:text-emerald-50">
                Inbox Consultation
              </h1>
              <p className="text-emerald-600/80 dark:text-emerald-400/80 text-sm font-medium">
                Realtime Consultation Dashboard
              </p>
            </div>
            {loading && (
              <Loader2
                className="animate-spin text-emerald-600 mb-2"
                size={20}
              />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              title="All"
              value={counters.all}
              loading={statsLoading}
              icon={<Inbox size={18} />}
              color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
            />
            <StatCard
              title="Pending"
              value={counters.pending}
              loading={statsLoading}
              icon={<Clock size={18} />}
              color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
            />
            <StatCard
              title="Answered"
              value={counters.answered}
              loading={statsLoading}
              icon={<CheckCircle size={18} />}
              color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
            />
            <StatCard
              title="Trash"
              value={counters.trashed}
              loading={statsLoading}
              icon={<Trash2 size={18} />}
              color="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200"
            />
          </div>
        </div>

        {/* 2. SEARCH & FILTER (Sticky on Mobile) */}
        <div className="sticky top-0 z-30 backdrop-blur-md -mx-4 px-4 py-3 border-emerald-100 dark:border-emerald-800 lg:relative lg:top-auto lg:mx-0 lg:px-0 lg:py-4 lg:border-none lg:bg-transparent lg:backdrop-blur-none mb-2 transition-all">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full">
            {/* Group 1: Search & Category (Baris pertama di Mobile, Samping-sampingan di Desktop) */}
            <div className="flex items-center gap-2 w-full lg:w-auto flex-1 lg:max-w-xl">
              {/* Search Input - Mengambil sisa ruang (flex-1) */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50 dark:text-emerald-400/40"
                  size={16}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari jamaah..."
                  className="h-10 pl-10 pr-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-900/40 w-full focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm"
                />
              </div>

              {/* Category Dropdown - Tetap di samping search */}
              <div className="relative shrink-0">
                <Tag
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400"
                  size={12}
                />
                <select
                  value={filterCategory}
                  onChange={(e) =>
                    setFilterCategory(
                      e.target.value === "all" ? "all" : Number(e.target.value),
                    )
                  }
                  className="h-10 pl-8 pr-8 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-[10px] font-black text-emerald-700 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer shadow-sm uppercase tracking-tight"
                >
                  <option value="all">KATEGORI</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
                {/* Panah custom untuk select agar lebih rapi */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Group 2: Status Slider (Baris kedua di Mobile) */}
            <div className="w-full lg:w-auto overflow-hidden">
              <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1 bg-emerald-100/30 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 scroll-smooth">
                {(["all", "pending", "answered", "trashed"] as const).map(
                  (x) => {
                    const countValue = x === "all" ? counters.all : counters[x];

                    return (
                      <Button
                        key={x}
                        variant={filter === x ? "default" : "ghost"}
                        onClick={() => setFilter(x)}
                        className={`shrink-0 rounded-lg capitalize px-3 py-1 h-8 flex items-center gap-1.5 transition-all ${
                          filter === x
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            : "text-emerald-700 dark:text-emerald-300 hover:bg-white dark:hover:bg-emerald-800/50 text-[10px]"
                        }`}
                      >
                        <span className="font-black text-[10px] tracking-tight">
                          {x.toUpperCase()}
                        </span>

                        <span
                          className={`text-[9px] min-w-[18px] h-4 flex items-center justify-center px-1 rounded font-black ${
                            filter === x
                              ? "bg-white/20 text-white"
                              : "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200"
                          }`}
                        >
                          {countValue}
                        </span>
                      </Button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BOX: Container Utama dengan Glassmorphism & Depth */}
        <div className="flex-1 flex overflow-hidden mt-3 lg:mt-2 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl bg-white/80 dark:bg-emerald-950/40 backdrop-blur-xl shadow-xl shadow-emerald-900/5">
          {/* SIDEBAR: List Konsultasi */}
          <aside
            className={`${
              showSidebar ? "flex" : "hidden lg:flex"
            } w-full lg:w-[380px] xl:w-[420px] border-r border-emerald-100 dark:border-emerald-800/50 flex-col bg-emerald-50/20 dark:bg-emerald-950/20 transition-all duration-300`}
          >
            {/* SIDEBAR HEADER: Ringkas & Informatif */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-emerald-100 dark:border-emerald-800/50 flex items-center gap-3 bg-white/90 dark:bg-emerald-950/90 backdrop-blur-xl sticky top-0 z-20 shrink-0 shadow-sm shadow-emerald-900/5">
              {/* Ikon Box: Dibuat responsif h-10 ke h-12 agar sama dengan Chat View */}
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none shrink-0 rotate-3 transition-all duration-300">
                <Inbox
                  size={20}
                  className="sm:w-[22px] sm:h-[22px]"
                  strokeWidth={2.5}
                />
              </div>

              <div className="min-w-0 flex-1">
                {/* Judul: Font-size & leading disamakan (text-base ke text-lg) */}
                <h2 className="font-extrabold text-emerald-950 dark:text-emerald-50 truncate text-base sm:text-lg leading-tight">
                  Daftar Konsultasi
                </h2>

                {/* Subtitle: Tracking & Size disamakan */}
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] sm:text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-black uppercase tracking-widest truncate">
                    {filter} • {tickets.length} Pesan
                  </p>
                </div>
              </div>
            </div>

            <Virtuoso
              data={tickets}
              className="custom-scrollbar"
              endReached={() => {
                if (!loading && hasMoreRef.current) fetchTickets();
              }}
              itemContent={(_index, ticket) => (
                <TicketCard
                  ticket={ticket}
                  active={activeId === ticket.id}
                  onClick={() => {
                    setActiveId(ticket.id);
                    setShowSidebar(false);
                    setReplyText(ticket.reply_message || "");
                  }}
                  onTrash={() => moveToTrash(ticket.id)}
                  onRestore={() => restoreTicket(ticket.id)}
                />
              )}
            />
          </aside>

          {/* CHAT VIEW: Area Utama */}
          <main
            className={`${
              showSidebar ? "hidden lg:flex" : "flex"
            } flex-1 flex-col h-full bg-white dark:bg-emerald-950/30 relative`}
          >
            {activeChat ? (
              <>
                {/* CHAT HEADER: Profile Style */}
                <header className="px-4 py-3 sm:px-6 sm:py-4 border-b border-emerald-100 dark:border-emerald-800/50 flex items-center gap-4 bg-white/90 dark:bg-emerald-950/90 backdrop-blur-xl sticky top-0 z-20 shadow-sm shadow-emerald-900/5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="lg:hidden text-emerald-600 hover:bg-emerald-50 -ml-2 shrink-0"
                    onClick={() => setShowSidebar(true)}
                  >
                    <ChevronLeft size={24} />
                  </Button>

                  <div className="relative shrink-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-md font-bold text-lg">
                      {activeChat.name?.charAt(0) || "H"}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-emerald-950 rounded-full" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-black text-emerald-950 dark:text-emerald-50 truncate text-base sm:text-lg leading-none mb-1">
                      {activeChat.name || "Hamba Allah"}
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-emerald-600/70 dark:text-emerald-400/70 truncate font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="px-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-md text-emerald-700 dark:text-emerald-300">
                        {activeChat.city || "Indonesia"}
                      </span>
                      <span className="opacity-30">•</span>
                      <span className="truncate">{activeChat.subject}</span>
                    </p>
                  </div>
                </header>

                {/* CHAT AREA: Feed History */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 space-y-8 bg-[radial-gradient(#10b98110_1px,transparent_1px)] [background-size:20px_20px] custom-scrollbar scroll-smooth"
                >
                  {/* User Bubble: Classic Sophisticated */}
                  <div className="flex flex-col gap-2 max-w-[95%] sm:max-w-[85%] group animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="bg-white dark:bg-emerald-900/20 text-emerald-950 dark:text-emerald-50 rounded-2xl rounded-tl-none p-5 sm:p-6 border border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all">
                      <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed antialiased font-medium">
                        {activeChat.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Clock size={10} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        Ditanyakan •{" "}
                        {new Date(activeChat.created_at).toLocaleString(
                          "id-ID",
                          { dateStyle: "medium", timeStyle: "short" },
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Admin Bubble: Premium Full-Width Style */}
                  {(activeChat.reply_message || activeChat.reply_audio_url) && (
                    <div className="flex flex-col gap-3 items-end w-full animate-in fade-in slide-in-from-right-6 duration-700">
                      <div className="w-full sm:max-w-[85%] lg:max-w-[75%] bg-emerald-600 dark:bg-emerald-700 text-white rounded-3xl rounded-tr-none p-5 sm:p-7 shadow-xl shadow-emerald-900/10 border border-emerald-500/30 relative overflow-hidden">
                        {/* Visual Accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                        {/* Audio Player Section: Powerfull UI Revamp */}
                        {activeChat.reply_audio_url && (
                          <div className="mb-5 w-full">
                            <CustomAudioPlayer
                              src={activeChat.reply_audio_url}
                            />
                          </div>
                        )}

                        {activeChat.reply_message && (
                          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium drop-shadow-sm">
                            {activeChat.reply_message}
                          </p>
                        )}

                        {/* Admin Verification Footer */}
                        <footer className="mt-5 pt-4 border-t border-emerald-500/30 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-white text-emerald-600 p-1 rounded-full shadow-sm">
                              <CheckCircle2 size={12} strokeWidth={3} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-100">
                              Verified by{" "}
                              {activeChat.admins?.[0]?.name ||
                                "Tim Konsultan Syariah"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-200/80 bg-emerald-800/30 px-2 py-1 rounded-md">
                            {activeChat.answered_at
                              ? new Date(
                                  activeChat.answered_at,
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Baru saja"}
                          </span>
                        </footer>
                      </div>
                    </div>
                  )}
                </div>

                {/* INPUT AREA: Ultra-Slim Fixed Width for iPhone XR Alignment */}
                <footer className="p-2 sm:p-6 border-t border-emerald-100 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/80 flex items-end">
                  <div
                    className="
              /* Lebar Adaptif Asimetris */
              w-[320px]
              min-[360px]:w-[304px] /* Sesuaikan dengan lebar layar iPhone XR untuk pengalaman mengetik optimal */
              min-[375px]:w-[319px] /* Sesuaikan dengan lebar layar iPhone XR untuk pengalaman mengetik optimal */
              min-[390px]:w-[333px] /* Sedikit lebih lebar untuk layar yang lebih besar, tetap mempertahankan margin kiri yang rapat */
              min-[412px]:w-[355px] /* Untuk layar yang lebih besar lagi, memberikan sedikit ekstra ruang tanpa membuatnya terlalu lebar */
              min-[414px]:w-[357px] /* Untuk layar yang lebih besar lagi, memberikan sedikit ekstra ruang tanpa membuatnya terlalu lebar */
              min-[430px]:w-[373px] /* Pada layar yang sangat lebar, tetap memberikan batas maksimal agar tidak terlalu melebar */
              sm:w-full sm:max-w-full
              
              /* Margin kiri tetap merapat (Asimetris) */
              ml-1 mr-auto sm:mx-auto

              border border-emerald-200 dark:border-emerald-800 
              rounded-[1rem] p-2 sm:p-4 
              focus-within:ring-4 focus-within:ring-emerald-500/10 
              transition-all duration-500
              bg-emerald-50/20 dark:bg-emerald-900/10 backdrop-blur-sm
              shadow-sm focus-within:shadow-md
            "
                  >
                    <textarea
                      value={replyText}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setReplyText(e.target.value)
                      }
                      placeholder="Tulis jawaban bijak Anda..."
                      className="w-full bg-transparent outline-none resize-none min-h-[100px] max-h-[250px] overflow-y-auto text-sm sm:text-base text-emerald-950 dark:text-emerald-50 px-2 placeholder:text-muted-foreground leading-relaxed font-medium"
                    />

                    <div className="flex items-center gap-2 mt-2 border-t border-emerald-100 dark:border-emerald-800/30 pt-3 sm:pt-4">
                      {/* Tombol Transkripsi di dalam footer */}
                      <div className="flex-1 flex items-center min-w-0 gap-2">
                        <VoiceRecorder
                          ticketId={activeChat.id}
                          onUploadComplete={(url: string) => setAudioUrl(url)}
                          onClear={() => setAudioUrl(null)}
                          onRecordingStateChange={(state: boolean) =>
                            setIsRecording(state)
                          }
                        />

                        {/* Tombol Transkripsi: Muncul jika ada VN yang siap */}
                        {audioUrl && !isRecording && (
                          <button
                            type="button"
                            onClick={handleTranscribe}
                            disabled={isTranscribing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-500/20 transition-all animate-in zoom-in duration-300 disabled:opacity-50"
                          >
                            {isTranscribing ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Sparkles size={14} className="fill-current" />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-tighter">
                              {isTranscribing
                                ? "Processing..."
                                : "AI Transcribe"}
                            </span>
                          </button>
                        )}

                        {/* Status Indicator */}
                        {!isRecording && !audioUrl && (
                          <div className="hidden min-[420px]:flex items-center gap-2 text-emerald-600/40 font-black text-[10px] uppercase tracking-widest ml-1 truncate">
                            <CheckCircle
                              size={14}
                              className="shrink-0 animate-pulse"
                            />
                            <span className="truncate">Ready to Response</span>
                          </div>
                        )}
                      </div>

                      {!isRecording && (
                        <Button
                          disabled={sending || (!replyText.trim() && !audioUrl)}
                          onClick={sendReply}
                          className="rounded-2xl px-5 sm:px-8 bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/20 active:scale-90 transition-all h-10 sm:h-12 gap-2"
                        >
                          {sending ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <>
                              <span className="hidden sm:inline font-bold">
                                Kirim Balasan
                              </span>
                              <Send size={18} strokeWidth={2.5} />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </footer>
              </>
            ) : (
              /* EMPTY STATE: Minimalist & Artistic */
              <div className="flex-1 flex items-center justify-center flex-col text-center p-10 bg-[radial-gradient(#10b98108_1.5px,transparent_1.5px)] [background-size:30px_30px]">
                <div className="relative group">
                  <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="bg-white dark:bg-emerald-900/20 p-12 rounded-[3.5rem] text-emerald-100 dark:text-emerald-800/40 relative border border-emerald-50 dark:border-emerald-900/20 shadow-inner">
                    <Inbox size={120} strokeWidth={0.5} />
                  </div>
                </div>
                <div className="mt-8 space-y-2">
                  <h3 className="text-emerald-950 dark:text-emerald-50 font-black text-2xl tracking-tighter">
                    No Consultation Selected
                  </h3>
                  <p className="text-emerald-600/40 dark:text-emerald-400/40 text-sm max-w-[280px] leading-relaxed font-medium">
                    Pilih tiket konsultasi dari daftar di samping untuk
                    memberikan bimbingan.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminLayout>
  );
};

// ======================================================
// STAT CARD
// ======================================================

const StatCard = ({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
}) => {
  return (
    <div className="group relative border rounded-[1.5rem] p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md bg-white dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800">
      {/* Baris Atas */}
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 opacity-80">
          {title}
        </p>
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
          {icon}
        </div>
      </div>

      {/* Baris Angka */}
      <div className="flex items-baseline gap-1">
        <h3 className="text-3xl font-black text-emerald-950 dark:text-emerald-50 leading-none">
          {loading ? (
            <span className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-bounce [animation-delay:0.4s]" />
            </span>
          ) : (
            value.toLocaleString("id-ID")
          )}
        </h3>
        {!loading && (
          <span className="text-[10px] font-bold text-emerald-500/50 ml-2 uppercase tracking-tight">
            DATA
          </span>
        )}
      </div>
    </div>
  );
};

// ======================================================
// TICKET CARD
// ======================================================

const TicketCard = ({
  ticket,
  active,
  onClick,
  onTrash,
  onRestore,
}: {
  ticket: ConsultationTicket;
  active: boolean;
  onClick: () => void;
  onTrash: () => void;
  onRestore: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-emerald-50 dark:border-emerald-800 cursor-pointer transition-all relative group ${
        active
          ? "bg-emerald-50/80 dark:bg-emerald-900/40 border-l-4 border-l-emerald-500"
          : "hover:bg-emerald-50/30"
      }`}
    >
      <div className="relative p-3 border-b border-emerald-100/50 dark:border-emerald-800/30 cursor-pointer hover:bg-emerald-500/[0.03] transition-colors group">
        {/* Baris Atas: Nama & Waktu */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${
                ticket.status === "pending"
                  ? "bg-amber-500"
                  : ticket.status === "answered"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
              }`}
            />
            <h2 className="font-bold text-md truncate text-emerald-950 dark:text-emerald-50">
              {ticket.name || "Hamba Allah"}
            </h2>
          </div>

          {/* Waktu Pojok Kanan Atas - Sangat Ringkas */}
          <span className="text-[11px] font-bold uppercase whitespace-nowrap shrink-0 mt-0.5 tracking-tighter">
            {new Date(ticket.created_at).toLocaleString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        {/* Baris Tengah: Subject */}
        <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 truncate uppercase tracking-tight">
          {ticket.subject}
        </p>

        {/* Baris Bawah: Isi Pesan (Dipotong 1 baris agar lebih clean) */}
        <div className="pr-8">
          <p className="text-[12px] line-clamp-1 text-muted-foreground/80 leading-snug">
            {ticket.message}
          </p>
        </div>

        {/* Tombol Action: Pojok Kanan Bawah */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {ticket.status === "trashed" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore();
              }}
              className="p-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 border border-blue-100 transition-colors"
            >
              <RotateCcw size={12} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrash();
              }}
              className="p-1 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 border border-rose-100 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminConsultations;
