import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreakingNewsBanner from "@/components/BreakingNewsBanner";
import HeroArticle from "@/components/HeroArticle";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { useArticles } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 5;

const Index = () => {
  const { data: articles = [], isLoading } = useArticles();
  const [page, setPage] = useState(1);

  const featured = articles.find((a) => a.isFeatured) || articles[0];
  const latest = articles.filter((a) => a.id !== featured?.id);
  const topGrid = latest.slice(0, 3);
  const rest = latest.slice(3);

  const totalPages = Math.max(1, Math.ceil(rest.length / ITEMS_PER_PAGE));
  const paginatedRest = rest.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <BreakingNewsBanner />

      <main className="container py-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Memuat berita...</p>
        ) : !featured ? (
          <p className="text-center text-muted-foreground py-12">Belum ada berita.</p>
        ) : (
          <>
            <HeroArticle article={featured} />
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {topGrid.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
              <div className="lg:col-span-2">
                <h2 className="font-bold font-serif text-xl text-foreground mb-4 border-b-2 border-primary pb-2">
                  Berita Terbaru
                </h2>
                <div>
                  {paginatedRest.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="horizontal" />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft size={16} />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button key={i + 1} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>
                        {i + 1}
                      </Button>
                    ))}
                    <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Sidebar />
              </div>
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
