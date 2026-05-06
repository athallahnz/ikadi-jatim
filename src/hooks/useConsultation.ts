import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ================= TYPES ================= */
export interface ConsultationCategory {
    name: string;
    slug: string;
}

export interface CategoryWithCount {
    id: number;
    name: string;
    slug: string;
    count: number;
}

interface RawCategoryResponse {
    id: number;
    name: string;
    slug: string;
    consultations: { count: number }[];
}

export interface Consultation {
    id: number;
    author_name: string;
    title: string;
    slug: string;
    question: string;
    answer: string;
    created_at: string;
    status: number;
    consultation_categories: ConsultationCategory | null;
}

/* ================= HOOK ================= */
export const useConsultation = (
    page: number = 1,
    limit: number = 10,
    categorySlug: string | null = null,
    searchQuery: string = "", // Parameter baru untuk fitur search
) => {
    const [data, setData] = useState<Consultation[]>([]);
    const [categories, setCategories] = useState<CategoryWithCount[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);

    // Loading state dipisah untuk mencegah UI flickering pada komponen yang tidak perlu render ulang
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

    const [error, setError] = useState<string | null>(null);

    // 1. FETCH CATEGORIES (Hanya dijalankan sekali di awal)
    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const { data: catData, error: catErr } = await supabase
                .from("consultation_categories")
                .select(`id, name, slug, consultations(count)`)
                .eq("consultations.status", 1);

            if (catErr) throw catErr;

            if (catData) {
                const rawCats = catData as unknown as RawCategoryResponse[];
                const normalizedCats = rawCats.map((cat) => ({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    count: cat.consultations[0]?.count || 0,
                }));
                setCategories(normalizedCats);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    // 2. FETCH CONSULTATIONS (Dijalankan saat page, filter, atau search berubah)
    const fetchConsultations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            // Inisialisasi query dasar
            let query = supabase
                .from("consultations")
                .select(
                    `id, author_name, title, slug, question, answer, created_at, status, consultation_categories!inner ( name, slug )`,
                    { count: "exact" },
                )
                .eq("status", 1); // Hanya ambil yang sudah dijawab/dipublish

            // Filter berdasarkan Kategori
            if (categorySlug) {
                query = query.eq("consultation_categories.slug", categorySlug);
            }

            // Filter berdasarkan Pencarian (Search)
            if (searchQuery && searchQuery.trim() !== "") {
                const keyword = `%${searchQuery.trim()}%`;
                // Mencari teks di dalam title ATAU question
                query = query.or(
                    `title.ilike.${keyword},question.ilike.${keyword}`,
                );
            }

            // Eksekusi Sorting dan Pagination
            const { data: results, error: err, count } = await query
                .order("id", { ascending: false })
                .range(from, to);

            if (err) throw err;

            if (results) {
                setData(results as unknown as Consultation[]);
            }
            setTotalCount(count || 0);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Terjadi kesalahan sistem",
            );
        } finally {
            setLoading(false);
        }
    }, [page, limit, categorySlug, searchQuery]); // Query di-refresh otomatis jika state ini berubah

    // 3. FETCH SINGLE CONSULTATION (Untuk halaman detail)
    const fetchConsultationBySlug = useCallback(async (slug: string) => {
        try {
            setLoading(true);
            const { data: singleData, error: err } = await supabase
                .from("consultations")
                .select(`*, consultation_categories ( name, slug )`)
                .eq("slug", slug)
                .eq("status", 1)
                .single();

            if (err) throw err;
            return singleData as Consultation;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Data tidak ditemukan",
            );
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // --- USE EFFECTS ---

    // Effect 1: Ambil kategori HANYA saat hook pertama kali dipanggil (On Mount)
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Effect 2: Ambil data konsultasi setiap kali page, limit, kategori, atau pencarian berubah
    useEffect(() => {
        fetchConsultations();
    }, [fetchConsultations]);

    return {
        data,
        categories,
        totalCount,
        loading,
        loadingCategories,
        error,
        fetchConsultationBySlug,
    };
};
