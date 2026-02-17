import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { articlesApi } from "@/lib/api";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface RelatedArticlesProps {
    currentArticleId: string;
    categoryId: string;
}

const RelatedArticles = ({ currentArticleId, categoryId }: RelatedArticlesProps) => {
    const { data: articles, isLoading } = useQuery({
        queryKey: ["related-articles", categoryId],
        queryFn: async () => {
            // Fetch articles from the same category
            // We'll filter out the current article client-side for now
            // Ideally backend supports 'exclude' or 'related' endpoint
            const res = await articlesApi.getAll({ category: categoryId, per_page: 5 });
            return res.data;
        },
        enabled: !!categoryId,
    });

    if (isLoading || !articles) return null;

    const related = articles
        .filter((a: any) => a.id !== currentArticleId)
        .slice(0, 3); // Show top 3

    if (related.length === 0) return null;

    return (
        <div className="mt-12 border-t border-border pt-8">
            <h3 className="text-2xl font-serif font-bold mb-6">Berita Terkait</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((article: any) => (
                    <Link key={article.id} to={`/berita/${article.slug}`} className="group">
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                            {article.image_url ? (
                                <img
                                    src={article.image_url}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                                    No Image
                                </div>
                            )}
                        </div>
                        <h4 className="font-serif font-bold text-lg leading-snug group-hover:text-primary transition-colors mb-2">
                            {article.title}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar size={12} className="mr-1" />
                            {article.published_at && format(new Date(article.published_at), "d MMMM yyyy", { locale: id })}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedArticles;
