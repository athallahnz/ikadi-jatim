import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type Event = {
  id: string;
  title: string;
  excerpt: string | null;
  location: string | null;
  date: string | null;
  display_date: string | null;
  content: string;
  cover: string | null;
  created_at: string;
  published: boolean;
  publish_at: string | null;
};

type Props = {
  data: Event[];
  isLoading: boolean; // ✅ tambah
  onEdit: (e: Event) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (e: Event) => void;
};

export default function EventsDataTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">(
    "all",
  );
  const [page, setPage] = useState(1);

  const pageSize = 8;

  /* ================= DATE RESOLVE ================= */
  const getEventDate = (e: Event) =>
    new Date(e.date || e.publish_at || e.created_at);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    const now = new Date();

    return data.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        status === "all"
          ? true
          : status === "published"
            ? e.published
            : !e.published;

      const eventDate = getEventDate(e);

      const matchTime =
        timeFilter === "all"
          ? true
          : timeFilter === "upcoming"
            ? eventDate >= now
            : eventDate < now;

      return matchSearch && matchStatus && matchTime;
    });
  }, [data, search, status, timeFilter]);

  /* ================= SORT ================= */
  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => getEventDate(b).getTime() - getEventDate(a).getTime(),
    );
  }, [filtered]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-2 p-4 border-b bg-muted/30">
        <input
          placeholder="Cari event..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-lg text-sm"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as never);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={timeFilter}
          onChange={(e) => {
            setTimeFilter(e.target.value as never);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">Semua Waktu</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* TABLE */}
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="p-3">Event</th>
            <th className="p-3">Tanggal</th>
            <th className="p-3">Lokasi</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {/* LOADING */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-t animate-pulse">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-10 bg-muted rounded" />
                    <div className="h-4 w-40 bg-muted rounded" />
                  </div>
                </td>
                <td className="p-3">
                  <div className="h-3 w-20 bg-muted rounded" />
                </td>
                <td className="p-3">
                  <div className="h-3 w-24 bg-muted rounded" />
                </td>
                <td className="p-3">
                  <div className="h-4 w-16 bg-muted rounded" />
                </td>
                <td className="p-3">
                  <div className="h-6 w-24 bg-muted rounded ml-auto" />
                </td>
              </tr>
            ))}

          {/* DATA */}
          {!isLoading &&
            paginated.map((e) => {
              const dateLabel =
                e.display_date || getEventDate(e).toLocaleDateString();

              return (
                <tr
                  key={e.id}
                  className="border-t hover:bg-muted/30 transition"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {e.cover && (
                        <img
                          src={e.cover}
                          className="w-14 h-10 object-cover rounded"
                        />
                      )}
                      <div className="font-medium text-emerald-dark">
                        {e.title}
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-muted-foreground">{dateLabel}</td>
                  <td className="p-3 text-muted-foreground">
                    {e.location || "-"}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        e.published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {e.published ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onTogglePublish(e)}
                        className={`p-2 rounded-lg ${
                          e.published
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {e.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>

                      <button
                        onClick={() => onEdit(e)}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(e.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

          {/* EMPTY */}
          {!isLoading && paginated.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="text-center py-12 text-muted-foreground"
              >
                Tidak ada event ditemukan
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex justify-between items-center p-4 border-t">
        <div className="text-xs text-muted-foreground">
          {sorted.length} event
        </div>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded text-xs disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-xs px-2">
            {page} / {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
