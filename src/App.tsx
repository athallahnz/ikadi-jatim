import { Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";

// Pages
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
import KonsultasiDetail from "./pages/KonsultasiDetail";
import ProgramKuliahAgamaIslam from "@/pages/ProgramKuliahAgamaIslam";
import ProgramPembinaanDai from "@/pages/ProgramPembinaanDai";
import ProgramKonsultasi from "@/pages/ProgramKonsultasi";
import NotFound from "@/pages/NotFound";

// Admin & Auth
import Login from "@/pages/admin/Login";
import AdminRoutes from "@/pages/admin/AdminRoutes";
import ResetPassword from "./pages/admin/ResetPassword";
import ForgotPassword from "./pages/admin/ForgotPassword";
import Callback from "./auth/Callback";
import WaitingApproval from "./pages/admin/WaitingApproval";
import Rejected from "./pages/admin/Rejected";
import Blocked from "./pages/admin/Blocked";

// Styles
import "@fortawesome/fontawesome-free/css/all.min.css";
import PortalKonsultasi from "./components/PortalKonsultasi";

/* ================= TYPES & INTERFACES ================= */
// Mendefinisikan struktur Schema agar type-safe
interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    "@type": string;
    telephone: string;
    contactType: string;
  };
}

/* ================= CONFIGURATION ================= */
const organizationData: OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IKADI Jawa Timur",
  url: "https://ikadijatim.org",
  logo: "https://ikadijatim.org/assets/logo-ikadi.png",
  sameAs: [
    "https://facebook.com/ikadijatim",
    "https://instagram.com/ikadijatim",
    "https://youtube.com/ikadijatim",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+62 851-0175-1386", // Ganti dengan nomor resmi
    contactType: "customer service",
  },
};

/* ================= COMPONENT ================= */
function App() {
  return (
    <HelmetProvider>
      {/* Global SEO Injection */}
      <Helmet
        defaultTitle="IKADI Jawa Timur - Menebar Rahmat Melalui Dakwah"
        titleTemplate="%s | IKADI Jawa Timur"
      >
        <meta
          name="description"
          content="Ikatan Da'i Indonesia (IKADI) wilayah Jawa Timur. Pusat kajian Islam, pembinaan da'i, dan konsultasi syariah."
        />

        {/* Open Graph Global Default */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="IKADI Jawa Timur" />
        <meta property="og:url" content="https://ikadijatim.org" />
        <meta
          property="og:image"
          content="https://ikadijatim.org/assets/logo-ikadi.png"
        />

        <script type="application/ld+json">
          {JSON.stringify(organizationData)}
        </script>
      </Helmet>

      <Routes>
        {/* ================= AUTH & ADMIN SPECIAL ROUTES ================= */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<Callback />} />

        {/* User Status Pages */}
        <Route path="/admin/waiting-approval" element={<WaitingApproval />} />
        <Route path="/admin/rejected" element={<Rejected />} />
        <Route path="/admin/blocked" element={<Blocked />} />

        {/* Admin Dashboard (Nested) */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* ================= PUBLIC ROUTES (Inside Layout) ================= */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />

          {/* Tentang */}
          <Route path="tentang/profil" element={<Profile />} />
          <Route path="tentang/struktur" element={<Struktur />} />

          {/* Program Kerja */}
          <Route path="program/pembinaan" element={<ProgramPembinaanDai />} />
          <Route path="program/kuliah" element={<ProgramKuliahAgamaIslam />} />
          <Route path="program/konsultasi" element={<ProgramKonsultasi />} />

          {/* Kabar (Dynamic Routes) */}
          <Route path="kabar/:scope" element={<Kabar />} />
          <Route path="kabar/:scope/:slug" element={<KabarDetail />} />
          <Route path="kabar/:scope/:daerah/:slug" element={<KabarDetail />} />

          {/* Kajian (Dynamic Routes) */}
          <Route path="kajian" element={<Kajian />} />
          <Route path="kajian/:categorySlug" element={<Kajian />} />
          <Route path="kajian/:categorySlug/:slug" element={<KajianDetail />} />

          {/* Other Public Pages */}
          <Route path="galeri" element={<Galeri />} />
          <Route path="kolaborasi" element={<Kolaborasi />} />
          <Route path="konsultasi" element={<Konsultasi />} />
          <Route path="konsultasi/portal" element={<PortalKonsultasi />} />
          <Route path="/konsultasi/:slug" element={<KonsultasiDetail />} />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HelmetProvider>
  );
}

export default App;
