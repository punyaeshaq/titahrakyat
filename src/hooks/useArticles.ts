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

export function useEditorialStaff() {
  return useQuery({
    queryKey: ["editorial_staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("editorial_staff")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

// Popular articles sorted by views
export function usePopularArticles(limit = 5) {
  return useQuery({
    queryKey: ["articles", "popular", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("views", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map(mapRow);
    },
  });
}

// Articles with most comments
export function useMostCommentedArticles(limit = 5) {
  return useQuery({
    queryKey: ["articles", "most_commented", limit],
    queryFn: async () => {
      // Get comment counts per article
      const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select("article_id")
        .eq("is_approved", true);
      if (commentsError) throw commentsError;

      // Count comments per article
      const countMap: Record<string, number> = {};
      (comments || []).forEach((c: any) => {
        countMap[c.article_id] = (countMap[c.article_id] || 0) + 1;
      });

      // Get top article IDs
      const topIds = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      if (topIds.length === 0) return [];

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .in("id", topIds)
        .eq("status", "published");
      if (error) throw error;

      // Sort by comment count
      const mapped = (data || []).map(mapRow);
      return mapped.sort((a, b) => (countMap[b.id] || 0) - (countMap[a.id] || 0))
        .map(article => ({ ...article, commentCount: countMap[article.id] || 0 }));
    },
  });
}

// Recommended articles (random selection excluding certain IDs)
export function useRecommendedArticles(excludeIds: string[] = [], limit = 5) {
  return useQuery({
    queryKey: ["articles", "recommended", excludeIds.join(","), limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      const filtered = (data || []).filter((a: any) => !excludeIds.includes(a.id));
      // Shuffle and pick
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit).map(mapRow);
    },
  });
}
