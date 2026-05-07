import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ConsultationsDataTable from "./ConsultationsDataTable";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { MessageCircle, Clock, CheckCircle2 } from "lucide-react";

// Tipe data yang eksplisit dan akurat
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
  consultation_categories?: ConsultationCategory; // Relasi tabel
}

export interface ConsultationStats {
  total: number;
  pending: number;
  answered: number;
}

export type FilterStatus = "all" | "0" | "1";

export default function Consultations() {
  const [stats, setStats] = useState<ConsultationStats>({
    total: 0,
    pending: 0,
    answered: 0,
  });
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  // State untuk DataTable (Server-Side)
  const [tableData, setTableData] = useState<Consultation[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const pageSize = 10;

  // Fetch Statistik (Hanya angka, sangat ringan)
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const [resTotal, resPending, resAnswered] = await Promise.all([
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
      ]);

      setStats({
        total: resTotal.count ?? 0,
        pending: resPending.count ?? 0,
        answered: resAnswered.count ?? 0,
      });
    } catch (error) {
      console.error("Gagal memuat statistik:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Data Tabel dengan Pagination & Filter (Server-Side)
  const loadTableData = useCallback(async () => {
    setTableLoading(true);

    let query = supabase
      .from("consultations")
      .select("*, consultation_categories(id, name, slug)", { count: "exact" });

    if (statusFilter !== "all") {
      query = query.eq("status", parseInt(statusFilter));
    }

    if (search.trim()) {
      // Hilangkan koma pada search untuk mencegah error syntax pada Supabase .or()
      const cleanSearch = search.replace(/,/g, "");
      query = query.or(
        `title.ilike.%${cleanSearch}%,author_name.ilike.%${cleanSearch}%`,
      );
    }

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

  // Load awal statistik
  useEffect(() => {
    loadStats();
  }, []);

  // Efek Debounce untuk pencarian dan pagination
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadTableData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [loadTableData]);

  const deleteConsultation = async (id: number) => {
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
      loadStats();
      loadTableData();
    } else {
      Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">
          Ruang Konsultasi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola pertanyaan dan berikan jawaban untuk jamaah atau pengguna
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
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

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
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

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
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
            setPage(1);
          }}
          onStatusChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          onDelete={deleteConsultation}
          onSuccessReply={() => {
            loadStats();
            loadTableData();
          }}
        />
      </div>
    </AdminLayout>
  );
}
