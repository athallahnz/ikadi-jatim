import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react"; // Tambahkan icon untuk error state

interface Category {
  id: string | number;
  name: string;
  slug: string;
  count: number;
}

interface ConsultationFilterProps {
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  isLoading?: boolean;
  isError?: boolean; // Tambahkan prop isError untuk menangani timeout
  onRetry?: () => void; // Fungsi untuk mencoba fetch ulang
}

const ConsultationFilter = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  isLoading = false,
  isError = false,
  onRetry,
}: ConsultationFilterProps) => {
  return (
    <div className="bg-white dark:bg-emerald-950/80 backdrop-blur-xl rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/50 p-8 sticky top-32 shadow-xl shadow-emerald-900/5 transition-all duration-500">
      {/* HEADER SECTION */}
      <h3 className="font-display font-bold text-xl mb-8 flex items-center gap-3 text-emerald-950 dark:text-emerald-50">
        <div className="relative flex h-3 w-3">
          <Badge className="bg-emerald-600 dark:bg-emerald-400 h-full w-full rounded-full p-0 animate-pulse opacity-75 absolute" />
          <Badge className="bg-emerald-700 dark:bg-emerald-500 h-full w-full rounded-full p-0 relative" />
        </div>
        Filter Kategori
      </h3>

      <div className="space-y-3">
        {isLoading ? (
          /* SKELETON LOADING STATE */
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[54px] rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 animate-pulse border border-emerald-50/10 dark:border-emerald-800/20"
            />
          ))
        ) : isError ? (
          /* ERROR STATE: Menangani Timeout (Error 57014) */
          <div className="text-center py-8 px-4 bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/30">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-3 opacity-70" />
            <p className="text-[11px] text-red-700 dark:text-red-400 font-bold uppercase tracking-tight mb-4">
              Gagal Memuat Kategori
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8 text-[10px] rounded-full border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-400 font-black"
            >
              <RefreshCw className="h-3 w-3 mr-2" /> COBA LAGI
            </Button>
          </div>
        ) : (
          /* CATEGORY LIST */
          <>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all duration-300 group ${
                  selectedCategorySlug === cat.slug
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    : "border-transparent hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 hover:border-emerald-100 dark:hover:border-emerald-800"
                }`}
              >
                <span
                  className={`text-sm font-bold transition-colors ${
                    selectedCategorySlug === cat.slug
                      ? "text-emerald-900 dark:text-emerald-200"
                      : "text-emerald-800/70 dark:text-emerald-500 group-hover:text-emerald-950 dark:group-hover:text-emerald-300"
                  }`}
                >
                  {cat.name}
                </span>

                <Badge
                  variant="secondary"
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all duration-300 ${
                    selectedCategorySlug === cat.slug
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                      : "bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800"
                  }`}
                >
                  {Number(cat.count || 0).toLocaleString("id-ID")}
                </Badge>
              </button>
            ))}

            {/* EMPTY STATE */}
            {categories.length === 0 && (
              <div className="text-center py-10 px-4 border border-dashed border-emerald-100 dark:border-emerald-900 rounded-3xl">
                <p className="text-xs text-emerald-600/50 dark:text-emerald-400/40 font-medium italic">
                  Belum ada kategori yang tersedia
                </p>
              </div>
            )}
          </>
        )}

        {/* RESET FILTER BUTTON */}
        {selectedCategorySlug && !isLoading && !isError && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[10px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 mt-4 rounded-xl font-black transition-all uppercase tracking-[0.2em]"
            onClick={() => onSelectCategory(null)}
          >
            Bersihkan Filter
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConsultationFilter;
