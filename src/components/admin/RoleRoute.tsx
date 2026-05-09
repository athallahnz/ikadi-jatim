import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Definisi tipe yang akurat sesuai database
type AdminScope = "jatim" | "daerah" | string;
type AdminRole = "admin" | "editor" | "konsultan";

type Props = {
  allowScope: AdminScope[]; // Guard untuk wilayah
  allowRole: AdminRole[]; // Guard untuk jabatan
  children: React.ReactNode;
};

export default function RoleRoute({ allowScope, allowRole, children }: Props) {
  const { admin, loading } = useAdmin();

  // 1. Handle Loading State
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. Auth Guard: Cek apakah user sudah login
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  // 3. Status Guard: Cek status akun
  if (admin.status === "pending") {
    return <Navigate to="/admin/waiting-approval" replace />;
  }

  if (admin.status === "rejected") {
    return <Navigate to="/admin/rejected" replace />;
  }

  if (admin.status === "blocked") {
    return <Navigate to="/admin/blocked" replace />;
  }

  // Pastikan hanya status 'active' yang bisa lewat
  if (admin.status !== "active") {
    return <Navigate to="/admin/waiting-approval" replace />;
  }

  // 4. Scope Guard: Cek izin wilayah (jatim/daerah)
  const hasScopeAccess = allowScope.includes(admin.scope);

  // 5. Role Guard: Cek izin jabatan (admin/editor/konsultan)
  const hasRoleAccess = allowRole.includes(admin.role as AdminRole);

  // Jika salah satu guard gagal, lempar kembali ke Dashboard utama
  if (!hasScopeAccess || !hasRoleAccess) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
