import { useParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import AdSlot from "@/components/AdSlot";
import { useArticlesByCategory, useCategories } from "@/hooks/useArticles";

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: categories = [] } = useCategories();

  // Helper to normalize label to slug
  const normalizeSlug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  // Find category by ID (old) or Slug (new)
  const category = categories.find((c) => c.id === id || normalizeSlug(c.label) === id);
  const categoryId = category?.id || "";

  const { data: categoryArticles = [], isLoading } = useArticlesByCategory(categoryId);

  if (!isLoading && !category) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold font-serif text-foreground mb-4">Kategori tidak ditemukan</h1>
          <Link to="/" className="text-primary hover:underline">Kembali ke beranda</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-6">
        <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-1">
          {category?.label || id}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">{categoryArticles.length} berita ditemukan</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <p className="text-muted-foreground py-12 text-center">Memuat...</p>
            ) : categoryArticles.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center">Belum ada berita di kategori ini.</p>
            ) : (
              <>
                {categoryArticles.map((article, idx) => (
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

export default CategoryPage;
