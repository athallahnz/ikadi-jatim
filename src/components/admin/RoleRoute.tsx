import { Navigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";

type Props = {
  allow: ("jatim" | "daerah")[];
  children: React.ReactNode;
};

export default function RoleRoute({ allow, children }: Props) {
  const { admin, loading } = useAdmin();

  if (loading) return null;
  if (!admin) return <Navigate to="/login" />;

  if (!allow.includes(admin.scope)) {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
}
