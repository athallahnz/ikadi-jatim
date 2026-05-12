import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";

interface ConsultationCardProps {
  data: {
    id: string | number;
    title: string;
    category: string;
    excerpt: string;
    date: string;
    slug: string;
  };
}

const ConsultationCard: React.FC<ConsultationCardProps> = ({ data }) => {
  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/30 hover:shadow-xl transition-all duration-300 group flex flex-col shadow-sm hover:-translate-y-1">
      {/* DECORATIVE TOP BAR */}
      <div className="h-1.5 bg-emerald-700 w-full" />

      <div className="p-6 md:p-7 flex flex-col flex-1">
        {/* HEADER: BADGE & DATE */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded bg-gold/10 text-gold border border-gold/20">
            {data.category}
          </span>
          <span className="text-xs text-muted-foreground font-medium italic">
            {data.date}
          </span>
        </div>

        {/* QUESTION CONTENT */}
        <div className="relative mb-4">
          {/* Decorative Quote Icon */}
          <MessageCircle className="absolute -left-2 -top-2 h-8 w-8 text-emerald-700/5 -z-10" />

          <h3 className="font-display font-bold text-foreground leading-snug text-base md:text-lg lg:text-xl line-clamp-2 group-hover:text-emerald-700 transition-colors">
            <Link to={`/konsultasi/${data.slug}`}>{data.title}</Link>
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed line-clamp-3 italic">
          "{data.excerpt}"
        </p>

        {/* FOOTER: ACTION */}
        <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
          <Link
            to={`/konsultasi/${data.slug}`}
            className="inline-flex items-center text-sm font-bold text-emerald-700 hover:text-gold transition-colors group/link"
          >
            Lihat Jawaban
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
          <span className="text-[10px] font-mono text-muted-foreground/50 uppercase">
            Ref: #{data.id}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ConsultationCard;
