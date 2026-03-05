import { Outlet } from "react-router-dom";

import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SeasonBadge from "@/components/SeasonBadge";
import ScrollToTop from "@/components/ScrollToTop";
import RunningTextBar from "@/components/RunningTextBar";
import MoonCursor from "@/components/ui/MoonCursor";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <RunningTextBar />

      <main className="flex-1">
        <MoonCursor />
        <SeasonBadge />
        <ScrollToTop />
        <Outlet />
      </main>

      <FooterSection />
    </div>
  );
}
