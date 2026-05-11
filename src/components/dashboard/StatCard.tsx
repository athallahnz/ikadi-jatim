import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  trend: string;
  description: string;
  colorClass: string;
  isLoading?: boolean;
}

export default function StatCard({
  title,
  count,
  icon: Icon,
  trend,
  description,
  colorClass,
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-emerald-950/80 p-6 shadow-sm">
        {/* shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 w-24 rounded-md bg-emerald-100 dark:bg-emerald-900/50 mb-4 animate-pulse" />

            <div className="h-9 w-20 rounded-md bg-emerald-200 dark:bg-emerald-800/60 mb-5 animate-pulse" />

            <div className="space-y-2">
              <div className="h-3 w-28 rounded-md bg-emerald-100 dark:bg-emerald-900/50 animate-pulse" />

              <div className="h-3 w-40 rounded-md bg-emerald-100 dark:bg-emerald-900/40 animate-pulse" />
            </div>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-emerald-950/80 p-6 shadow-sm transition-all"
    >
      <div
        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-10 ${colorClass}`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">
            {title}
          </p>

          <h3 className="text-3xl font-bold text-emerald-950 dark:text-white">
            {count}
          </h3>

          <div className="mt-3 space-y-1">
            <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={12} />
              {trend}
            </p>

            <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
              {description}
            </p>
          </div>
        </div>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/40 ${colorClass.replace(
            "bg-",
            "text-",
          )}`}
        >
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}
