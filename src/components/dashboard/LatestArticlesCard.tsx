import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { FileText, Clock3, ArrowUpRight } from "lucide-react";

import { LatestArticle, MotionVariantProps } from "@/types/database";

interface Props extends MotionVariantProps {
  articles: LatestArticle[];
  isLoading?: boolean;
}

export default function LatestArticlesCard({
  articles,
  itemVariants,
  isLoading = false,
}: Props) {
  if (isLoading) {
    return (
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-emerald-950/80 p-6 shadow-sm"
      >
        {/* SHIMMER */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5" />

        <div className="relative z-10">
          {/* HEADER */}
          <div className="space-y-3 mb-8">
            <div className="h-5 w-40 rounded-md bg-emerald-100 dark:bg-emerald-900/50 animate-pulse" />

            <div className="h-3 w-56 rounded-md bg-emerald-100 dark:bg-emerald-900/40 animate-pulse" />
          </div>

          {/* SKELETON LIST */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-4"
              >
                <div className="space-y-3">
                  <div className="h-4 w-full rounded-md bg-emerald-100 dark:bg-emerald-900/40 animate-pulse" />

                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 rounded-md bg-emerald-100 dark:bg-emerald-900/30 animate-pulse" />

                    <div className="h-3 w-16 rounded-md bg-emerald-100 dark:bg-emerald-900/30 animate-pulse" />
                  </div>
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

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText
            size={16}
            className="text-emerald-600 dark:text-emerald-400"
          />

          <h3 className="text-lg font-semibold text-emerald-950 dark:text-white">
            Artikel Terbaru
          </h3>
        </div>

        <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70">
          Publikasi dan konten terbaru organisasi
        </p>
      </div>

      {/* ARTICLES */}

      <div className="space-y-4">
        {articles.length > 0 ? (
          articles.map((article) => (
            <Link
              key={article.id}
              to={`/kajian/${article.category}/${article.slug}`}
              className="group block rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-900/10 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20"
            >
              {/* TOP */}

              <div className="flex items-start justify-between gap-3 mb-4">
                <h4 className="text-sm font-medium leading-relaxed text-emerald-950 dark:text-white">
                  {article.title}
                </h4>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                      article.published
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                    }`}
                  >
                    {article.published ? "Published" : "Draft"}
                  </span>

                  <ArrowUpRight
                    size={14}
                    className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>

              {/* BOTTOM */}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-700/70 dark:text-emerald-400/70">
                  <Clock3 size={12} />

                  <span>
                    {new Date(article.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {article.admins?.name || "Admin"}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800 p-10 text-center">
            <FileText size={28} className="mx-auto mb-4 text-emerald-400" />

            <h4 className="text-sm font-medium text-emerald-900 dark:text-white mb-2">
              Belum Ada Artikel
            </h4>

            <p className="text-xs leading-relaxed text-emerald-700/70 dark:text-emerald-400/70 max-w-xs mx-auto">
              Artikel terbaru akan muncul pada panel ini setelah dipublikasikan.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
