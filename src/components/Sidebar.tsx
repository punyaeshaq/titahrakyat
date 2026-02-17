import { Link } from "react-router-dom";
import { useCategories, usePopularArticles, useMostCommentedArticles, useRecommendedArticles } from "@/hooks/useArticles";
import AdSlot from "@/components/AdSlot";
import PollWidget from "@/components/PollWidget";
import { TrendingUp, Star, MessageCircle } from "lucide-react";

const Sidebar = () => {
  const { data: categories = [] } = useCategories();
  const { data: popular = [] } = usePopularArticles(5);
  const { data: mostCommented = [] } = useMostCommentedArticles(5);
  const { data: recommended = [] } = useRecommendedArticles([], 5);

  return (
    <aside className="space-y-8">
      {/* Rekomendasi Untuk Anda */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="flex items-center gap-2 font-bold font-serif text-foreground text-lg mb-4">
          <Star size={18} className="text-news-yellow" />
          Rekomendasi Untuk Anda
        </h2>
        <div>
          {recommended.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada rekomendasi.</p>
          )}
          {recommended.map((article) => (
            <div key={article.id} className="py-3 border-b border-border last:border-0">
              <Link to={`/berita/${article.slug}`} className="group">
                <h3 className="text-sm font-semibold font-serif text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <span className="text-xs text-news-timestamp mt-1 block uppercase">{article.category}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Polling Widget */}
      <PollWidget />

      {/* Berita Terpopuler */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="flex items-center gap-2 font-bold font-serif text-foreground text-lg mb-4">
          <TrendingUp size={18} className="text-primary" />
          Berita Terpopuler
        </h2>
        <div>
          {popular.map((article, i) => (
            <div key={article.id} className="flex gap-3 py-3 border-b border-border last:border-0">
              <span className="text-2xl font-black text-primary/20 shrink-0 w-8 text-center">{i + 1}</span>
              <Link to={`/berita/${article.slug}`} className="group min-w-0">
                <h3 className="text-sm font-semibold font-serif text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-news-timestamp uppercase">{article.category}</span>
                  <span className="text-xs text-muted-foreground">{article.views.toLocaleString("id-ID")} views</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Ad */}
      <AdSlot position="sidebar" />

      {/* Komentar Terbanyak */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="flex items-center gap-2 font-bold font-serif text-foreground text-lg mb-4">
          <MessageCircle size={18} className="text-news-blue" />
          Komentar Terbanyak
        </h2>
        <div>
          {mostCommented.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada komentar.</p>
          )}
          {mostCommented.map((article: any, i: number) => (
            <div key={article.id} className="flex gap-3 py-3 border-b border-border last:border-0">
              <span className="text-2xl font-black text-news-blue/20 shrink-0 w-8 text-center">{i + 1}</span>
              <Link to={`/berita/${article.slug}`} className="group min-w-0">
                <h3 className="text-sm font-semibold font-serif text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-news-timestamp uppercase">{article.category}</span>
                  <span className="text-xs text-muted-foreground">{article.commentCount} komentar</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Kategori */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="font-bold font-serif text-foreground text-lg mb-3">Kategori</h2>
        <div className="space-y-1">
          {categories.map((cat) => {
            const slug = cat.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            return (
              <Link
                key={cat.id}
                to={`/kategori/${slug}`}
                className="flex items-center justify-between py-2 px-2 rounded hover:bg-accent transition-colors text-sm"
              >
                <span className="text-foreground font-medium">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
