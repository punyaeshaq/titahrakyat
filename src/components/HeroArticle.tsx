import { Link } from "react-router-dom";
import { Article, formatDate } from "@/data/articles";
import { getArticleImage } from "@/data/images";
import { Eye } from "lucide-react";

interface HeroArticleProps {
  article: Article;
}

const HeroArticle = ({ article }: HeroArticleProps) => {
  return (
    <Link
      to={`/berita/${article.slug}`}
      className="group relative block overflow-hidden rounded-lg aspect-[16/9] md:aspect-[21/9]"
    >
      <img
        src={getArticleImage(article.category, article.imageUrl)}
        alt={article.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
        <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mb-2 uppercase">
          {article.category}
        </span>
        <h1 className="text-card text-xl md:text-3xl lg:text-4xl font-bold font-serif leading-tight mb-2 group-hover:underline decoration-2 underline-offset-4">
          {article.title}
        </h1>
        <p className="text-card/80 text-sm md:text-base line-clamp-2 max-w-2xl mb-2">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-3 text-card/60 text-xs">
          <span>{article.author}</span>
          <span>•</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye size={12} /> {article.views.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HeroArticle;
