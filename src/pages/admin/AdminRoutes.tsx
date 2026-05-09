import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import RoleRoute from "@/components/admin/RoleRoute";

import Dashboard from "./Dashboard";
import Articles from "./Articles";
import Events from "./Events";
import Gallery from "./Gallery";
import Programs from "./Programs";
import Settings from "./Settings";
import ManageUsers from "./ManageUsers";
import ProfilAdmin from "./Profile";
import RunningTexts from "./RunningTexts";
import Invitations from "./Invitations";
import AdminConsultations from "./ConsultationsQuestion";
import Consultations from "./Consultations";

// Definisi tipe yang akurat sesuai database
export type AdminScope = "jatim" | string;
export type AdminRole = "admin" | "editor" | "konsultan";

export default function AdminRoutes() {
  const allScopes: AdminScope[] = ["jatim", "daerah"];
  const staffRoles: AdminRole[] = ["admin", "editor"]; // Role yang mengurus konten
  const adminPusat: AdminRole[] = ["admin"];

  return (
    <ProtectedRoute>
      <Routes>
        {/* DASHBOARD & KONTEN: Hanya Admin & Editor */}
        <Route
          index
          element={
            <RoleRoute allowScope={allScopes} allowRole={staffRoles}>
              <Dashboard />
            </RoleRoute>
          }
        />
        <Route
          path="articles"
          element={
            <RoleRoute allowScope={allScopes} allowRole={staffRoles}>
              <Articles />
            </RoleRoute>
          }
        />
        <Route
          path="events"
          element={
            <RoleRoute allowScope={allScopes} allowRole={staffRoles}>
              <Events />
            </RoleRoute>
          }
        />
        <Route
          path="gallery"
          element={
            <RoleRoute allowScope={allScopes} allowRole={staffRoles}>
              <Gallery />
            </RoleRoute>
          }
        />

        {/* KHUSUS ADMIN PUSAT */}
        <Route
          path="programs"
          element={
            <RoleRoute allowScope={["jatim"]} allowRole={adminPusat}>
              <Programs />
            </RoleRoute>
          }
        />
        <Route
          path="runningtexts"
          element={
            <RoleRoute allowScope={["jatim"]} allowRole={adminPusat}>
              <RunningTexts />
            </RoleRoute>
          }
        />
        <Route
          path="invitations"
          element={
            <RoleRoute allowScope={["jatim"]} allowRole={adminPusat}>
              <Invitations />
            </RoleRoute>
          }
        />

        {/* RUANG KONSULTASI: Admin & Konsultan */}
        <Route
          path="jawab-konsultasi"
          element={
            <RoleRoute
              allowScope={["jatim"]}
              allowRole={["admin", "konsultan"]}
            >
              <AdminConsultations />
            </RoleRoute>
          }
        />
        <Route
          path="consultations"
          element={
            <RoleRoute
              allowScope={["jatim"]}
              allowRole={["admin", "konsultan"]}
            >
              <Consultations />
            </RoleRoute>
          }
        />

        {/* SISTEM */}
        <Route
          path="settings/profile"
          element={
            <RoleRoute
              allowScope={allScopes}
              allowRole={["admin", "editor", "konsultan"]}
            >
              <ProfilAdmin />
            </RoleRoute>
          }
        />
        <Route
          path="settings/users"
          element={
            <RoleRoute allowScope={["jatim"]} allowRole={adminPusat}>
              <ManageUsers />
            </RoleRoute>
          }
        />
        <Route
          path="settings"
          element={
            <RoleRoute allowScope={["jatim"]} allowRole={adminPusat}>
              <Settings />
            </RoleRoute>
          }
        />
      </Routes>
    </ProtectedRoute>
  );
}
