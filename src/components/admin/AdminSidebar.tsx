import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import AdminDesktopSidebar from "./AdminDesktopSidebar";
import AdminMobileNav from "./AdminMobileNav";
import { adminMenu, AdminMenuItem } from "./adminMenu";
import { useAdmin } from "@/hooks/useAdmin";

// Definisikan tipe Props agar sesuai dengan error TS2322 di AdminLayout
type Props = {
  onCollapseChange: Dispatch<SetStateAction<boolean>>;
};

export default function AdminSidebar({ onCollapseChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { admin } = useAdmin();

  // Logic Filtering Menu berdasarkan Scope dan Role
  const filteredMenu = useMemo(() => {
    if (!admin) return [];

    return adminMenu.filter((item: AdminMenuItem) => {
      // 1. Validasi Scope (Wilayah)
      const hasScope = !item.scopes || item.scopes.includes(admin.scope);

      // 2. Validasi Role (Jabatan)
      const hasRole = !item.roles || item.roles.includes(admin.role);

      return hasScope && hasRole;
    });
  }, [admin]);

  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    if (saved) {
      const val = saved === "true";
      setCollapsed(val);
      // Sinkronisasi status ke parent (AdminLayout)
      onCollapseChange(val);
    }
  }, [onCollapseChange]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("adminSidebarCollapsed", String(next));
    // Update status ke parent saat tombol toggle diklik
    onCollapseChange(next);
  };

  return (
    <>
      <AdminDesktopSidebar
        collapsed={collapsed}
        toggleCollapse={toggleCollapse}
        menuItems={filteredMenu}
      />

      <AdminMobileNav menuItems={filteredMenu} />
    </>
  );
}
