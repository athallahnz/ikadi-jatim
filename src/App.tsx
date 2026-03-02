import { Routes, Route } from "react-router-dom";

// COMPONENTS
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SeasonBadge from "@/components/SeasonBadge";
import ScrollToTop from "@/components/ScrollToTop";

// PUBLIC PAGES
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Struktur from "@/pages/Struktur";
import Kajian from "@/pages/Kajian";
import KajianDetail from "./pages/KajianDetail"; // Cek kembali apakah @/pages/KajianDetail atau ./pages/
import Kabar from "@/pages/Kabar";
import Galeri from "@/pages/Galeri";
import Kolaborasi from "@/pages/Kolaborasi";
import Konsultasi from "@/pages/Konsultasi";
import KabarDetail from "@/pages/KabarDetail";
import ProgramKuliahAgamaIslam from "@/pages/ProgramKuliahAgamaIslam";
import ProgramPembinaanDai from "@/pages/ProgramPembinaanDai";
import ProgramKonsultasi from "@/pages/ProgramKonsultasi";
import NotFound from "@/pages/NotFound";

// ADMIN PAGES & ROUTES
import Login from "@/pages/admin/Login";
import AdminRoutes from "./pages/admin/AdminRoutes";
import RunningTextBar from "./components/RunningTextBar";
import MoonCursor from "./components/ui/MoonCursor";

import "@fortawesome/fontawesome-free/css/all.min.css";
// 1. Definisikan PublicLayout di luar atau di atas App agar rapi
function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <RunningTextBar />
      <main className="flex-1">
        <MoonCursor />
        <SeasonBadge />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="tentang/profil" element={<Profile />} />
          <Route path="tentang/struktur" element={<Struktur />} />
          <Route path="program/pembinaan" element={<ProgramPembinaanDai />} />
          <Route path="program/kuliah" element={<ProgramKuliahAgamaIslam />} />
          <Route path="program/konsultasi" element={<ProgramKonsultasi />} />

          {/* Kabar Section */}
          <Route path="kabar/:scope" element={<Kabar />} />
          <Route path="kabar/:scope/:slug" element={<KabarDetail />} />
          <Route path="kabar/:scope/:daerah/:slug" element={<KabarDetail />} />

          {/* Kajian Section */}
          <Route path="kajian" element={<Kajian />} />
          <Route path="kajian/:categorySlug" element={<Kajian />} />
          <Route path="kajian/:categorySlug/:slug" element={<KajianDetail />} />

          <Route path="galeri" element={<Galeri />} />
          <Route path="kolaborasi" element={<Kolaborasi />} />
          <Route path="konsultasi" element={<Konsultasi />} />

          {/* Catch-all untuk rute publik yang tidak terdaftar */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <FooterSection />
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Rute Admin Login - Independen (Tanpa Navbar/Footer Publik) */}
      <Route path="/admin/login" element={<Login />} />

      {/* Rute Dashboard Admin - Diteruskan ke AdminRoutes.js */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Rute Publik - Menangani semua path lainnya */}
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}

export default App;
