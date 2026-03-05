import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-md z-50">
      <div className="flex flex-col items-center gap-4 px-8 py-6 rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/30 shadow-xl">
        <Loader2 className="h-12 w-12 loader-soft animate-spin text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]" />

        <span className="text-sm text-muted-foreground">Loading data...</span>
      </div>
    </div>
  );
}
