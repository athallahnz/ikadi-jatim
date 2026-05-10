import { useState } from "react";
import { InfoIcon, Trash2, MapPin, Calendar, Tag, Search } from "lucide-react";
import DetailConsultation from "@/components/admin/DetailConsultation";
import { UnifiedConsultation, FilterStatus } from "@/types/database";

interface Props {
  data: UnifiedConsultation[];
  totalItems: number;
  isLoading: boolean;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: FilterStatus;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: FilterStatus) => void;
  onDelete: (id: string) => Promise<void>;
  onSuccessReply: () => void;
}

export default function ConsultationsDataTable({
  data,
  totalItems,
  isLoading,
  page,
  pageSize,
  search,
  statusFilter,
  onPageChange,
  onSearchChange,
  onStatusChange,
  onDelete,
  onSuccessReply,
}: Props) {
  const [selected, setSelected] = useState<UnifiedConsultation | null>(null);
  const totalPages = Math.ceil(totalItems / pageSize);

  const truncate = (text: string | null, max: number = 40) => {
    if (!text) return "-";
    return text.length > max ? text.slice(0, max) + "..." : text;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 p-4 border-b border-emerald-100 dark:border-emerald-800/50 bg-white/50 dark:bg-emerald-950/20 backdrop-blur-sm">
        {/* Input Pencarian */}
        <div className="relative w-full md:flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500/50 dark:text-emerald-400/40"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari pengirim atau subjek..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full pl-11 pr-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-white dark:bg-emerald-900/40 text-sm placeholder:text-emerald-900/30 dark:placeholder:text-emerald-100/30 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Dropdown Status */}
        <div className="relative w-full md:w-64 shrink-0">
          <Tag
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400"
            size={14}
          />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
            className="h-11 w-full pl-10 pr-10 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-[11px] font-black text-emerald-700 dark:text-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer shadow-sm uppercase tracking-wider"
          >
            <option value="all">SEMUA STATUS</option>
            <option value="pending">MENUNGGU JAWABAN</option>
            <option value="answered">SUDAH TERJAWAB</option>
          </select>

          {/* Custom Arrow Icon - Agar user tahu ini adalah dropdown */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600/50">
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/30 text-muted-foreground text-left uppercase text-[10px] font-black tracking-widest border-b border-border">
              <th className="p-4">Data Pengirim</th>
              <th className="p-4">Topik & Pesan</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              // Pemanggilan SkeletonRow yang sebelumnya menyebabkan error
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-12 text-center text-muted-foreground italic"
                >
                  Tidak ada data ditemukan
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-bold text-foreground">
                      {item.name || "Anonim"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mt-1 font-medium">
                      <MapPin size={15} className="text-red-500" />{" "}
                      {item.city || "Luar Kota"}
                    </div>
                  </td>
                  <td className="p-4 max-w-md">
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-tight">
                      {item.consultation_categories?.name || "Umum"}
                    </div>
                    <div className="text-foreground font-semibold uppercase line-clamp-1">
                      {item.subject || "Tanpa Judul"}
                    </div>
                    <p className="text-muted-foreground text-md line-clamp-1 italic">
                      "{truncate(item.message)}"
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase w-fit ${
                          item.status === "answered"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {item.status === "answered" ? "Selesai" : "Menunggu"}
                      </span>
                      <div className="flex items-center gap-1 text-[12px] text-foreground opacity-70">
                        <Calendar size={10} />
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(item)}
                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all active:scale-95"
                      >
                        <InfoIcon size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all active:scale-95"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border flex justify-between items-center bg-card/30 mt-auto">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {totalItems} Total Records
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="px-4 py-1.5 text-xs font-bold border border-border rounded-xl disabled:opacity-30 active:bg-muted transition-all"
          >
            Prev
          </button>
          <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-black">
            {page} / {totalPages || 1}
          </div>
          <button
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="px-4 py-1.5 text-xs font-bold border border-border rounded-xl disabled:opacity-30 active:bg-muted transition-all"
          >
            Next
          </button>
        </div>
      </div>

      {selected && (
        <DetailConsultation
          data={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => {
            setSelected(null);
            onSuccessReply();
          }}
        />
      )}
    </div>
  );
}

/** * ✅ PENYELESAIAN: Komponen Internal untuk Skeleton Loading
 * Ditempatkan di luar fungsi utama agar tetap bersih
 */
function SkeletonRow() {
  return (
    <tr className="border-b border-border animate-pulse">
      <td className="p-4">
        <div className="h-4 bg-muted rounded-md w-32 mb-2" />
        <div className="h-2 bg-muted rounded-md w-20" />
      </td>
      <td className="p-4">
        <div className="h-3 bg-muted rounded-md w-24 mb-2" />
        <div className="h-4 bg-muted rounded-md w-64 mb-2" />
        <div className="h-2 bg-muted rounded-md w-48" />
      </td>
      <td className="p-4">
        <div className="h-5 bg-muted rounded-full w-20 mb-2" />
        <div className="h-2 bg-muted rounded-md w-24" />
      </td>
      <td className="p-4">
        <div className="flex justify-end gap-2">
          <div className="w-8 h-8 bg-muted rounded-xl" />
          <div className="w-8 h-8 bg-muted rounded-xl" />
        </div>
      </td>
    </tr>
  );
}
