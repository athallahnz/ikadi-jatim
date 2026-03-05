import { useState, useEffect } from "react";
import AdminDesktopSidebar from "./AdminDesktopSidebar";
import AdminMobileNav from "./AdminMobileNav";

type Props = {
  onCollapseChange?: (collapsed: boolean) => void;
};

export default function AdminSidebar({ onCollapseChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");

    if (saved) {
      const val = saved === "true";
      setCollapsed(val);
      onCollapseChange?.(val);
    }
  }, [onCollapseChange]);

  const toggleCollapse = () => {
    const next = !collapsed;

    setCollapsed(next);
    localStorage.setItem("adminSidebarCollapsed", String(next));

    onCollapseChange?.(next);
  };

  return (
    <>
      <AdminDesktopSidebar
        collapsed={collapsed}
        toggleCollapse={toggleCollapse}
      />

      <AdminMobileNav />
    </>
  );
}
