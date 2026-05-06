import { useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "react-router-dom"; // Tambahkan ini
import { useConsultation } from "@/hooks/useConsultation";
import ConsultationCard from "@/components/ui/ConsultationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartIcon, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import Komponen Terpisah
import ConsultationFilter from "@/components/ConsultationFilter";
import ConsultationAbout from "@/components/ConsultationAbout";
import ConsultationForm from "@/components/ConsultationForm";
import ConsultationTeam from "@/components/ConsultationTeam";
import PortalKonsultasi from "@/components/PortalKonsultasi";
import FloatingChatWidget from "@/components/FloatingChatWidget";

const Konsultasi = () => {
  const [page, setPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("arsip");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchParams] = useSearchParams();   

  const itemsPerPage = 10;

  const { data, categories, totalCount, loading, error } = useConsultation(
    page,
    itemsPerPage,
    selectedCategorySlug,
    searchQuery,
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const tabs = [
    { id: "arsip", label: "Arsip Konsultasi" },
    { id: "tanya", label: "Tanya Ustadz" },
    { id: "portal", label: "Portal Jawaban" },
    { id: "tentang", label: "Tentang Kami" },
    { id: "team", label: "Tim Kami" },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, selectedCategorySlug, activeTab, searchQuery]);

  // Logic untuk membuat tab aktif selalu di tengah pada mobile
  useEffect(() => {
    const activeTabElement = document.getElementById(`tab-${activeTab}`);
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
    setActiveTab("arsip");
  };

  if (error) {
    return (
      <div className="py-20 text-center text-red-500 font-medium">
        Error memuat data: {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cream islamic-pattern relative z-10 transition-colors duration-500 pt-20 xl:pt-24">
      {/* HEADER SECTION */}
      <header className="bg-cream dark:bg-emerald-950 transition-colors duration-500 overflow-hidden">
        <div className="container mx-auto pt-12 md:pt-24 pb-8 md:pb-16 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] md:text-xs font-bold tracking-widest uppercase border border-emerald-100 dark:border-emerald-800 shadow-sm mb-6 w-fit">
                <HeartIcon className="h-3 w-3 md:h-3.5 animate-pulse" />
                Selamat Datang di Layanan Tanya Jawab Syariah
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-black text-foreground tracking-tight leading-none text-center md:text-left">
                <span className="italic text-emerald-700 dark:text-white">
                  konsultasisyariah.net
                </span>
              </h1>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2 group">
              <span className="text-[10px] md:text-[12px] uppercase tracking-widest font-black text-muted-foreground/60">
                Powered by
              </span>
              <a
                href="http://lmizakat.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-all duration-300 hover:scale-105"
              >
                <img
                  src="/lmi-logos.png"
                  alt="LMI Logo"
                  className="h-12 md:h-16 transition-all"
                />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* STICKY NAVIGATION BAR */}
      <nav className="sticky top-[117px] md:top-[107px] xl:top-[137px] z-[40] bg-white/80 dark:bg-emerald-950/80 backdrop-blur-xl border-b border-emerald-100/50 dark:border-emerald-900/50 transition-all duration-500">
        <div className="container mx-auto px-6 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full relative">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto px-4 py-2 md:px-2.5 snap-x scroll-px-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative snap-center px-5 py-2.5 rounded-xl text-[11px] md:text-sm font-bold transition-all duration-500 overflow-hidden flex-shrink-0 ${
                    activeTab === tab.id
                      ? "text-white shadow-lg scale-105"
                      : "text-emerald-700 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-600 animate-in fade-in duration-300" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="w-full md:w-auto px-4 md:px-0">
              <form
                onSubmit={handleSearch}
                className={`relative w-full md:w-[220px] lg:w-[260px] animate-in md:slide-in-from-right-4 duration-300 ${isSearchOpen ? "flex" : "flex md:hidden"}`}
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari persoalan..."
                  className="w-full bg-white dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-full pl-5 pr-12 py-3 md:py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    if (window.innerWidth >= 768) setIsSearchOpen(false);
                  }}
                  className="absolute right-4 md:right-3 top-1/2 -translate-y-1/2 p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-800 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 md:h-4 md:w-4" />
                </button>
              </form>
              {!isSearchOpen && (
                <div className="hidden md:flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                    className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 h-10 w-10 text-emerald-700 hover:bg-emerald-100 transition-all"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            {activeTab === "arsip" && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-emerald-100 pb-4">
                  <h3 className="font-display font-bold text-2xl">
                    {searchQuery
                      ? `Hasil Pencarian: "${searchQuery}"`
                      : selectedCategorySlug
                        ? `Topik: ${categories.find((c) => c.slug === selectedCategorySlug)?.name}`
                        : "Pembahasan Terbaru"}
                  </h3>
                  <Badge variant="outline" className="hidden md:flex">
                    {totalCount} Arsip
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading
                    ? [...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[300px] rounded-2xl" />
                      ))
                    : data.map((item) => (
                        <ConsultationCard
                          key={item.id}
                          data={{
                            id: item.id,
                            title: item.title,
                            category:
                              item.consultation_categories?.name || "Umum",
                            excerpt: item.question,
                            date: new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            ),
                            slug: item.slug,
                          }}
                        />
                      ))}
                </div>

                {!loading && totalPages > 1 && (
                  <div className="flex items-center gap-3 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-bold px-4 py-2 bg-background border rounded-xl">
                      {page} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            {activeTab === "tanya" && (
              <ConsultationForm onGoToPortal={() => setActiveTab("portal")} />
            )}
            {activeTab === "portal" && <PortalKonsultasi />}
            {activeTab === "tentang" && <ConsultationAbout />}
            {activeTab === "team" && <ConsultationTeam />}
          </div>

          <aside className="lg:col-span-4">
            <ConsultationFilter
              categories={categories}
              selectedCategorySlug={selectedCategorySlug}
              isLoading={loading}
              onSelectCategory={(slug) => {
                setSelectedCategorySlug(slug);
                setSearchQuery("");
                setSearchInput("");
                setPage(1);
                setActiveTab("arsip");
              }}
            />
          </aside>
        </div>
      </section>

      {/* RAG CHAT WIDGET */}
      <FloatingChatWidget onDirectConsult={() => setActiveTab("tanya")} />
    </main>
  );
};

export default Konsultasi;
