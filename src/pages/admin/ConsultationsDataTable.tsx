import { InfoIcon, Trash2 } from "lucide-react";
import React, { useState } from "react";
import DetailConsultation from "@/components/admin/DetailConsultation";
import { Consultation, FilterStatus } from "./Consultations";

type Props = {
  data: Consultation[];
  totalItems: number;
  isLoading: boolean;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: FilterStatus;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: FilterStatus) => void;
  onDelete: (id: number) => void;
  onSuccessReply: () => void;
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
  const [selected, setSelected] = useState<Consultation | null>(null);

  const totalPages = Math.ceil(totalItems / pageSize);

  const truncate = (text: string | null, max: number = 35) => {
    if (!text) return "-";
    return text.length > max ? text.slice(0, max) + "…" : text;
  };

  return (
    <div>
      <div className="flex gap-2 p-4 border-b border-border bg-card">
        <input
          placeholder="Cari judul atau pengirim..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onSearchChange(e.target.value)
          }
          className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-full max-w-xs"
        />

        <select
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onStatusChange(e.target.value as FilterStatus)
          }
          className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <option value="all">Semua Status</option>
          <option value="0">Menunggu Jawaban</option>
          <option value="1">Sudah Terjawab</option>
        </select>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border sticky top-0 z-10">
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Pengirim</th>
              <th className="p-3">Kategori & Judul</th>
              <th className="p-3">Status</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="bg-card">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border animate-pulse">
                  <td className="p-3">
                    <div className="h-3 bg-muted rounded w-32 mb-2" />
                    <div className="h-2 bg-muted rounded w-20" />
                  </td>
                  <td className="p-3">
                    <div className="h-3 bg-muted rounded w-40 mb-2" />
                    <div className="h-2 bg-muted rounded w-24" />
                  </td>
                  <td className="p-3">
                    <div className="h-4 bg-muted rounded w-20" />
                  </td>
                  <td className="p-3">
                    <div className="h-3 bg-muted rounded w-24" />
                  </td>
                  <td className="p-3">
                    <div className="w-8 h-8 bg-muted rounded ml-auto" />
                  </td>
                </tr>
              ))}

            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                >
                  Tidak ada data konsultasi yang ditemukan
                </td>
              </tr>
            )}

            {!isLoading &&
              data.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="p-3">
                    <div className="font-medium text-foreground">
                      {item.author_name || "Anonim"}
                    </div>
                    {item.city && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        📍 {item.city}
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="font-medium text-foreground">
                      {truncate(item.title)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.consultation_categories?.name || "Tanpa Kategori"}
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 1
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {item.status === 1 ? "Terjawab" : "Menunggu"}
                    </span>
                  </td>

                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      timeZone: "Asia/Jakarta",
                    })}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setSelected(item)}
                        className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/70 transition"
                        title="Lihat Detail / Jawab"
                      >
                        <InfoIcon size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
                        title="Hapus Konsultasi"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center p-4 border-t border-border bg-card">
        <div className="text-xs text-muted-foreground">
          {isLoading ? "Memuat..." : `Total ${totalItems} data`}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="px-3 py-1 border border-border rounded-md text-xs bg-background text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          <span className="text-xs text-muted-foreground px-2">
            {page} / {totalPages === 0 ? 1 : totalPages}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0 || isLoading}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="px-3 py-1 border border-border rounded-md text-xs bg-background text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
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
