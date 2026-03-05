import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar onCollapseChange={setCollapsed} />

      {/* Main Layout */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          collapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* Header */}
        <AdminHeader />

        {/* Content */}
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
