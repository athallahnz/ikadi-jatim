import { useState } from "react";
import { InfoIcon, Trash2, MapPin, Calendar, Tag, Search } from "lucide-react";
import DetailConsultation from "@/components/admin/DetailConsultation";
import { UnifiedConsultation, FilterStatus } from "@/types/database";
import { Button } from "@/components/ui/button";

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

/**
 * HELPER: Truncate text untuk menjaga kerapian layout
 */
const truncateText = (text: string | null, max: number = 40) => {
  if (!text) return "-";
  return text.length > max ? text.slice(0, max) + "..." : text;
};

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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-emerald-950/50 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/50 overflow-hidden shadow-sm">
      {/* 1. SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row items-center gap-3 p-4 border-b border-emerald-100 dark:border-emerald-900/50 bg-white/50 dark:bg-emerald-950/20 backdrop-blur-sm">
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
            className="h-11 w-full pl-11 pr-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-white dark:bg-emerald-900/40 text-sm placeholder:text-emerald-900/30 dark:placeholder:text-emerald-100/30 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

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

      {/* 2. TABLE SECTION */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 text-left uppercase text-[10px] font-black tracking-widest border-b border-emerald-100 dark:border-emerald-900/50">
              <th className="p-4">Data Pengirim</th>
              <th className="p-4">Topik & Pesan</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50 dark:divide-emerald-900/30">
            {isLoading ? (
              [...Array(pageSize)].map((_, i) => (
                <SkeletonRow key={`skeleton-${i}`} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Search
                      size={40}
                      className="text-emerald-900 dark:text-emerald-100"
                    />
                    <p className="text-sm font-medium italic">
                      Tidak ada data ditemukan
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  // FIX: Gunakan fallback index jika ID null untuk menghindari Duplicate Key
                  key={item.id || `row-${idx}`}
                  className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group"
                >
                  <td className="p-4">
                    <div className="font-bold text-emerald-950 dark:text-emerald-50">
                      {item.name || "Anonim"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[14px] text-muted-foreground mt-1 font-medium">
                      <MapPin size={14} className="text-rose-500" />
                      {item.city || "Luar Kota"}
                    </div>
                  </td>
                  <td className="p-4 max-w-md">
                    <div className="font-black text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider mb-0.5">
                      {item.consultation_categories?.name || "Umum"}
                    </div>
                    <div className="text-emerald-950 dark:text-emerald-100 font-bold uppercase text-xs line-clamp-1">
                      {item.subject || "Tanpa Judul"}
                    </div>
                    <p className="text-muted-foreground text-xs line-clamp-1 italic mt-1">
                      "{truncateText(item.message)}"
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase w-fit ${
                          item.status === "answered"
                            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
                        }`}
                      >
                        {item.status === "answered" ? "Selesai" : "Menunggu"}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                        <Calendar size={10} />
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(item)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                        title="Lihat Detail"
                      >
                        <InfoIcon size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                        title="Hapus Data"
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

      {/* 3. PAGINATION FOOTER */}
      <div className="p-4 border-t border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-50/20 dark:bg-emerald-950/40">
        <span className="text-[10px] font-black text-emerald-800/50 dark:text-emerald-400/50 uppercase tracking-[0.2em]">
          {totalItems} Total Records Found
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border-emerald-200 dark:border-emerald-800"
          >
            Prev
          </Button>
          <div className="h-9 px-4 flex items-center justify-center bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-emerald-900/20 min-w-[80px]">
            {page} / {totalPages || 1}
          </div>
          <Button
            variant="outline"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border-emerald-200 dark:border-emerald-800"
          >
            Next
          </Button>
        </div>
      </div>

      {/* 4. MODAL DETAIL */}
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

/**
 * COMPONENT: SkeletonRow untuk Loading State
 */
function SkeletonRow() {
  return (
    <tr className="border-b border-emerald-50/50 dark:border-emerald-900/20 animate-pulse">
      <td className="p-4">
        <div className="h-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-md w-32 mb-2" />
        <div className="h-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-md w-20" />
      </td>
      <td className="p-4">
        <div className="h-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-md w-24 mb-2" />
        <div className="h-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-md w-64 mb-2" />
        <div className="h-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-md w-48" />
      </td>
      <td className="p-4">
        <div className="h-6 bg-emerald-100 dark:bg-emerald-900/50 rounded-full w-20 mb-2" />
        <div className="h-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-md w-24" />
      </td>
      <td className="p-4">
        <div className="flex justify-end gap-2">
          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl" />
          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl" />
        </div>
      </td>
    </tr>
  );
}
