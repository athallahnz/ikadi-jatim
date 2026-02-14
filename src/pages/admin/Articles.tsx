import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import ArticleForm from "./ArticleForm";
import { useAdmin } from "@/hooks/useAdmin";
import Swal from "sweetalert2"; // ✅ Jangan lupa import ini

type Article = {
  id: string;
  title: string;
  content: string;
  cover_url: string | null;
  created_at: string;
  published: boolean;
  category_id?: string | null;
  categories?: {
    name: string;
  } | null;
};

export default function Articles() {
  const { admin } = useAdmin();
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);

  const fetchArticles = useCallback(async () => {
    let query = supabase
      .from("articles")
      .select(`*, categories ( name )`)
      .order("publish_at", { ascending: false });

    if (admin?.scope === "daerah") {
      query = query.eq("daerah_slug", admin.daerah_slug);
    }

    const { data } = await query;
    setArticles((data as Article[]) || []);
  }, [admin]);

  useEffect(() => {
    if (admin) {
      fetchArticles();
    }
  }, [admin, fetchArticles]);

  /* ================= TOGGLE PUBLISH ================= */
  const handleTogglePublish = async (article: Article) => {
    try {
      Swal.fire({
        title: "Memproses...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const { error } = await supabase
        .from("articles")
        .update({ published: !article.published })
        .eq("id", article.id);

      if (error) throw error;

      await fetchArticles();

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Artikel berhasil di-${article.published ? "unpublish" : "publish"}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: errorMessage,
      });
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    // Tampilkan konfirmasi sebelum menghapus
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Artikel yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Warna merah untuk tombol hapus
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Menghapus...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const { error } = await supabase.from("articles").delete().eq("id", id);

        if (error) throw error;

        await fetchArticles();

        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Artikel berhasil dihapus.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Terjadi kesalahan.";
        Swal.fire({
          icon: "error",
          title: "Gagal Menghapus",
          text: errorMessage,
        });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display text-emerald-dark">
            Kajian & Artikel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola Data Kajin / Artikel untuk publish ke Pubilc.
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <ArticleForm
            article={editing}
            onSaved={() => {
              fetchArticles();
              setEditing(null);
            }}
          />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {articles.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-4 p-4 border-b last:border-0 hover:bg-muted/30 transition"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              {a.cover_url && (
                <img
                  src={a.cover_url}
                  className="w-16 h-12 object-cover rounded"
                />
              )}

              <div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      a.published
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {a.published ? "Published" : "Draft"}
                  </span>

                  {/* Kategori */}
                  {/* Gunakan pengecekan array jika "categories" adalah array of object, 
                      tapi biasanya foreign key tunggal mengembalikan object tunggal, bukan array.
                      Sesuaikan dengan hasil query Supabase kamu. */}
                  {a.categories && !Array.isArray(a.categories) && (
                    <span className="text-muted-foreground">
                      {a.categories.name}
                    </span>
                  )}
                  {/* Jika mengembalikan array: a.categories?.[0]?.name */}
                  {Array.isArray(a.categories) && a.categories[0]?.name && (
                    <span className="text-muted-foreground">
                      {a.categories[0].name}
                    </span>
                  )}
                </div>

                <div className="font-medium text-emerald-dark">{a.title}</div>

                <div className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 transition"
                onClick={() => handleTogglePublish(a)} // ✅ Panggil fungsi baru
              >
                {a.published ? "Unpublish" : "Publish"}
              </button>

              <button
                className="text-xs px-3 py-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition"
                onClick={() => setEditing(a)}
              >
                Edit
              </button>

              <button
                className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                onClick={() => handleDelete(a.id)} // ✅ Panggil fungsi baru
              >
                Hapus
              </button>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            Belum ada artikel
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
