import { useParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useQuery } from "@tanstack/react-query";
import { articlesApi } from "@/lib/api";
import ArticleCard from "@/components/ArticleCard";
import { User, Calendar, BookOpen } from "lucide-react";

const AuthorPage = () => {
    const { name } = useParams<{ name: string }>();
    const decodedName = decodeURIComponent(name || "");

    const { data: articles, isLoading } = useQuery({
        queryKey: ["articles", "author", decodedName],
        queryFn: async () => {
            const res = await articlesApi.getAll({ author: decodedName });
            return res.data;
        },
        enabled: !!decodedName,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <SiteHeader />
                <div className="container py-20 text-center text-muted-foreground">Memuat profil penulis...</div>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main className="container py-10">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={48} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold mb-2">{decodedName}</h1>
                        <p className="text-muted-foreground mb-4">Penulis di TitahRakyat.Com</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><BookOpen size={16} /> {articles?.data?.length || 0} Artikel</span>
                            <span className="flex items-center gap-1"><Calendar size={16} /> Bergabung sejak 2024</span>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold font-serif mb-6 border-b border-border pb-2">Artikel Terbaru</h2>

                {articles?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {articles.data.map((article: any) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground bg-muted/30 rounded-lg">
                        Belum ada artikel yang ditulis.
                    </div>
                )}
            </main>
            <SiteFooter />
        </div>
    );
};

export default AuthorPage;
