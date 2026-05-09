import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ConsultationsDataTable from "./ConsultationsDataTable";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { MessageCircle, Clock, CheckCircle2, BarChart3 } from "lucide-react";
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

  // --- 1. Fetch Stats & Chart (Optimized) ---
  const loadStatsAndChart = useCallback(async () => {
    setStatsLoading(true);
    setChartLoading(true);

    try {
      // Menarik perhitungan statis langsung dari View agar sinkron
      const [resTotal, resPending, resAnswered, resCats, resAllData] =
        await Promise.all([
          supabase
            .from("view_merged_consultations")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("view_merged_consultations")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("view_merged_consultations")
            .select("*", { count: "exact", head: true })
            .eq("status", "answered"),
          supabase.from("consultation_categories").select("id, name"),
          // Tarik data category_id saja untuk dihitung di sisi client (menghindari N+1 Query)
          supabase.from("view_merged_consultations").select("category_id"),
        ]);

      setStats({
        total: resTotal.count ?? 0,
        pending: resPending.count ?? 0,
        answered: resAnswered.count ?? 0,
      });

      const masterCategories = (resCats.data as CategoryData[]) || [];
      const rawConsultations = resAllData.data || [];

      // Menghitung total per kategori di client-side untuk performa lebih cepat
      const counts: ChartItem[] = masterCategories.map((cat) => {
        const total = rawConsultations.filter(
          (c) => c.category_id === cat.id,
        ).length;
        return { name: cat.name, total };
      });

      const cleanedChart = counts
        .filter((c) => c.total > 0)
        .sort((a, b) => b.total - a.total);

      setCategoryChart(cleanedChart);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Gagal memuat statistik";
      console.error(errMsg);
    } finally {
      setStatsLoading(false);
      setChartLoading(false);
    }
  }, []);

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
    console.log("🚀 [DELETE START] ID Target:", id);

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
      console.log("❌ [DELETE CANCELLED] Dibatalkan oleh user.");
      return;
    }

    try {
      // STEP 1: Ambil data target dari View
      console.log("🔎 [STEP 1] Mencari target di view_merged_consultations...");
      const { data: target, error: fetchError } = await supabase
        .from("view_merged_consultations")
        .select("id, inbox_id")
        .eq("id", id)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ [ERROR STEP 1] Fetching target failed:", fetchError);
        throw fetchError as SupabaseError;
      }

      if (!target) {
        console.warn("⚠️ [WARN STEP 1] Data tidak ditemukan di View.");
        throw new Error("Data tidak ditemukan di View.");
      }

      const item = target as UnifiedConsultation;
      console.log("✅ [STEP 1 RESULT] Data ditemukan:", item);

      // STEP 2: Eksekusi Penghapusan
      if (item.inbox_id) {
        console.log(
          "🔥 [STEP 2] Memproses Data Baru (Has Inbox ID):",
          item.inbox_id,
        );

        // A. Hapus di Tabel Consultations (Publik)
        console.log("🗑️ [STEP 2A] Menghapus dari tabel 'consultations'...");
        const { error: errPublic, data: resPublic } = await supabase
          .from("consultations")
          .delete()
          .eq("inbox_id", item.inbox_id)
          .select(); // Menggunakan .select() untuk melihat apa yang dihapus

        if (errPublic) {
          console.error(
            "❌ [ERROR STEP 2A] Gagal hapus di 'consultations':",
            errPublic,
          );
          throw errPublic as SupabaseError;
        }
        console.log("✅ [STEP 2A RESULT] Consultations terhapus:", resPublic);

        // B. Hapus di Tabel Inbox_Consultations (Master)
        console.log(
          "🗑️ [STEP 2B] Menghapus dari tabel 'inbox_consultations'...",
        );
        const { error: errInbox, data: resInbox } = await supabase
          .from("inbox_consultations")
          .delete()
          .eq("id", item.inbox_id)
          .select();

        if (errInbox) {
          console.error(
            "❌ [ERROR STEP 2B] Gagal hapus di 'inbox_consultations':",
            errInbox,
          );
          throw errInbox as SupabaseError;
        }
        console.log(
          "✅ [STEP 2B RESULT] Inbox_consultations terhapus:",
          resInbox,
        );
      } else {
        console.log("🔥 [STEP 2] Memproses Data Lama (No Inbox ID)");

        console.log(
          "🗑️ [STEP 2C] Menghapus langsung dari tabel 'consultations'...",
        );
        const { error: errOld, data: resOld } = await supabase
          .from("consultations")
          .delete()
          .eq("id", item.id)
          .select();

        if (errOld) {
          console.error("❌ [ERROR STEP 2C] Gagal hapus data lama:", errOld);
          throw errOld as SupabaseError;
        }
        console.log("✅ [STEP 2C RESULT] Data lama terhapus:", resOld);
      }

      // STEP 3: Feedback & Refresh
      console.log("✨ [DELETE SUCCESS] Semua proses database selesai.");
      Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: "Data berhasil dibersihkan dari sistem.",
        timer: 1500,
        showConfirmButton: false,
      });

      console.log("🔄 [REFRESH] Mengupdate Table & Stats...");
      loadTableData();
      loadStatsAndChart();
    } catch (err: unknown) {
      console.error("🚨 [CRITICAL ERROR] Delete Flow Broken:", err);
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
            Realtime Consultation Dashboard untuk memantau dan mengelola pertanyaan masyarakat dengan efisien.
          </p>
        </div>
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
  color,
  bg,
}: {
  label: string;
  value: number;
  loading: boolean;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg} ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          {label}
        </p>
        <h3 className="text-2xl font-bold">
          {loading ? "..." : value.toLocaleString("id-ID")}
        </h3>
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
