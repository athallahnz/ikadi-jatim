import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import CreateUser from "./CreateUser";
import EditUserModal from "./EditUserModal"; // ✅ IMPORT MODAL EDIT BARU
import { UserPlus, Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";

type UserAdmin = {
  id: string;
  name: string;
  role: string;
  scope: string;
  daerah: string | null;
  brand_name: string | null;
  brand_logo?: string | null; // ✅ Tambahkan ini
  created_at?: string;
};

export default function ManageUsers() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ✅ State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAdmin | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Hapus Admin?",
      text: `Apakah Anda yakin ingin menghapus ${name}? Akses dashboard mereka akan dicabut.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: "Menghapus...", didOpen: () => Swal.showLoading() });
        const { error } = await supabase.from("admins").delete().eq("id", id);
        if (error) throw error;
        await fetchUsers();
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Admin berhasil dihapus.",
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

  // ✅ Fungsi untuk membuka modal edit
  const handleEditClick = (user: UserAdmin) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-emerald-dark">
            Manage Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola daftar admin pusat dan admin cabang daerah.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition active:scale-95"
        >
          <UserPlus size={18} />
          Tambah Admin Baru
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-emerald-900 uppercase bg-emerald-50/50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Admin</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Scope / Daerah</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Belum ada data admin.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4 font-medium text-emerald-dark">
                      {u.name}
                      {u.brand_name && (
                        <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                          {u.brand_name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.scope === "jatim" ? (
                        <span className="text-emerald-700 font-semibold">
                          Jatim (Pusat)
                        </span>
                      ) : (
                        <span className="text-amber-700">
                          Cabang {u.daerah}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* ✅ Tombol Edit sekarang memanggil fungsi handleEditClick */}
                        <button
                          onClick={() => handleEditClick(u)}
                          className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition"
                          title="Edit Profil"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                          title="Hapus"
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
      </div>

      {/* MODAL CREATE USER */}
      <CreateUser
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchUsers();
        }}
      />

      {/* ✅ MODAL EDIT USER BARU DITAMBAHKAN */}
      <EditUserModal
        isOpen={isEditModalOpen}
        userData={editingUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
          fetchUsers();
        }}
      />
    </AdminLayout>
  );
}
