import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import InvitationsDataTable, { Invitation } from "./InvitationsDataTable";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

export default function Invitations() {
  const [data, setData] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvitations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const deleteInvitation = async (id: string) => {
    const res = await Swal.fire({
      title: "Hapus undangan?",
      text: "Data tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Hapus",
    });

    if (!res.isConfirmed) return;

    await supabase.from("invitations").delete().eq("id", id);

    setData((prev) => prev.filter((i) => i.id !== id));

    Swal.fire("Terhapus", "Data undangan dihapus", "success");
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display text-emerald-dark">
          Undangan & Pendaftaran
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Data permintaan anggota dan undangan da'i dari website publik
        </p>
      </div>

      <div className="bg-white border rounded-xl shadow-sm">
        <InvitationsDataTable
          data={data}
          onDelete={deleteInvitation}
          isLoading={loading}
        />
      </div>
    </AdminLayout>
  );
}
