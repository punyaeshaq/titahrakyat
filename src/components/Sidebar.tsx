import { Link } from "react-router-dom";
import { categories, getArticlesByCategory, articles as allArticles } from "@/data/articles";
import { TrendingUp } from "lucide-react";
import ArticleCard from "./ArticleCard";

const Sidebar = () => {
  const trending = [...allArticles].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <aside className="space-y-8">
      {/* Trending */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="flex items-center gap-2 font-bold font-serif text-foreground text-lg mb-4">
          <TrendingUp size={18} className="text-primary" />
          Populer
        </h2>
        <div>
          {trending.map((article, i) => (
            <div key={article.id} className="flex gap-3 py-3 border-b border-border last:border-0">
              <span className="text-2xl font-black text-primary/20 shrink-0 w-8 text-center">
                {i + 1}
              </span>
              <Link
                to={`/berita/${article.slug}`}
                className="group min-w-0"
              >
                <h3 className="text-sm font-semibold font-serif text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <span className="text-xs text-news-timestamp mt-1 block uppercase">
                  {article.category}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="font-bold font-serif text-foreground text-lg mb-3">Kategori</h2>
        <div className="space-y-1">
          {categories.map((cat) => {
            const count = getArticlesByCategory(cat.id).length;
            return (
              <Link
                key={cat.id}
                to={`/kategori/${cat.id}`}
                className="flex items-center justify-between py-2 px-2 rounded hover:bg-accent transition-colors text-sm"
              >
                <span className="text-foreground font-medium">{cat.label}</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
