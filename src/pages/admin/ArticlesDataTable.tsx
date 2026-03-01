import { EyeOff, Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type Article = {
  id: string;
  title: string;
  content: string;
  cover_url: string | null;
  created_at: string;
  published: boolean;
  categories?: { name: string } | null;
};

type Props = {
  data: Article[];
  onEdit: (a: Article) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (a: Article) => void;
  isLoading?: boolean; // ✅ NEW
};

export default function ArticlesDataTable({
  data,
  onEdit,
  onDelete,
  onTogglePublish,
  isLoading = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const pageSize = 8;

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return data.filter((a) => {
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        status === "all"
          ? true
          : status === "published"
            ? a.published
            : !a.published;

      const catName = Array.isArray(a.categories)
        ? a.categories[0]?.name
        : a.categories?.name;

      const matchCategory = category === "all" ? true : catName === category;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [data, search, status, category]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ================= UNIQUE CATEGORIES ================= */
  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((a) => {
      const name = Array.isArray(a.categories)
        ? a.categories[0]?.name
        : a.categories?.name;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [data]);

  return (
    <div>
      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-2 p-4 border-b bg-muted/30">
        <input
          placeholder="Cari judul..."
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
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="p-3">Artikel</th>
            <th className="p-3">Kategori</th>
            <th className="p-3">Tanggal</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {/* ================= LOADING ================= */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-t animate-pulse">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-10 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-40" />
                  </div>
                </td>
                <td className="p-3">
                  <div className="h-3 bg-muted rounded w-20" />
                </td>
                <td className="p-3">
                  <div className="h-3 bg-muted rounded w-24" />
                </td>
                <td className="p-3">
                  <div className="h-4 bg-muted rounded w-16" />
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <div className="w-8 h-8 bg-muted rounded" />
                    <div className="w-8 h-8 bg-muted rounded" />
                    <div className="w-8 h-8 bg-muted rounded" />
                  </div>
                </td>
              </tr>
            ))}

          {/* ================= EMPTY ================= */}
          {!isLoading && paginated.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="text-center py-12 text-muted-foreground"
              >
                Tidak ada artikel ditemukan
              </td>
            </tr>
          )}

          {/* ================= DATA ================= */}
          {!isLoading &&
            paginated.map((a) => {
              const cat = Array.isArray(a.categories)
                ? a.categories[0]?.name
                : a.categories?.name;

              return (
                <tr
                  key={a.id}
                  className="border-t hover:bg-muted/30 transition"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {a.cover_url && (
                        <img
                          src={a.cover_url}
                          className="w-14 h-10 object-cover rounded"
                        />
                      )}
                      <div className="font-medium text-emerald-dark">
                        {a.title}
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-muted-foreground">{cat || "-"}</td>

                  <td className="p-3 text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        a.published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {a.published ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onTogglePublish(a)}
                        className={`p-2 rounded-lg transition ${
                          a.published
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        }`}
                      >
                        {a.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>

                      <button
                        onClick={() => onEdit(a)}
                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(a.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex justify-between items-center p-4 border-t">
        <div className="text-xs text-muted-foreground">
          {isLoading ? "Memuat..." : `${filtered.length} artikel`}
        </div>

        <div className="flex gap-2">
          <button
            disabled={page === 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded text-xs disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-xs mt-1">
            {page} / {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || isLoading}
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
