import React from "react";
import { motion } from "framer-motion";

interface WorkflowCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  description: string;
  cta: string;
}

export default function WorkflowCard({
  title,
  count,
  icon: Icon,
  description,
  cta,
}: WorkflowCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-emerald-950/80 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {title}
          </p>

          <h3 className="text-3xl font-bold text-emerald-950 dark:text-white mt-2">
            {count}
          </h3>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Icon size={22} />
        </div>
      </div>

      <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70 leading-relaxed mb-4">
        {description}
      </p>

      <button className="text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white transition-colors">
        {cta} →
      </button>
    </motion.div>
  );
}
