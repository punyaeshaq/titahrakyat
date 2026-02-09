import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Article } from "@/data/articles";

function mapRow(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    content: row.content || "",
    category: row.category_id || "",
    author: row.author || "",
    publishedAt: row.published_at || row.created_at,
    imageUrl: row.image_url || "",
    views: row.views || 0,
    isFeatured: row.is_featured,
    isBreaking: row.is_breaking,
  };
}

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data) : null;
    },
    enabled: !!slug,
  });
}

export function useArticlesByCategory(categoryId: string) {
  return useQuery({
    queryKey: ["articles", "category", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("category_id", categoryId)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    enabled: !!categoryId,
  });
}

export function useSearchArticles(query: string) {
  return useQuery({
    queryKey: ["articles", "search", query],
    queryFn: async () => {
      const q = `%${query}%`;
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .or(`title.ilike.${q},excerpt.ilike.${q}`)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    enabled: !!query.trim(),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useBreakingNews() {
  return useQuery({
    queryKey: ["breaking_news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("breaking_news")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// Admin: all articles including drafts
export function useAllArticles() {
  return useQuery({
    queryKey: ["admin_articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAllBreakingNews() {
  return useQuery({
    queryKey: ["admin_breaking_news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("breaking_news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}
