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
import AdminConsultations from "./AdminConsultations";
import Consultations from "./Consultations";

// Definisi tipe Role yang eksplisit
export type Role = "jatim" | "daerah";

export default function AdminRoutes() {
  const allAccess: Role[] = ["jatim", "daerah"];

  return (
    <ProtectedRoute>
      <Routes>
        <Route
          index
          element={
            <RoleRoute allow={allAccess}>
              <Dashboard />
            </RoleRoute>
          }
        />

        <Route
          path="articles"
          element={
            <RoleRoute allow={allAccess}>
              <Articles />
            </RoleRoute>
          }
        />

        <Route
          path="events"
          element={
            <RoleRoute allow={allAccess}>
              <Events />
            </RoleRoute>
          }
        />

        <Route
          path="gallery"
          element={
            <RoleRoute allow={allAccess}>
              <Gallery />
            </RoleRoute>
          }
        />

        <Route
          path="programs"
          element={
            <RoleRoute allow={allAccess}>
              <Programs />
            </RoleRoute>
          }
        />

        <Route
          path="runningtexts"
          element={
            <RoleRoute allow={allAccess}>
              <RunningTexts />
            </RoleRoute>
          }
        />

        <Route
          path="invitations"
          element={
            <RoleRoute allow={allAccess}>
              <Invitations />
            </RoleRoute>
          }
        />

        {/* PERBAIKAN: path disamakan dengan URL di menu admin */}
        <Route
          path="jawab-konsultasi"
          element={
            <RoleRoute allow={["jatim"]}>
              <AdminConsultations />
            </RoleRoute>
          }
        />

        <Route
          path="consultations"
          element={
            <RoleRoute allow={["jatim"]}>
              <Consultations />
            </RoleRoute>
          }
        />

        <Route
          path="settings"
          element={
            <RoleRoute allow={allAccess}>
              <Settings />
            </RoleRoute>
          }
        />

        <Route
          path="settings/users"
          element={
            <RoleRoute allow={["jatim"]}>
              <ManageUsers />
            </RoleRoute>
          }
        />

        <Route
          path="settings/profile"
          element={
            <RoleRoute allow={allAccess}>
              <ProfilAdmin />
            </RoleRoute>
          }
        />
      </Routes>
    </ProtectedRoute>
  );
}
