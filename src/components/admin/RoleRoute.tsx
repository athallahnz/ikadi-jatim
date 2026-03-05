import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Scope = "jatim" | "daerah";

type Props = {
  allow: Scope[];
  children: React.ReactNode;
};

export default function RoleRoute({ allow, children }: Props) {
  const { admin, loading } = useAdmin();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (admin.status === "pending") {
    return <Navigate to="/admin/waiting-approval" replace />;
  }

  if (admin.status === "rejected") {
    return <Navigate to="/admin/rejected" replace />;
  }

  if (admin.status === "blocked") {
    return <Navigate to="/admin/blocked" replace />;
  }

  if (admin.status !== "active") {
    return <Navigate to="/admin/waiting-approval" replace />;
  }

  if (!allow.includes(admin.scope)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
