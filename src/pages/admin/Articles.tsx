import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import ArticleForm from "./ArticleForm";
import { useAdmin } from "@/hooks/useAdmin";
import Swal from "sweetalert2";
import ArticlesDataTable from "./ArticlesDataTable";

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
  const [isLoading, setIsLoading] = useState(true); // ✅ true awal

  const fetchArticles = useCallback(async () => {
    setIsLoading(true); // mulai loading

    let query = supabase
      .from("articles")
      .select(`*, categories ( name )`)
      .order("publish_at", { ascending: false });

    if (admin?.scope === "daerah") {
      query = query.eq("daerah_slug", admin.daerah_slug);
    }

    const { data, error } = await query;

    if (!error) {
      setArticles((data as Article[]) || []);
    } else {
      console.error(error);
    }

    setIsLoading(false); // selesai loading
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
        <ArticlesDataTable
          data={articles}
          isLoading={isLoading}
          onEdit={(a) => setEditing(a)}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
        />
      </div>
    </AdminLayout>
  );
}
