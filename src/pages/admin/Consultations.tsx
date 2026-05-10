import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import VectorSyncModal from "@/components/admin/VectorSyncModal"; // Path sesuaikan
import ConsultationsDataTable from "./ConsultationsDataTable";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import {
  MessageCircle,
  Clock,
  CheckCircle2,
  BarChart3,
  Zap,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { UnifiedConsultation, FilterStatus } from "@/types/database";
import { Button } from "@/components/ui/button";

// --- Interfaces ---
interface SupabaseError {
  message: string;
}

interface CategoryData {
  id: number;
  name: string;
}

interface ChartItem {
  name: string;
  total: number;
}

export default function Consultations() {
  // --- States ---
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  const [categoryChart, setCategoryChart] = useState<ChartItem[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);

  const [tableData, setTableData] = useState<UnifiedConsultation[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const pageSize = 10;

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTriggerSync = async () => {
    setIsTriggering(true);
    try {
      // Gunakan invoke, bukan fetch manual ke /api/embed
      const { data, error } = await supabase.functions.invoke("ai-vector-sync");

      if (error) {
        // Jika error dari Supabase (CORS, Auth, dll)
        console.error("Supabase Function Error:", error);
        Swal.fire("Gagal", `Server Error: ${error.message}`, "error");
        return;
      }

      if (data && data.jobId) {
        setActiveJobId(data.jobId);
      } else {
        throw new Error("Tidak ada Job ID yang diterima dari server.");
      }
    } catch (error: unknown) {
      console.error("Failed to start sync:", error);
      const msg =
        error instanceof Error ? error.message : "Terjadi kesalahan sistem";
      Swal.fire("Gagal", msg, "error");
    } finally {
      setIsTriggering(false);
    }
  };

  

  const loadStatsAndChart = useCallback(async () => {
    setStatsLoading(true);
    setChartLoading(true);

    try {
      // 1. Ambil Master Kategori terlebih dahulu
      const { data: catData, error: catError } = await supabase
        .from("consultation_categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (catError) throw catError;
      const masterCategories = (catData as CategoryData[]) || [];

      // 2. Fungsi pembantu untuk query count (agar sinkron dengan search)
      const getCount = (status?: string, catId?: number) => {
        let q = supabase
          .from("view_merged_consultations")
          .select("*", { count: "exact", head: true });

        if (status) q = q.eq("status", status);
        if (catId) q = q.eq("category_id", catId);

        if (search.trim()) {
          q = q.or(
            `name.ilike.%${search.trim()}%,subject.ilike.%${search.trim()}%`,
          );
        }
        return q;
      };

      // 3. Tarik Stats Utama & Count per Kategori secara Paralel
      // Ini tidak akan terkena limit 1000 baris karena kita hanya mengambil angka 'count'
      const [resTotal, resPending, resAnswered, ...resCategoryCounts] =
        await Promise.all([
          getCount(), // Total global
          getCount("pending"), // Total pending
          getCount("answered"), // Total answered
          // Tarik count untuk setiap kategori yang ada di master
          ...masterCategories.map((cat) => getCount(undefined, cat.id)),
        ]);

      // Update Stat Cards
      setStats({
        total: resTotal.count ?? 0,
        pending: resPending.count ?? 0,
        answered: resAnswered.count ?? 0,
      });

      // 4. Mapping hasil count ke format Chart
      const cleanedChart: ChartItem[] = masterCategories
        .map((cat, index) => {
          // resCategoryCounts dimulai dari index ke-0 setelah resAnswered
          const count = resCategoryCounts[index].count ?? 0;
          return {
            name: cat.name,
            total: count,
          };
        })
        .filter((c) => c.total > 0) // Sembunyikan kategori yang kosong
        .sort((a, b) => b.total - a.total);

      setCategoryChart(cleanedChart);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Gagal memuat statistik";
      console.error("Error stats:", errMsg);
    } finally {
      setStatsLoading(false);
      setChartLoading(false);
    }
  }, [search]);

  // --- 2. Fetch Data Table ---
  const loadTableData = useCallback(async () => {
    setTableLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = supabase
        .from("view_merged_consultations")
        .select("*", { count: "exact" });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`);
      }

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        const rawData = data as unknown as UnifiedConsultation[];
        const formattedData: UnifiedConsultation[] = rawData.map((item) => ({
          ...item,
          consultation_categories: item.category_name
            ? { name: item.category_name }
            : undefined,
        }));

        setTableData(formattedData);
        setTotalItems(count ?? 0);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Gagal memuat tabel";
      console.error(errMsg);
    } finally {
      setTableLoading(false);
    }
  }, [page, search, statusFilter]);

  // --- 3. Smart Deletion WITH LOGGING ---
  const deleteConsultation = async (id: string): Promise<void> => {
    const result = await Swal.fire({
      title: "Hapus Konsultasi?",
      text: "Data akan dihapus permanen dari sistem.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const { data: target, error: fetchError } = await supabase
        .from("view_merged_consultations")
        .select("id, inbox_id")
        .eq("id", id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError as SupabaseError;
      }

      if (!target) {
        throw new Error("Data tidak ditemukan di View.");
      }

      const item = target as UnifiedConsultation;

      if (item.inbox_id) {
        const { error: errPublic } = await supabase
          .from("consultations")
          .delete()
          .eq("inbox_id", item.inbox_id)
          .select();

        if (errPublic) {
          throw errPublic as SupabaseError;
        }

        const { error: errInbox } = await supabase
          .from("inbox_consultations")
          .delete()
          .eq("id", item.inbox_id)
          .select();

        if (errInbox) {
          throw errInbox as SupabaseError;
        }
      } else {
        const { error: errOld } = await supabase
          .from("consultations")
          .delete()
          .eq("id", item.id)
          .select();

        if (errOld) {
          throw errOld as SupabaseError;
        }
      }

      Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: "Data berhasil dibersihkan dari sistem.",
        timer: 1500,
        showConfirmButton: false,
      });

      loadTableData();
      loadStatsAndChart();
    } catch (err: unknown) {
      let msg = "Terjadi kesalahan sistem.";
      if (err instanceof Error) msg = err.message;
      else if (typeof err === "object" && err !== null && "message" in err) {
        msg = (err as SupabaseError).message;
      }
      Swal.fire("Gagal", msg, "error");
    }
  };

  // --- 4. Effects ---
  useEffect(() => {
    loadStatsAndChart();
  }, [loadStatsAndChart]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTableData();
    }, 400);
    return () => clearTimeout(timer);
  }, [loadTableData]);

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-5">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 dark:text-emerald-50">
            Dashboard Consultation
          </h1>
          <p className="text-emerald-600/80 dark:text-emerald-400/80 text-sm font-medium">
            Realtime Consultation Dashboard untuk memantau dan merespon
            pertanyaan masyarakat dengan cepat.
          </p>
        </div>

        {/* TOMBOL AI SYNC DI KANAN */}
        <div className="flex items-center gap-3">
          {!activeJobId && (
            <Button
              onClick={handleTriggerSync}
              disabled={isTriggering}
              className="group relative bg-emerald-950 dark:bg-emerald-50 text-white dark:text-emerald-950 rounded-2xl px-6 h-12 overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isTriggering ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Zap size={18} className="mr-2 fill-current" />
              )}
              <span className="font-black text-xs uppercase tracking-widest">
                {isTriggering ? "Initializing..." : "AI Vector Sync"}
              </span>
            </Button>
          )}
        </div>

        {/* MODAL PROGRESS */}
        {activeJobId && (
          <VectorSyncModal
            jobId={activeJobId}
            onClose={() => setActiveJobId(null)}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Masuk"
          value={stats.total}
          loading={statsLoading}
          icon={<MessageCircle />}
          color="text-blue-600"
          bg="bg-blue-500/10"
        />
        <StatCard
          label="Menunggu"
          value={stats.pending}
          loading={statsLoading}
          icon={<Clock />}
          color="text-amber-600"
          bg="bg-amber-500/10"
        />
        <StatCard
          label="Selesai"
          value={stats.answered}
          loading={statsLoading}
          icon={<CheckCircle2 />}
          color="text-emerald-600"
          bg="bg-emerald-500/10"
        />
      </div>

      {/* Chart Section */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-8">
          <BarChart3 className="text-emerald-600" size={20} />
          <h2 className="text-lg font-bold">Kategori Terpopuler</h2>
        </div>
        <div className="h-[300px]">
          {chartLoading ? (
            <div className="h-full bg-muted/20 animate-pulse rounded-xl" />
          ) : categoryChart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground italic">
              Belum ada data kategori
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="total"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <ConsultationsDataTable
          data={tableData}
          totalItems={totalItems}
          isLoading={tableLoading}
          page={page}
          pageSize={pageSize}
          search={search}
          statusFilter={statusFilter}
          onPageChange={setPage}
          onSearchChange={setSearch}
          onStatusChange={(v) => setStatusFilter(v as FilterStatus)}
          onDelete={deleteConsultation}
          onSuccessReply={() => {
            loadStatsAndChart();
            loadTableData();
          }}
        />
      </div>
    </AdminLayout>
  );
}

// --- Helper Components ---

function StatCard({
  label,
  value,
  loading,
  icon,
}: {
  label: string;
  value: number;
  loading: boolean;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="group relative border rounded-[1.5rem] p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md bg-white dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800">
      {/* Baris Atas */}
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 opacity-80">
          {label}
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
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-emerald-950 border border-emerald-100 p-3 rounded-xl shadow-xl">
        <p className="font-bold text-sm mb-1">{label}</p>
        <p className="text-emerald-500 text-xs font-bold">
          {payload[0].value} Pertanyaan
        </p>
      </div>
    );
  }
  return null;
};
