import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { AIInsight, MotionVariantProps } from "@/types/database";

interface Props extends MotionVariantProps {
  aiInsights: AIInsight[];
  isLoading?: boolean;
}

export default function AIInsightPanel({
  aiInsights,
  itemVariants,
  isLoading = false,
}: Props) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 border border-emerald-700/30 p-6 text-white shadow-xl"
    >
      <div className="flex items-center gap-2 mb-5 text-amber-300">
        <Sparkles size={16} />

        <span className="text-sm font-medium">AI Moderation Insight</span>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="h-4 w-40 rounded bg-white/10" />

                <div className="h-5 w-16 rounded-full bg-white/10" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="h-3 w-full rounded bg-white/10" />

                <div className="h-3 w-[90%] rounded bg-white/10" />

                <div className="h-3 w-[70%] rounded bg-white/10" />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="h-3 w-24 rounded bg-white/10" />

                <div className="h-3 w-14 rounded bg-white/10" />
              </div>
            </div>
          ))
        ) : aiInsights.length > 0 ? (
          aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4"
            >
              <div className="flex items-center justify-between mb-3 gap-3">
                <span className="text-sm text-emerald-50/90 font-medium leading-relaxed">
                  {insight.title}
                </span>

                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                    insight.priority === "high"
                      ? "bg-red-400/20 text-red-300"
                      : insight.priority === "medium"
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-emerald-400/20 text-emerald-300"
                  }`}
                >
                  {insight.priority === "high"
                    ? "Critical"
                    : insight.priority === "medium"
                      ? "Trending"
                      : "Info"}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-emerald-50/80 mb-4">
                {insight.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-emerald-100/70">
                  <Sparkles size={12} />

                  <span>{insight.related_topic || "AI Insight"}</span>
                </div>

                <span className="text-xs font-medium text-amber-300">
                  {insight.total_related_items || 0} terkait
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 text-center">
            <Sparkles size={24} className="mx-auto mb-3 text-emerald-200/70" />

            <h4 className="text-sm font-medium text-white mb-2">
              Belum Ada Insight AI
            </h4>

            <p className="text-xs leading-relaxed text-emerald-100/70">
              Sistem AI belum mendeteksi insight baru.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
