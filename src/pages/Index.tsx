import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreakingNewsBanner from "@/components/BreakingNewsBanner";
import HeroArticle from "@/components/HeroArticle";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { useArticles } from "@/hooks/useArticles";

const Index = () => {
  const { data: articles = [], isLoading } = useArticles();

  const featured = articles.find((a) => a.isFeatured) || articles[0];
  const latest = articles.filter((a) => a.id !== featured?.id);
  const topGrid = latest.slice(0, 3);
  const rest = latest.slice(3);

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
                  {rest.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="horizontal" />
                  ))}
                </div>
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
