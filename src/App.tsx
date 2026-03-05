import { Routes, Route } from "react-router-dom";

// layouts
import PublicLayout from "@/layouts/PublicLayout";

// pages
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Struktur from "@/pages/Struktur";
import Kajian from "@/pages/Kajian";
import KajianDetail from "@/pages/KajianDetail";
import Kabar from "@/pages/Kabar";
import KabarDetail from "@/pages/KabarDetail";
import Galeri from "@/pages/Galeri";
import Kolaborasi from "@/pages/Kolaborasi";
import Konsultasi from "@/pages/Konsultasi";
import ProgramKuliahAgamaIslam from "@/pages/ProgramKuliahAgamaIslam";
import ProgramPembinaanDai from "@/pages/ProgramPembinaanDai";
import ProgramKonsultasi from "@/pages/ProgramKonsultasi";
import NotFound from "@/pages/NotFound";

// admin
import Login from "@/pages/admin/Login";
import AdminRoutes from "@/pages/admin/AdminRoutes";

import "@fortawesome/fontawesome-free/css/all.min.css";
import ResetPassword from "./pages/admin/ResetPassword";
import ForgotPassword from "./pages/admin/ForgotPassword";
import Callback from "./auth/Callback";
import WaitingApproval from "./pages/admin/WaitingApproval";
import Rejected from "./pages/admin/Rejected";
import Blocked from "./pages/admin/Blocked";

function App() {
  return (
    <Routes>
      {/* ADMIN LOGIN */}
      <Route path="/admin/login" element={<Login />} />
      
      {/* PUBLIC ROUTES */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="/admin/waiting-approval" element={<WaitingApproval />} />
      <Route path="/admin/rejected" element={<Rejected />} />
      <Route path="/admin/blocked" element={<Blocked />} />
      
      {/* ADMIN DASHBOARD */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* PUBLIC ROUTES */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />

        <Route path="tentang/profil" element={<Profile />} />
        <Route path="tentang/struktur" element={<Struktur />} />

        <Route path="program/pembinaan" element={<ProgramPembinaanDai />} />
        <Route path="program/kuliah" element={<ProgramKuliahAgamaIslam />} />
        <Route path="program/konsultasi" element={<ProgramKonsultasi />} />

        {/* Kabar */}
        <Route path="kabar/:scope" element={<Kabar />} />
        <Route path="kabar/:scope/:slug" element={<KabarDetail />} />
        <Route path="kabar/:scope/:daerah/:slug" element={<KabarDetail />} />

        {/* Kajian */}
        <Route path="kajian" element={<Kajian />} />
        <Route path="kajian/:categorySlug" element={<Kajian />} />
        <Route path="kajian/:categorySlug/:slug" element={<KajianDetail />} />

        <Route path="galeri" element={<Galeri />} />
        <Route path="kolaborasi" element={<Kolaborasi />} />
        <Route path="konsultasi" element={<Konsultasi />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
