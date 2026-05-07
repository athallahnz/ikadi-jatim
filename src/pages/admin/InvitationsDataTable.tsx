import { InfoIcon, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import DetailInvitation from "@/components/admin/DetailInvitation";

export type Invitation = {
  id: string;
  type: "anggota" | "dai";
  name: string;
  email: string | null;
  phone: string;
  message: string | null;
  created_at: string;
};

type Props = {
  data: Invitation[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export default function InvitationsDataTable({
  data,
  onDelete,
  isLoading = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "anggota" | "dai">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Invitation | null>(null);

  const pageSize = 10;

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return data.filter((i) => {
      const matchSearch =
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.phone.includes(search);

      const matchType = type === "all" ? true : i.type === type;

      return matchSearch && matchType;
    });
  }, [data, search, type]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const truncate = (text: string | null, max = 30) => {
    if (!text) return "-";
    return text.length > max ? text.slice(0, max) + "…" : text;
  };

  return (
    <div>
      {/* FILTER */}
      <div className="flex gap-2 p-4 border-b border-border bg-card">
        <input
          placeholder="Cari nama / nomor..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-border rounded-lg text-sm
    bg-background text-foreground
    placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as never);
            setPage(1);
          }}
          className="px-3 py-2 border border-border rounded-lg text-sm
    bg-background text-foreground
    focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <option value="all">Semua</option>
          <option value="anggota">Anggota</option>
          <option value="dai">Undang Da'i</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-border sticky top-0 z-10">
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Nama</th>
              <th className="p-3">Kontak</th>
              <th className="p-3">Tipe</th>
              <th className="p-3">Pesan</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="bg-card">
            {/* LOADING */}
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-border animate-pulse">
                  <td className="p-3">
                    <div className="h-3 bg-muted rounded w-32" />
                  </td>

                  <td className="p-3">
                    <div className="h-3 bg-muted rounded w-24" />
                  </td>

                  <td className="p-3">
                    <div className="h-3 bg-muted rounded w-16" />
                  </td>

                  <td className="p-3">
                    <div className="h-3 bg-muted rounded w-40" />
                  </td>

                  <td className="p-3">
                    <div className="h-3 bg-muted rounded w-24" />
                  </td>

                  <td className="p-3">
                    <div className="w-8 h-8 bg-muted rounded ml-auto" />
                  </td>
                </tr>
              ))}

            {/* EMPTY */}
            {!isLoading && paginated.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                >
                  Tidak ada data undangan
                </td>
              </tr>
            )}

            {/* DATA */}
            {!isLoading &&
              paginated.map((i) => (
                <tr
                  key={i.id}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="p-3 font-medium text-foreground">{i.name}</td>

                  <td className="p-3 text-muted-foreground">
                    <div>{i.phone}</div>
                    {i.email && (
                      <div className="text-xs text-muted-foreground">
                        {i.email}
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs
              ${
                i.type === "anggota"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-indigo-500/10 text-indigo-600"
              }`}
                    >
                      {i.type === "anggota" ? "Anggota" : "Undang Da'i"}
                    </span>
                  </td>

                  <td className="p-3 text-muted-foreground max-w-[220px] break-words">
                    {truncate(i.message)}
                  </td>

                  <td className="p-3 text-muted-foreground">
                    {new Date(i.created_at).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                    })}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      {/* DETAIL */}
                      <button
                        onClick={() => setSelected(i)}
                        className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/70 transition"
                      >
                        <InfoIcon size={16} />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => onDelete(i.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
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

      {/* PAGINATION */}
      <div className="flex justify-between items-center p-4 border-t border-border bg-card">
        <div className="text-xs text-muted-foreground">
          {isLoading ? "Memuat..." : `${filtered.length} undangan`}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border border-border rounded-md text-xs
      bg-background text-foreground
      hover:bg-muted transition
      disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          <span className="text-xs text-muted-foreground px-2">
            {page} / {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border border-border rounded-md text-xs
      bg-background text-foreground
      hover:bg-muted transition
      disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <DetailInvitation data={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
