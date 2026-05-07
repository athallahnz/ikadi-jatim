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

// --- Interfaces & Types ---
export interface ConsultationCategory {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface Consultation {
  id: number;
  author_name: string | null;
  city: string | null;
  title: string | null;
  slug: string | null;
  category_id: number | null;
  question: string | null;
  answer: string | null;
  created_at: string;
  answered_at: string | null;
  status: number;
  answered_by: string | null;
  consultation_categories?: ConsultationCategory;
}

export interface ConsultationStats {
  total: number;
  pending: number;
  answered: number;
}

export interface CategoryChartData {
  name: string;
  total: number;
}

export type FilterStatus = "all" | "0" | "1";

export default function Consultations() {
  // --- States: Stats & Chart ---
  const [stats, setStats] = useState<ConsultationStats>({
    total: 0,
    pending: 0,
    answered: 0,
  });
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  const [categoryChart, setCategoryChart] = useState<CategoryChartData[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);

  // --- States: Data Table (Server-Side) ---
  const [tableData, setTableData] = useState<Consultation[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const pageSize = 10;

  // --- Logic: Fetch Stats & Chart (Optimized for 10K+ data) ---
  const loadStatsAndChart = async (): Promise<void> => {
    setStatsLoading(true);
    setChartLoading(true);

    try {
      // 1. Fetch Statistik Umum (Card) & Master Kategori secara paralel
      // Menggunakan head: true agar tidak mengunduh row data sama sekali
      const [resTotal, resPending, resAnswered, resCategories] =
        await Promise.all([
          supabase
            .from("consultations")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("consultations")
            .select("*", { count: "exact", head: true })
            .eq("status", 0),
          supabase
            .from("consultations")
            .select("*", { count: "exact", head: true })
            .eq("status", 1),
          supabase.from("consultation_categories").select("id, name"),
        ]);

      // Update State Statistik Card
      setStats({
        total: resTotal.count ?? 0,
        pending: resPending.count ?? 0,
        answered: resAnswered.count ?? 0,
      });

      const masterCategories =
        (resCategories.data as ConsultationCategory[]) || [];

      // 2. Fetch Exact Count per Kategori secara paralel untuk Chart
      // Dihitung langsung oleh engine PostgreSQL (Sangat cepat & aman untuk 10K+ baris)
      const countPromises = masterCategories.map(
        async (cat): Promise<CategoryChartData> => {
          const { count } = await supabase
            .from("consultations")
            .select("*", { count: "exact", head: true })
            .eq("category_id", cat.id);

          return { name: cat.name, total: count ?? 0 };
        },
      );

      // 3. Menghitung data pertanyaan yang tidak memiliki relasi kategori (null)
      const nullCountPromise = supabase
        .from("consultations")
        .select("*", { count: "exact", head: true })
        .is("category_id", null)
        .then(
          ({ count }): CategoryChartData => ({
            name: "Tanpa Kategori",
            total: count ?? 0,
          }),
        );

      // Eksekusi seluruh perhitungan kategori secara bersamaan
      const categoryCounts = await Promise.all([
        ...countPromises,
        nullCountPromise,
      ]);

      // 4. Format Chart: Sembunyikan "Tanpa Kategori" jika jumlahnya 0, lalu urutkan dari terbanyak
      const formattedChartData = categoryCounts
        .filter((cat) => cat.name !== "Tanpa Kategori" || cat.total > 0)
        .sort((a, b) => b.total - a.total);

      setCategoryChart(formattedChartData);
    } catch (error) {
      console.error("Gagal memuat statistik dan chart:", error);
    } finally {
      setStatsLoading(false);
      setChartLoading(false);
    }
  };

  // --- Logic: Fetch Data Tabel dengan Pagination & Search ---
  const loadTableData = useCallback(async (): Promise<void> => {
    setTableLoading(true);

    let query = supabase
      .from("consultations")
      .select("*, consultation_categories(id, name, slug)", { count: "exact" });

    // Filter Status
    if (statusFilter !== "all") {
      query = query.eq("status", parseInt(statusFilter));
    }

    // Filter Pencarian
    if (search.trim()) {
      const cleanSearch = search.replace(/,/g, ""); // Mencegah error syntax Supabase
      query = query.or(
        `title.ilike.%${cleanSearch}%,author_name.ilike.%${cleanSearch}%`,
      );
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      setTableData(data as Consultation[]);
      setTotalItems(count ?? 0);
    } else if (error) {
      console.error("Gagal memuat tabel:", error);
    }

    setTableLoading(false);
  }, [page, search, statusFilter, pageSize]);

  // Komponen Tooltip kustom yang mendukung Light/Dark Theme Tailwind
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-800 p-3 rounded-xl shadow-lg">
          <p className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Jumlah: {payload[0].value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // --- Effects ---
  useEffect(() => {
    // Dipanggil hanya sekali saat komponen dimuat
    loadStatsAndChart();
  }, []);

  useEffect(() => {
    // Debounce untuk menunda query tabel selama mengetik pencarian
    const delayDebounceFn = setTimeout(() => {
      loadTableData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [loadTableData]);

  // --- Handlers ---
  const deleteConsultation = async (id: number): Promise<void> => {
    const res = await Swal.fire({
      title: "Hapus konsultasi?",
      text: "Data ini beserta jawabannya akan terhapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!res.isConfirmed) return;

    const { error } = await supabase
      .from("consultations")
      .delete()
      .eq("id", id);

    if (!error) {
      Swal.fire("Terhapus", "Data konsultasi berhasil dihapus", "success");
      // Perbarui statistik dan tabel setelah data dihapus
      loadStatsAndChart();
      loadTableData();
    } else {
      Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data", "error");
    }
  };

  // --- Render ---
  return (
    <AdminLayout>
      {/* Header Halaman */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">
          Ruang Konsultasi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola pertanyaan dan berikan jawaban untuk jamaah atau pengguna
        </p>
      </div>

      {/* Baris Statistik Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Pertanyaan */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg">
            <MessageCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Pertanyaan</p>
            <h3 className="text-2xl font-bold text-foreground">
              {statsLoading ? "..." : stats.total}
            </h3>
          </div>
        </div>

        {/* Menunggu Jawaban */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Menunggu Jawaban</p>
            <h3 className="text-2xl font-bold text-foreground">
              {statsLoading ? "..." : stats.pending}
            </h3>
          </div>
        </div>

        {/* Sudah Dijawab */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sudah Dijawab</p>
            <h3 className="text-2xl font-bold text-foreground">
              {statsLoading ? "..." : stats.answered}
            </h3>
          </div>
        </div>
      </div>

      {/* Bagian Grafik/Chart Batang Kategori */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-emerald-600" size={20} />
          <h2 className="text-lg font-bold text-foreground">
            Statistik Kategori Konsultasi
          </h2>
        </div>

        {chartLoading ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-sm animate-pulse gap-2">
            <BarChart3 size={32} className="opacity-50" />
            <p>Memuat dan menghitung data dari database...</p>
          </div>
        ) : categoryChart.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm italic bg-muted/20 rounded-lg border border-dashed">
            Belum ada data kategori yang bisa ditampilkan.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChart}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-emerald-100 dark:text-emerald-800/40"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-emerald-700/60 dark:text-emerald-400/50"
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-emerald-700/60 dark:text-emerald-400/50"
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{
                    fill: "currentColor",
                    className: "text-emerald-50 dark:text-emerald-900/20",
                  }}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="total"
                  fill="currentColor"
                  className="text-emerald-500 dark:text-emerald-400"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  name="Jumlah Pertanyaan"
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bagian Tabel Data */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <ConsultationsDataTable
          data={tableData}
          totalItems={totalItems}
          isLoading={tableLoading}
          page={page}
          pageSize={pageSize}
          search={search}
          statusFilter={statusFilter}
          onPageChange={setPage}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1); // Kembali ke halaman pertama setiap kali mencari
          }}
          onStatusChange={(val) => {
            setStatusFilter(val);
            setPage(1); // Kembali ke halaman pertama setiap ganti tab status
          }}
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
