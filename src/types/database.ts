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
    id: string; // Bisa berupa UUID atau Angka (dari tabel lama)
    inbox_id: string | null;
    name: string | null;
    city: string | null;
    subject: string | null;
    message: string | null;
    reply_message: string | null;
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
