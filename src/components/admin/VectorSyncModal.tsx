import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Sparkles, Minus, Maximize2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface VectorSyncModalProps {
  jobId: string;
  onClose: () => void;
}

interface SyncJobData {
  status: "running" | "completed" | "failed" | "idle";
  total_rows: number;
  processed_rows: number;
  error_message?: string;
}

export default function VectorSyncModal({
  jobId,
  onClose,
}: VectorSyncModalProps) {
  const [data, setData] = useState<SyncJobData | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // 1. Ambil data awal saat modal pertama kali muncul
    const fetchInitial = async () => {
      const { data: job, error } = await supabase
        .from("vector_sync_jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();

      if (error) {
        console.error("Fetch initial job error:", error.message);
        return;
      }

      if (job) setData(job as SyncJobData);
    };

    fetchInitial();

    // 2. Setup Realtime subscription untuk memantau progress
    const channel = supabase
      .channel(`sync-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vector_sync_jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          setData(payload.new as SyncJobData);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  // Loading state jika data belum ditarik
  if (!data) return null;

  const progressValue =
    data.total_rows > 0 ? (data.processed_rows / data.total_rows) * 100 : 0;

  // --- VIEW: MINIMIZED (Pill Mode) ---
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-right-10 duration-500">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 bg-emerald-600 text-white p-3 rounded-2xl shadow-2xl hover:scale-105 transition-all group"
        >
          <div className="relative">
            <Sparkles size={18} className="animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border-2 border-emerald-600" />
          </div>
          <div className="flex flex-col items-start leading-none pr-2">
            <span className="text-[10px] font-bold uppercase opacity-80">
              AI Syncing
            </span>
            <span className="text-sm font-black">
              {Math.round(progressValue)}%
            </span>
          </div>
          <div className="bg-white/20 p-1 rounded-lg">
            <Maximize2 size={12} />
          </div>
        </button>
      </div>
    );
  }

  // --- VIEW: MODAL FULL ---
  return (
    <div className="fixed bottom-6 right-6 z-[60] w-80 bg-card border border-emerald-500/20 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-black/40 overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="p-4 bg-emerald-600 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">
            AI Vector Sync
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-950/50 to-transparent">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
            Status Proses
          </p>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">
              {data.status === "running" && "Sedang Mengolah Data..."}
              {data.status === "completed" && "Selesai Sempurna"}
              {data.status === "failed" && "Terjadi Kesalahan"}
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {Math.round(progressValue)}%
            </span>
          </div>
        </div>

        <Progress
          value={progressValue}
          className="h-2 bg-emerald-100 dark:bg-emerald-900/40"
        />

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-muted/10 p-3 rounded-2xl border border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">
              Total
            </p>
            <p className="text-lg font-black">{data.total_rows}</p>
          </div>
          <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">
              Processed
            </p>
            <p className="text-lg font-black">{data.processed_rows}</p>
          </div>
        </div>

        {data.error_message && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 rounded-xl flex gap-2">
            <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-rose-600 dark:text-rose-400 leading-tight italic">
              {data.error_message}
            </p>
          </div>
        )}

        {data.status === "completed" && (
          <Button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs h-9"
          >
            Selesaikan Sesi
          </Button>
        )}
      </div>
    </div>
  );
}
