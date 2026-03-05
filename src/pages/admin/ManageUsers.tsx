import { useEffect, useState, useCallback, useMemo } from "react";
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
  brand_logo?: string | null;
  created_at?: string;
  status: "pending" | "active" | "rejected" | "blocked";
};

export default function ManageUsers() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // State untuk Modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ✅ State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAdmin | null>(null);

  const filteredUsers = useMemo(() => {
    if (!search) return users;

    const q = search.toLowerCase();

    return users.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        (u.brand_name || "").toLowerCase().includes(q) ||
        (u.daerah || "").toLowerCase().includes(q)
      );
    });
  }, [users, search]);

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
        const { data, error } = await supabase
          .from("admins")
          .delete()
          .eq("id", id)
          .select();
        console.log("deleted:", data);
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

  const updateStatus = async (id: string, status: string) => {
    const result = await Swal.fire({
      title: "Ubah Status?",
      text: `Status akan diubah menjadi "${status}"`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Update",
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from("admins")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      await fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Status diperbarui",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal update status",
      });
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
          <h1 className="text-2xl font-display text-foreground">
            Manage Users
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Kelola daftar admin pusat dan admin cabang daerah.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white
    px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition active:scale-95"
        >
          <UserPlus size={18} />
          Tambah Admin Baru
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* SEARCH BAR */}
        <div className="p-4 border-b border-border bg-muted/40">
          <input
            placeholder="Cari admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm
      bg-background text-foreground
      placeholder:text-muted-foreground
      focus:outline-none focus:ring-2 focus:ring-emerald-500/30
      w-full max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-muted-foreground bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Admin</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Scope / Daerah</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {/* ================= LOADING ================= */}
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted rounded w-40 mb-2" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </td>

                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted rounded w-16" />
                    </td>

                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted rounded w-32" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="h-7 w-7 bg-muted rounded" />
                        <div className="h-7 w-7 bg-muted rounded" />
                      </div>
                    </td>
                  </tr>
                ))}

              {/* ================= EMPTY ================= */}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Tidak ada admin ditemukan
                  </td>
                </tr>
              )}

              {/* ================= DATA ================= */}
              {!loading &&
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-muted/40 transition"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {u.name}

                      {u.brand_name && (
                        <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                          {u.brand_name}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 capitalize">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-medium
                  ${
                    u.role === "admin"
                      ? "bg-purple-500/10 text-purple-600"
                      : "bg-blue-500/10 text-blue-600"
                  }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {u.scope === "jatim" ? (
                        <span className="text-emerald-600 font-semibold">
                          Jatim (Pusat)
                        </span>
                      ) : (
                        <span className="text-amber-600">
                          Cabang {u.daerah}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={u.status}
                        onChange={(e) => updateStatus(u.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border border-border
                  bg-background
                  ${
                    u.status === "active"
                      ? "text-green-600"
                      : u.status === "pending"
                        ? "text-yellow-600"
                        : u.status === "blocked"
                          ? "text-red-600"
                          : "text-muted-foreground"
                  }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="rejected">Rejected</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/70 transition"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(u.id, u.name)}
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
