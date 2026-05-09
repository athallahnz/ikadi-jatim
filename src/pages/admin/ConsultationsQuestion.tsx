import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Search,
  Send,
  User,
  Loader2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  Inbox,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { Virtuoso } from "react-virtuoso";

// ======================================================
// TYPES
// ======================================================

type TicketStatus = "pending" | "answered" | "closed" | "trashed";

interface ConsultationTicket {
  id: string;
  name: string | null;
  city: string | null;
  contact_info: string | null;
  subject: string | null;
  message: string;
  reply_message: string | null;
  status: TicketStatus;
  created_at: string;
  answered_at: string | null;
  answered_by: string | null;
  category_id: number | null;
  admins?: { name: string }[] | null;
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

  const [tickets, setTickets] = useState<ConsultationTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
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

  // ======================================================
  // ACTIVE CHAT
  // ======================================================

  const activeChat = useMemo(() => {
    return tickets.find((x) => x.id === activeId) || null;
  }, [tickets, activeId]);

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
            `id, name, city, contact_info, subject, message, reply_message, status, created_at, answered_at, answered_by, category_id, admins:answered_by(name)`,
          )
          .order("created_at", { ascending: false })
          .range(
            currentPage * PAGE_SIZE,
            currentPage * PAGE_SIZE + PAGE_SIZE - 1,
          );

        if (filter !== "all") query = query.eq("status", filter);

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
    [filter, debouncedSearch],
  );

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchTickets(true);
    loadCounters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, debouncedSearch]);

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
  }, [loadCounters, filter]);

  // ======================================================
  // ACTIONS
  // ======================================================

  const sendReply = async () => {
    if (!activeChat || !replyText.trim()) return;

    try {
      setSending(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("inbox_consultations")
        .update({
          reply_message: replyText.trim(),
          status: "answered",
          answered_at: now,
          answered_by: user.id,
        })
        .eq("id", activeChat.id);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((t) =>
          t.id === activeChat.id
            ? {
                ...t,
                reply_message: replyText,
                status: "answered",
                answered_at: now,
              }
            : t,
        ),
      );

      setReplyText("");
      loadCounters();
      Swal.fire({
        icon: "success",
        title: "Balasan terkirim",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengirim balasan", "error");
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
      <div className="h-[calc(100vh-120px)] flex flex-col bg-emerald-50/20 dark:bg-emerald-950/10">
        {/* TOPBAR */}
        <div className="flex flex-col gap-4 mb-5">
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
              icon={<Inbox size={18} />}
              color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
            />
            <StatCard
              title="Pending"
              value={counters.pending}
              icon={<Clock size={18} />}
              color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
            />
            <StatCard
              title="Answered"
              value={counters.answered}
              icon={<CheckCircle size={18} />}
              color="bg-emerald-600 text-white dark:bg-emerald-700 dark:text-emerald-50"
            />
            <StatCard
              title="Trash"
              value={counters.trashed}
              icon={<Trash2 size={18} />}
              color="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full p-1">
            {/* Search Input - Luas di mobile, tetap proporsional di desktop */}
            <div className="relative w-full lg:max-w-sm shrink-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50 dark:text-emerald-400/40"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, subject..."
                className="h-11 pl-10 pr-4 rounded-xl border border-emerald-100 dark:border-emerald-800 bg-white dark:bg-emerald-900/20 w-full focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm"
              />
            </div>

            {/* Filter Slider Container */}
            <div className="w-full lg:w-auto overflow-hidden">
              <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 bg-emerald-100/30 dark:bg-emerald-900/20 p-1.5 rounded-2xl border border-emerald-100 dark:border-emerald-800 scroll-smooth">
                {(["all", "pending", "answered", "trashed"] as const).map(
                  (x) => {
                    const countValue = x === "all" ? counters.all : counters[x];

                    return (
                      <Button
                        key={x}
                        variant={filter === x ? "default" : "ghost"}
                        onClick={() => setFilter(x)}
                        className={`shrink-0 rounded-xl capitalize px-4 py-2 h-9 flex items-center gap-2 transition-all border border-transparent ${
                          filter === x
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-none"
                            : "text-emerald-700 dark:text-emerald-300 hover:bg-white dark:hover:bg-emerald-800/50 hover:border-emerald-100 dark:hover:border-emerald-700"
                        }`}
                      >
                        <span className="font-bold text-xs tracking-tight">
                          {x}
                        </span>

                        <span
                          className={`text-[10px] min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-lg font-black ${
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

        {/* MAIN BOX */}
        <div className="flex-1 border border-emerald-100 dark:border-emerald-800 rounded-[1rem] overflow-hidden flex bg-white dark:bg-emerald-950/40 backdrop-blur-sm shadow-sm">
          {/* SIDEBAR */}
          <div
            className={`${showSidebar ? "flex" : "hidden lg:flex"} w-full lg:w-[400px] border-r border-emerald-100 dark:border-emerald-800 flex-col bg-emerald-50/10`}
          >
            <Virtuoso
              data={tickets}
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
          </div>

          {/* CHAT VIEW */}
          <div
            className={`${showSidebar ? "hidden lg:flex" : "flex"} flex-1 flex-col`}
          >
            {activeChat ? (
              <>
                <div className="p-5 border-b border-emerald-100 dark:border-emerald-800 flex items-center gap-4 bg-white/50 dark:bg-emerald-950/50">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="lg:hidden text-emerald-600"
                    onClick={() => setShowSidebar(true)}
                  >
                    <ChevronLeft />
                  </Button>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-inner">
                    <User />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-emerald-950 dark:text-emerald-50 truncate text-lg">
                      {activeChat.name || "Hamba Allah"}
                    </h2>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 truncate font-medium">
                      {activeChat.city ? ` ${activeChat.city}` : ""} -{" "}
                      {activeChat.subject}
                    </p>
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-8 space-y-8 bg-emerald-50/5 dark:bg-emerald-950/10"
                >
                  <div className="max-w-2xl">
                    <div className="bg-emerald-100/50 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-50 rounded-[1rem] rounded-tl-sm p-6 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {activeChat.message}
                      </p>
                      <span className="text-[10px] opacity-40 mt-3 block text-right italic">
                        Dikirim:{" "}
                        {new Date(activeChat.created_at).toLocaleString(
                          "id-ID",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  {activeChat.reply_message && (
                    <div className="max-w-2xl ml-auto">
                      <div className="bg-emerald-600 text-white rounded-[1rem] rounded-tr-sm p-6 shadow-lg shadow-emerald-200 dark:shadow-none">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {activeChat.reply_message}
                        </p>
                        <span className="text-[10px] text-emerald-200 mt-3 block text-right italic">
                          Verified by{" "}
                          {activeChat.admins && activeChat.admins.length > 0
                            ? activeChat.admins[0].name
                            : "Admin IKADI"}{" "}
                          on{" "}
                          {activeChat.answered_at
                            ? new Date(
                                activeChat.answered_at,
                              ).toLocaleDateString("id-ID")
                            : "Unknown Date"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-emerald-100 dark:border-emerald-800 p-6 bg-white dark:bg-emerald-950/50">
                  <div className="border border-emerald-200 dark:border-emerald-800 rounded-[1rem] p-6 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-emerald-50/30 dark:bg-emerald-900/20">
                    <textarea
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Ketik Jawaban disini..."
                      className="w-full bg-transparent outline-none resize-none min-h-[120px] text-sm text-emerald-950 dark:text-emerald-50"
                    />
                    <div className="flex justify-between items-center mt-4 border-t border-emerald-100 dark:border-emerald-800 pt-4">
                      <div className="text-[10px] flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider">
                        <CheckCircle2 size={14} /> Verified IKADI Admin
                      </div>
                      <Button
                        disabled={sending || !replyText.trim()}
                        onClick={sendReply}
                        className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-transform active:scale-95"
                      >
                        {sending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" /> Send Response
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col text-center opacity-20 text-emerald-900 dark:text-emerald-50">
                <div className="bg-emerald-100 dark:bg-emerald-900 p-8 rounded-full mb-6 animate-pulse">
                  <Search size={80} />
                </div>
                <p className="text-xl font-black uppercase tracking-widest">
                  Select a consultation to view details
                </p>
              </div>
            )}
          </div>
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
  color,
}: {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
}) => {
  return (
    <div
      className={`border rounded-[1rem] p-5 shadow-sm transition-all hover:scale-[1.02] ${color || "bg-card border-emerald-100 dark:border-emerald-800"}`}
    >
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          {title}
        </p>
        <span className="opacity-50">{icon}</span>
      </div>
      <h3 className="text-3xl font-black mt-2 leading-none">
        {value.toLocaleString()}
      </h3>
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
          <span className="text-[11px] font-bold opacity-40 uppercase whitespace-nowrap shrink-0 mt-0.5 tracking-tighter">
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
          <p className="text-[11px] line-clamp-1 text-muted-foreground/80 leading-snug">
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
