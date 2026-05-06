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
    searchQuery: string = "",
) => {
    const [data, setData] = useState<Consultation[]>([]);
    const [categories, setCategories] = useState<CategoryWithCount[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. FETCH CATEGORIES (Optimized with error handling)
    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const { data: catData, error: catErr } = await supabase
                .from("consultation_categories")
                .select(`id, name, slug, consultations(count)`)
                .eq("consultations.status", 1);

            if (catErr) throw catErr;

            if (catData) {
                // Mapping aman untuk menghindari 'undefined'
                const normalizedCats =
                    (catData as unknown as RawCategoryResponse[]).map((
                        cat,
                    ) => ({
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                        count: cat.consultations?.[0]?.count || 0,
                    }));
                setCategories(normalizedCats);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    // 2. FETCH CONSULTATIONS (Improved Performance)
    const fetchConsultations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            let query = supabase
                .from("consultations")
                .select(
                    `id, author_name, title, slug, question, answer, created_at, status, consultation_categories!inner ( name, slug )`,
                    { count: "exact" },
                )
                .eq("status", 1);

            if (categorySlug) {
                query = query.eq("consultation_categories.slug", categorySlug);
            }

            if (searchQuery && searchQuery.trim() !== "") {
                const keyword = `%${searchQuery.trim()}%`;
                // Gunakan .or dengan bungkus tanda kurung jika diperlukan di filter kompleks
                query = query.or(
                    `title.ilike.${keyword},question.ilike.${keyword}`,
                );
            }

            const { data: results, error: err, count } = await query
                .order("created_at", { ascending: false }) // Gunakan created_at untuk sorting arsip
                .range(from, to);

            if (err) throw err;

            setData((results as unknown as Consultation[]) || []);
            setTotalCount(count || 0);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Terjadi kesalahan sistem",
            );
        } finally {
            setLoading(false);
        }
    }, [page, limit, categorySlug, searchQuery]);

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
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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
