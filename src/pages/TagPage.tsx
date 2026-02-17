import { useParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import AdSlot from "@/components/AdSlot";
import { useArticlesByTag } from "@/hooks/useArticles";
import { ArrowLeft } from "lucide-react";

const TagPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: articles = [], isLoading } = useArticlesByTag(slug || "");

    // Format slug for display (e.g. "berita-terbaru" -> "Berita Terbaru")
    const tagName = slug
        ? slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "";

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main className="container py-6">
                <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                    <ArrowLeft size={16} /> Kembali
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-1">
                    #{tagName}
                </h1>
                <p className="text-muted-foreground text-sm mb-6">{articles.length} berita ditemukan</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {isLoading ? (
                            <p className="text-muted-foreground py-12 text-center">Memuat...</p>
                        ) : articles.length === 0 ? (
                            <p className="text-muted-foreground py-12 text-center">Belum ada berita dengan tag ini.</p>
                        ) : (
                            <>
                                {articles.map((article, idx) => (
                                    <div key={article.id}>
                                        <ArticleCard article={article} variant="horizontal" />
                                        {idx === 2 && <AdSlot position="in_feed" className="my-4" />}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    <Sidebar />
                </div>
            </main>
            <SiteFooter />
        </div>
    );
};

export default TagPage;
