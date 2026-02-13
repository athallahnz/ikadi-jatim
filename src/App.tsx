import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SeasonBadge from "@/components/SeasonBadge";
import ScrollToTop from "@/components/ScrollToTop";

import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Struktur from "@/pages/Struktur";
import Kajian from "@/pages/Kajian";
import Kabar from "@/pages/Kabar";
import Galeri from "@/pages/Galeri";
import Kolaborasi from "@/pages/Kolaborasi";
import Konsultasi from "@/pages/Konsultasi";
import KabarDetail from "@/pages/KabarDetail";
import ProgramKuliahAgamaIslam from "@/pages/ProgramKuliahAgamaIslam";
import ProgramPembinaanDai from "@/pages/ProgramPembinaanDai";
import ProgramKonsultasi from "@/pages/ProgramKonsultasi";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <SeasonBadge />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tentang/profil" element={<Profile />} />
          <Route path="/tentang/struktur" element={<Struktur />} />
          <Route path="/program/pembinaan" element={<ProgramPembinaanDai />} />
          <Route path="/program/kuliah" element={<ProgramKuliahAgamaIslam />} />
          <Route path="/program/konsultasi" element={<ProgramKonsultasi />} />
          <Route path="/kabar/:scope" element={<Kabar />} />
          <Route path="/kabar/:scope/:slug" element={<KabarDetail />} />
          <Route path="/kabar/:scope/:daerah/:slug" element={<KabarDetail />} />
          <Route path="/kajian" element={<Kajian />} />
          <Route path="/galeri" element={<Galeri />} />
          <Route path="/kolaborasi" element={<Kolaborasi />} />
          <Route path="/konsultasi" element={<Konsultasi />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <FooterSection />
    </div>
  );
}

export default App;
