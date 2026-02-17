import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreakingNewsBanner from "@/components/BreakingNewsBanner";
import HeroArticle from "@/components/HeroArticle";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import AdSlot from "@/components/AdSlot";
import NewsletterWidget from "@/components/NewsletterWidget";
import { useInfiniteArticles } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteArticles();

  const allArticles = data ? data.pages.flatMap((page) => page.articles) : [];
  const featured = allArticles.find((a) => a.isFeatured) || allArticles[0];
  const latest = allArticles.filter((a) => a.id !== featured?.id);
  const topGrid = latest.slice(0, 3);
  const rest = latest.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <SEO />
      <BreakingNewsBanner />

      {/* Header Ad */}
      <div className="container pt-4">
        <AdSlot position="header" className="mb-2" />
      </div>

      <main className="container py-6">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
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

            {/* In-Feed Ad */}
            <AdSlot position="in_feed" className="mt-8" />

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

                {hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? "Memuat..." : "Muat Lebih Banyak"}
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

      <div className="container mb-12">
        <NewsletterWidget />
      </div>

      <SiteFooter />
    </div >
  );
};

export default Index;
