// types/database.ts

export interface Admin {
    id: string; // uuid
    name: string | null;
    role: string | null;
    created_at: string;
    scope: string | null;
    daerah: string | null;
    daerah_slug: string | null;
    brand_name: string | null;
    brand_logo: string | null;
    status: string | null; // Di tabel admins, status menggunakan tipe 'text'
    email: string | null;
}

export interface Consultation {
    id: number; // int8
    author_name: string | null;
    city: string | null;
    title: string | null;
    slug: string | null;
    category_id: number | null; // int4
    question: string;
    answer: string | null; // Bisa null jika belum dijawab
    created_at: string; // timestamptz
    answered_at: string | null; // timestamptz
    status: number | null; // int2
    answered_by: string | null; // uuid (Relasi ke tabel admins)

    embedding?: number[]; // Kolom vektor RAG (opsional saat di-fetch biasa)

    // Properti relasi jika Anda melakukan query JOIN (misal: select="*, admin:admins(*)")
    admin?: Admin | null;
}

// Tipe balasan dari fungsi RPC 'match_consultations' untuk RAG
export interface ConsultationMatch {
    id: number;
    title: string | null;
    question: string;
    answer: string;
    slug: string;
    similarity_score: number;
}

export type FilterStatus = "all" | "pending" | "answered";

export interface UnifiedConsultation {
    slug: string;
    id: string; // Bisa berupa UUID atau Angka (dari tabel lama)
    inbox_id: string | null;
    contact_info: string;
    email: string;
    name: string | null;
    city: string | null;
    subject: string | null;
    message: string | null;
    reply_message: string | null;
    reply_audio_url: string | null;
    category_id: number | null;
    category_name: string | null;
    status: string;
    created_at: string;
    answered_at: string | null;
    // Gunakan optional operator (?) agar aman dan tidak bentrok
    consultation_categories?: { name: string } | null;
}

// Tambahkan ini HANYA JIKA Anda mendapatkan error 'Tables is not exported' di komponen lain
export type Tables = unknown;

import { Variants } from "framer-motion";

export interface DashboardCounts {
    articles: number;
    events: number;
    galleries: number;
    consultations: number;
}

export interface ActivityTimelineItem {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    status: "success" | "warning";
}

export interface AnalyticsData {
    month: string;
    articles: number;
    consultations: number;
}

export interface AnalyticsRow {
    month: string;
    month_number: number;
    year_number: number;
    total_articles: number;
    total_consultations: number;
}

export interface AIInsight {
    id: string;
    title: string;
    description: string;
    insight_type: string;
    priority: "high" | "medium" | "low";
    related_topic?: string;
    total_related_items?: number;
}

export interface LatestArticle {
    id: string;
    title: string;
    slug: string;
    category: string;

    created_at: string;
    published: boolean;

    admins?: {
        name: string;
    };
}

export interface WorkflowCardProps {
    title: string;
    count: number;
    icon: React.ElementType;
    description: string;
    cta: string;
}

export interface StatCardProps {
    title: string;
    count: number;
    icon: React.ElementType;
    trend: string;
    description: string;
    colorClass: string;
}

export interface MotionVariantProps {
    itemVariants: Variants;
}
