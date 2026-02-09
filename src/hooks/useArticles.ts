import { useQuery } from "@tanstack/react-query";
import { articlesApi, categoriesApi, breakingNewsApi, settingsApi } from "@/lib/api";
import type { Article } from "@/data/articles";

function mapRow(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    content: row.content || "",
    category: row.category?.label || "Umum",
    categoryId: row.category_id || row.category?.id || "",
    categoryLabel: row.category?.label || "Umum",
    categoryColor: row.category?.color || "#3B82F6",
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
      const response = await articlesApi.getAll({ status: "published" });
      const data = response.data || response || [];
      return (Array.isArray(data) ? data : []).map(mapRow);
    },
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const data = await articlesApi.getBySlug(slug);
      return data ? mapRow(data) : null;
    },
    enabled: !!slug,
  });
}

export function useArticlesByCategory(categoryId: string) {
  return useQuery({
    queryKey: ["articles", "category", categoryId],
    queryFn: async () => {
      const response = await articlesApi.getAll({ category: categoryId, status: "published" });
      const data = response.data || response || [];
      return (Array.isArray(data) ? data : []).map(mapRow);
    },
    enabled: !!categoryId,
  });
}

export function useSearchArticles(query: string) {
  return useQuery({
    queryKey: ["articles", "search", query],
    queryFn: async () => {
      const response = await articlesApi.getAll({ search: query, status: "published" });
      const data = response.data || response || [];
      return (Array.isArray(data) ? data : []).map(mapRow);
    },
    enabled: !!query.trim(),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await categoriesApi.getAll();
      return data || [];
    },
  });
}

export function useBreakingNews() {
  return useQuery({
    queryKey: ["breaking_news"],
    queryFn: async () => {
      const data = await breakingNewsApi.getAll();
      return data || [];
    },
  });
}

// Admin: all articles including drafts
export function useAllArticles() {
  return useQuery({
    queryKey: ["admin_articles"],
    queryFn: async () => {
      const response = await articlesApi.getAdminAll({ per_page: 1000 });
      const data = response.data || response || [];
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useAllBreakingNews() {
  return useQuery({
    queryKey: ["admin_breaking_news"],
    queryFn: async () => {
      const data = await breakingNewsApi.getAll();
      return data || [];
    },
  });
}

export function useEditorialStaff() {
  return useQuery({
    queryKey: ["editorial_staff"],
    queryFn: async () => {
      const data = await settingsApi.getEditorialStaff();
      return data || [];
    },
  });
}

// Popular articles sorted by views
export function usePopularArticles(limit = 5) {
  return useQuery({
    queryKey: ["articles", "popular", limit],
    queryFn: async () => {
      const response = await articlesApi.getAll({ status: "published", per_page: limit });
      const data = response.data || response || [];
      // Sort by views client-side since API may not support it
      const articles = (Array.isArray(data) ? data : []).map(mapRow);
      return articles.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
    },
  });
}

// Articles with most comments - using comments_count from API
export function useMostCommentedArticles(limit = 5) {
  return useQuery({
    queryKey: ["articles", "most_commented", limit],
    queryFn: async () => {
      const response = await articlesApi.getAll({ status: "published", per_page: 50 }); // Fetch more candidate articles
      const data = response.data || response || [];

      const articles = (Array.isArray(data) ? data : []).map(row => ({
        ...mapRow(row),
        commentCount: row.comments_count || 0
      }));

      // Filter articles with at least 1 comment and sort by comment count
      return articles
        .filter(a => a.commentCount > 0)
        .sort((a, b) => b.commentCount - a.commentCount)
        .slice(0, limit);
    },
  });
}

// Recommended articles (random selection excluding certain IDs)
export function useRecommendedArticles(excludeIds: string[] = [], limit = 5) {
  return useQuery({
    queryKey: ["articles", "recommended", excludeIds.join(","), limit],
    queryFn: async () => {
      const response = await articlesApi.getAll({ status: "published", per_page: 20 });
      const data = response.data || response || [];

      const filtered = (Array.isArray(data) ? data : []).filter((a: any) => !excludeIds.includes(a.id));
      // Shuffle and pick
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, limit).map(mapRow);
    },
  });
}

