import { useSearchParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArticleCard from "@/components/ArticleCard";
import { searchArticles } from "@/data/articles";
import { Search } from "lucide-react";
import { useState } from "react";

const SearchPage = () => {
  const [params] = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const results = searchArticles(query);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-6">
        <div className="max-w-2xl mx-auto mb-8">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3"
          >
            <Search size={20} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari berita..."
              autoFocus
              className="flex-1 bg-transparent text-foreground text-lg outline-none placeholder:text-muted-foreground"
            />
          </form>
        </div>

        {query.trim() && (
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} hasil untuk "{query}"
            </p>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">Tidak ada berita ditemukan.</p>
                <Link to="/" className="text-primary hover:underline text-sm">Kembali ke beranda</Link>
              </div>
            ) : (
              results.map((article) => (
                <ArticleCard key={article.id} article={article} variant="horizontal" />
              ))
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default SearchPage;
