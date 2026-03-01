import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import EventForm from "./EventForm";
import { useAdmin } from "@/hooks/useAdmin";
import Swal from "sweetalert2"; // ✅ Import SweetAlert
import EventsDataTable from "./EventsDataTable";

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
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);

    let query = supabase
      .from("events")
      .select("*")
      .order("publish_at", { ascending: false });

    if (admin?.scope === "daerah") {
      query = query.eq("daerah_slug", admin.daerah_slug);
    }

    const { data, error } = await query;

    if (!error) {
      setEvents((data as Event[]) || []);
    } else {
      console.error(error);
    }

    setIsLoading(false);
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
        <EventsDataTable
          data={events}
          isLoading={isLoading} // ✅ tambah
          onEdit={(e) => setEditing(e)}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
        />
      </div>
    </AdminLayout>
  );
}
