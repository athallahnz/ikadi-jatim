import { motion } from "framer-motion";

import { CheckCircle2, Clock3, Activity } from "lucide-react";

import { ActivityTimelineItem, MotionVariantProps } from "@/types/database";

interface Props extends MotionVariantProps {
  activities: ActivityTimelineItem[];
  isLoading?: boolean;
}

export default function ActivityTimeline({
  activities,
  itemVariants,
  isLoading = false,
}: Props) {
  if (isLoading) {
    return (
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-emerald-950/80 p-6 shadow-sm overflow-hidden relative"
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-3">
              <div className="h-5 w-44 rounded-md bg-emerald-100 dark:bg-emerald-900/50 animate-pulse" />

              <div className="h-3 w-64 rounded-md bg-emerald-100 dark:bg-emerald-900/40 animate-pulse" />
            </div>

            <div className="h-8 w-24 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 animate-pulse" />
          </div>

          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 animate-pulse shrink-0" />

                <div className="flex-1 space-y-3">
                  <div className="h-4 w-full rounded-md bg-emerald-100 dark:bg-emerald-900/40 animate-pulse" />

                  <div className="h-3 w-32 rounded-md bg-emerald-100 dark:bg-emerald-900/30 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-emerald-950/80 p-6 shadow-sm"
    >
      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity
              size={16}
              className="text-emerald-600 dark:text-emerald-400"
            />

            <h3 className="text-lg font-semibold text-emerald-950 dark:text-white">
              Aktivitas Terkini
            </h3>
          </div>

          <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70">
            Timeline operasional terbaru dashboard
          </p>
        </div>

        <button className="text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white transition-colors">
          Lihat Semua
        </button>
      </div>

      {/* TIMELINE */}

      <div className="space-y-6">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4">
              {/* line */}

              {index !== activities.length - 1 && (
                <div className="absolute top-9 left-4 h-full w-px bg-gradient-to-b from-emerald-200 to-transparent dark:from-emerald-800/50" />
              )}

              {/* icon */}

              <div className="relative z-10">
                {activity.status === "success" ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={15} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Clock3 size={15} />
                  </div>
                )}
              </div>

              {/* content */}

              <div className="flex-1 pb-2">
                <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-900/10 p-4">
                  <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
                      {activity.time}
                    </span>

                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        activity.status === "success"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                      }`}
                    >
                      {activity.status === "success" ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800 p-10 text-center">
            <Activity size={28} className="mx-auto mb-4 text-emerald-400" />

            <h4 className="text-sm font-medium text-emerald-900 dark:text-white mb-2">
              Belum Ada Aktivitas
            </h4>

            <p className="text-xs leading-relaxed text-emerald-700/70 dark:text-emerald-400/70 max-w-xs mx-auto">
              Aktivitas operasional terbaru akan muncul di timeline ini.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
