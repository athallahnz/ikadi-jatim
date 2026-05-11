import { motion } from "framer-motion";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { AnalyticsData, MotionVariantProps } from "@/types/database";

interface Props extends MotionVariantProps {
  analytics: AnalyticsData[];
  isLoading?: boolean;
}

export default function AnalyticsChart({
  analytics,
  itemVariants,
  isLoading = false,
}: Props) {
  if (isLoading) {
    return (
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-emerald-950/80 p-6 shadow-sm overflow-hidden relative"
      >
        {/* shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-3">
              <div className="h-5 w-40 rounded-md bg-emerald-100 dark:bg-emerald-900/50 animate-pulse" />

              <div className="h-3 w-64 rounded-md bg-emerald-100 dark:bg-emerald-900/40 animate-pulse" />
            </div>

            <div className="h-9 w-28 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 animate-pulse" />
          </div>

          <div className="h-[320px] flex items-end gap-3">
            {[40, 60, 80, 50, 90, 70, 100].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-xl bg-emerald-100 dark:bg-emerald-900/40 animate-pulse"
                style={{
                  height: `${height}%`,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-emerald-950/80 p-6 shadow-sm transition-colors"
    >
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-emerald-950 dark:text-white">
            Aktivitas Platform
          </h3>

          <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70 mt-1">
            Statistik publikasi artikel dan interaksi konsultasi umat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-900/20 px-3 py-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Artikel
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/70 dark:bg-amber-900/10 px-3 py-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />

            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Konsultasi
            </span>
          </div>
        </div>
      </div>

      {/* CHART */}

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={analytics}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />

                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>

              <linearGradient
                id="colorConsultations"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />

                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-emerald-100 dark:text-emerald-900/40"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
              }}
              className="text-emerald-700/70 dark:text-emerald-400/70"
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
              }}
              className="text-emerald-700/70 dark:text-emerald-400/70"
            />

            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(16,185,129,0.15)",
                backgroundColor: "rgba(6, 78, 59, 0.96)",
                backdropFilter: "blur(12px)",
                color: "#ecfdf5",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
              cursor={{
                stroke: "#10b981",
                strokeOpacity: 0.15,
              }}
            />

            <Area
              type="monotone"
              dataKey="consultations"
              name="Konsultasi"
              stroke="#f59e0b"
              fill="url(#colorConsultations)"
              strokeWidth={3}
              activeDot={{
                r: 6,
              }}
            />

            <Area
              type="monotone"
              dataKey="articles"
              name="Artikel"
              stroke="#10b981"
              fill="url(#colorArticles)"
              strokeWidth={3}
              activeDot={{
                r: 6,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 pt-5 border-t border-emerald-100 dark:border-emerald-900/40">
        <div>
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Insight Operasional
          </p>

          <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">
            Aktivitas konsultasi meningkat dibanding bulan sebelumnya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            Live Analytics
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/20 px-3 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
            AI Assisted
          </span>
        </div>
      </div>
    </motion.div>
  );
}
