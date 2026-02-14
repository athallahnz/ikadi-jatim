import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import EventForm from "./EventForm";
import { useAdmin } from "@/hooks/useAdmin";
import Swal from "sweetalert2"; // ✅ Import SweetAlert

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

export default function Events() {
  const { admin } = useAdmin();
  const [events, setEvents] = useState<Event[]>([]);
  const [editing, setEditing] = useState<Event | null>(null);

  const fetchEvents = useCallback(async () => {
    let query = supabase
      .from("events")
      .select("*")
      .order("publish_at", { ascending: false });

    if (admin?.scope === "daerah") {
      query = query.eq("daerah_slug", admin.daerah_slug);
    }

    const { data } = await query;
    setEvents((data as Event[]) || []);
  }, [admin]);

  useEffect(() => {
    if (admin) fetchEvents();
  }, [admin, fetchEvents]);

  /* ================= TOGGLE PUBLISH ================= */
  const handleTogglePublish = async (event: Event) => {
    try {
      Swal.fire({
        title: "Memproses...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const { error } = await supabase
        .from("events")
        .update({ published: !event.published })
        .eq("id", event.id);

      if (error) throw error;

      await fetchEvents();

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Event berhasil di-${event.published ? "unpublish" : "publish"}.`,
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
      text: "Event yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Warna merah untuk hapus
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

        const { error } = await supabase.from("events").delete().eq("id", id);

        if (error) throw error;

        await fetchEvents();

        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Event berhasil dihapus.",
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
            Agenda / Events
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola Data Agenda / Events untuk publish ke Pubilc.
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <EventForm
            event={editing}
            onSaved={() => {
              fetchEvents();
              setEditing(null);
            }}
          />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between gap-4 p-4 border-b last:border-0 hover:bg-muted/30 transition"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              {e.cover && (
                <img src={e.cover} className="w-16 h-12 object-cover rounded" />
              )}

              <div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      e.published
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {e.published ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="font-medium text-emerald-dark">{e.title}</div>

                <div className="text-xs text-muted-foreground">
                  {e.display_date ||
                    new Date(e.publish_at || e.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 transition"
                onClick={() => handleTogglePublish(e)} // ✅ Panggil fungsi baru
              >
                {e.published ? "Unpublish" : "Publish"}
              </button>

              <button
                className="text-xs px-3 py-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition"
                onClick={() => setEditing(e)}
              >
                Edit
              </button>

              <button
                className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                onClick={() => handleDelete(e.id)} // ✅ Panggil fungsi baru
              >
                Hapus
              </button>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            Belum ada event
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
