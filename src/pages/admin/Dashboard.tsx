import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";

import StatCard from "@/components/dashboard/StatCard";
import WorkflowCard from "@/components/dashboard/WorkflowCard";
import AIInsightPanel from "@/components/dashboard/AIInsightPanel";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import LatestArticlesCard from "@/components/dashboard/LatestArticlesCard";

import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";

import type {
  Admin,
  DashboardCounts,
  ActivityTimelineItem,
  AnalyticsData,
  AIInsight,
  LatestArticle,
} from "@/types/database";

type LatestArticleQuery = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;

  admins:
    | {
        name: string;
      }[]
    | null;

  categories:
    | {
        slug: string;
      }[]
    | null;
};

type RecentArticle = {
  id: string;
  title: string;
  created_at: string;
  published: boolean;
};

type RecentConsultation = {
  id: string;
  message: string;
  created_at: string;
  status: "pending" | "answered";
};

export default function Dashboard() {
  const { admin } = useAdmin() as {
    admin: Admin | null;
  };

  const [loading, setLoading] = useState(true);

  const [counts, setCounts] = useState<DashboardCounts>({
    articles: 0,
    events: 0,
    galleries: 0,
    consultations: 0,
  });

  const [pendingConsultations, setPendingConsultations] = useState<number>(0);

  const [draftArticles, setDraftArticles] = useState<number>(0);

  const [activities, setActivities] = useState<ActivityTimelineItem[]>([]);

  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  const [latestArticles, setLatestArticles] = useState<LatestArticle[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!admin) return;

    setLoading(true);

    try {
      /*
      ========================================
      COUNTS
      ========================================
      */

      const [
        articlesCount,
        eventsCount,
        galleriesCount,
        consultationsCount,
        pendingConsultationsCount,
        draftArticlesCount,
      ] = await Promise.all([
        supabase.from("articles").select("*", {
          count: "exact",
          head: true,
        }),

        supabase.from("events").select("*", {
          count: "exact",
          head: true,
        }),

        supabase.from("gallery").select("*", {
          count: "exact",
          head: true,
        }),

        supabase.from("view_merged_consultations").select("*", {
          count: "exact",
          head: true,
        }),

        supabase
          .from("view_merged_consultations")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("status", "pending"),

        supabase
          .from("articles")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("published", false),
      ]);

      setCounts({
        articles: articlesCount.count || 0,
        events: eventsCount.count || 0,
        galleries: galleriesCount.count || 0,
        consultations: consultationsCount.count || 0,
      });

      setPendingConsultations(pendingConsultationsCount.count || 0);

      setDraftArticles(draftArticlesCount.count || 0);

      /*
      ========================================
      LATEST ARTICLES
      ========================================
      */

      const { data: latestArticlesData } = await supabase
        .from("articles")
        .select(
          `
          id,
          title,
          slug,
          published,
          created_at,

          admins!articles_author_id_fkey (
            name
          ),

          categories!articles_category_id_fkey (
            slug
          )
        `,
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

      const mappedLatestArticles: LatestArticle[] = (
        latestArticlesData || []
      ).map((article: LatestArticleQuery) => ({
        id: article.id,

        title: article.title,

        slug: article.slug,

        published: article.published,

        created_at: article.created_at,

        author: article.admins?.[0]?.name || "Admin IKADI",

        category: article.categories?.[0]?.slug || "uncategorized",
      }));

      setLatestArticles(mappedLatestArticles);
      /*
      ========================================
      AI INSIGHTS
      ========================================
      */

      const { data: aiData } = await supabase
        .from("view_merged_consultations")
        .select(
          `
    id,
    message,
    status
  `,
        )
        .eq("status", "pending")
        .limit(3);

      const mappedInsights: AIInsight[] = (aiData || []).map(
        (
          item: {
            message: string;
            status: string;
          },
          index: number,
        ) => ({
          id: `ai-${index}`,

          title: "AI Moderation Insight",

          description:
            item.message?.slice(0, 90) || "Konsultasi membutuhkan validasi AI",

          trend: item.status === "pending" ? "Pending Review" : "Processed",

          insight_type: "moderation",

          priority: item.status === "pending" ? "high" : "medium",
        }),
      );

      setAiInsights(mappedInsights);

      /*
      ========================================
      RECENT ARTICLES
      ========================================
      */

      const { data: recentArticles } = await supabase
        .from("articles")
        .select(
          `
          id,
          title,
          created_at,
          published
        `,
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(3);

      /*
      ========================================
      RECENT CONSULTATIONS
      ========================================
      */

      const { data: recentConsultations } = await supabase
        .from("view_merged_consultations")
        .select(
          `
            id,
            message,
            created_at,
            status
          `,
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(3);

      /*
========================================
ACTIVITIES
========================================
*/

      const articleActivities: ActivityTimelineItem[] = (
        recentArticles || []
      ).map((article: RecentArticle) => ({
        id: `article-${article.id}`,

        user: "Admin IKADI",

        action: article.published ? "mempublikasikan" : "membuat draft",

        target: article.title,

        time: new Date(article.created_at).toLocaleDateString("id-ID"),

        status: article.published ? "success" : "warning",
      }));

      const consultationActivities: ActivityTimelineItem[] = (
        recentConsultations || []
      ).map((consultation: RecentConsultation) => ({
        id: `consultation-${consultation.id}`,

        user: "Sistem Konsultasi",

        action:
          consultation.status === "answered"
            ? "menjawab konsultasi"
            : "menerima konsultasi baru",

        target: consultation.message?.slice(0, 60) || "Konsultasi Baru",

        time: new Date(consultation.created_at).toLocaleDateString("id-ID"),

        status: consultation.status === "answered" ? "success" : "warning",
      }));

      setActivities([...articleActivities, ...consultationActivities]);

      /*
========================================
ANALYTICS REAL DATA
========================================
*/

      const currentYear = new Date().getFullYear();

      const { data: articlesAnalytics } = await supabase
        .from("articles")
        .select("created_at");

      const { data: consultationsAnalytics } = await supabase
        .from("view_merged_consultations")
        .select("created_at");

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const analyticsMap = monthNames.map((month, index) => ({
        month,
        articles: 0,
        consultations: 0,
      }));

      articlesAnalytics?.forEach((item) => {
        const date = new Date(item.created_at);

        if (date.getFullYear() === currentYear) {
          analyticsMap[date.getMonth()].articles += 1;
        }
      });

      consultationsAnalytics?.forEach((item) => {
        const date = new Date(item.created_at);

        if (date.getFullYear() === currentYear) {
          analyticsMap[date.getMonth()].consultations += 1;
        }
      });

      setAnalytics(analyticsMap);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
        },
        () => {
          fetchDashboardData();
        },
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultations",
        },
        () => {
          fetchDashboardData();
        },
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,

      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const currentDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto space-y-6"
      >
        {/* HERO */}

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-6 md:p-8 text-white shadow-2xl border border-emerald-700/40"
        >
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium flex items-center gap-2">
                  <LayoutDashboard size={12} />

                  {admin?.scope === "jatim"
                    ? "IKADI Jawa Timur"
                    : `IKADI ${admin?.daerah || "Daerah"}`}
                </span>

                <span className="text-sm text-emerald-100/70">
                  {currentDate}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                Ahlan wa Sahlan, {admin?.name || "Admin"}
              </h1>

              <p className="max-w-2xl text-emerald-50/80 leading-relaxed text-sm md:text-base">
                Operational dashboard untuk publikasi dakwah, moderasi
                konsultasi, dan pengelolaan ekosistem konten IKADI Jawa Timur.
              </p>
            </div>

            <div className="w-full xl:w-[360px] bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-3 text-amber-300">
                <Sparkles size={16} />

                <span className="text-sm font-medium">
                  AI Operational Focus
                </span>
              </div>

              <p className="text-sm leading-relaxed text-emerald-50/90 mb-4">
                Terdapat{" "}
                <strong className="text-white">{pendingConsultations}</strong>{" "}
                konsultasi yang membutuhkan moderasi dan validasi AI.
              </p>
            </div>
          </div>
        </motion.div>

        {/* WORKFLOW */}

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <WorkflowCard
            title="Konsultasi Pending"
            count={pendingConsultations}
            icon={MessageSquare}
            description="Membutuhkan moderasi segera"
            cta="Moderasi Sekarang"
          />

          <WorkflowCard
            title="Artikel Draft"
            count={draftArticles}
            icon={FileText}
            description="Konten belum dipublikasikan"
            cta="Review Draft"
          />

          <WorkflowCard
            title="Agenda Aktif"
            count={counts.events}
            icon={Calendar}
            description="Event dan agenda organisasi"
            cta="Kelola Event"
          />

          <WorkflowCard
            title="Dokumentasi"
            count={counts.galleries}
            icon={ImageIcon}
            description="Galeri organisasi"
            cta="Lihat Galeri"
          />
        </motion.div>

        {/* STATS */}

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <StatCard
            title="Total Artikel"
            count={counts.articles}
            icon={FileText}
            trend="+12% bulan ini"
            description="Publikasi aktif"
            colorClass="bg-emerald-500"
            isLoading={loading}
          />

          <StatCard
            title="Konsultasi"
            count={counts.consultations}
            icon={MessageSquare}
            trend="AI Moderation Active"
            description="Interaksi konsultasi"
            colorClass="bg-amber-500"
            isLoading={loading}
          />

          <StatCard
            title="Agenda"
            count={counts.events}
            icon={Calendar}
            trend="Agenda berjalan"
            description="Kegiatan organisasi"
            colorClass="bg-sky-500"
            isLoading={loading}
          />

          <StatCard
            title="Galeri"
            count={counts.galleries}
            icon={ImageIcon}
            trend="Dokumentasi aktif"
            description="Media organisasi"
            colorClass="bg-purple-500"
            isLoading={loading}
          />
        </motion.div>

        {/* ANALYTICS */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AnalyticsChart analytics={analytics} itemVariants={itemVariants} />
          </div>

          <AIInsightPanel
            aiInsights={aiInsights}
            itemVariants={itemVariants}
            isLoading={loading}
          />
        </div>

        {/* ACTIVITIES */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ActivityTimeline
              activities={activities}
              itemVariants={itemVariants}
              isLoading={loading}
            />
          </div>

          <LatestArticlesCard
            articles={latestArticles}
            itemVariants={itemVariants}
            isLoading={loading}
          />
        </div>
      </motion.div>
    </AdminLayout>
  );
}
