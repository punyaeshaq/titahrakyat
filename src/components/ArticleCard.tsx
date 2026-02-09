import { Link } from "react-router-dom";
import { Article, formatDate } from "@/data/articles";
import { getArticleImage } from "@/data/images";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "compact" | "horizontal";
}

const ArticleCard = ({ article, variant = "default" }: ArticleCardProps) => {
  if (variant === "compact") {
    return (
      <Link
        to={`/berita/${article.slug}`}
        className="group flex gap-3 py-3 border-b border-border last:border-0"
      >
        <img
          src={getArticleImage(article.category, article.imageUrl)}
          alt={article.title}
          className="w-20 h-14 object-cover rounded shrink-0"
          loading="lazy"
        />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold font-serif text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <span className="text-xs text-news-timestamp mt-1 block">
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        to={`/berita/${article.slug}`}
        className="group flex gap-4 py-4 border-b border-border last:border-0"
      >
        <img
          src={getArticleImage(article.category, article.imageUrl)}
          alt={article.title}
          className="w-32 h-20 md:w-48 md:h-28 object-cover rounded-md shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex flex-col justify-center">
          <span className="text-xs font-bold text-primary uppercase mb-1">
            {article.category}
          </span>
          <h3 className="text-base md:text-lg font-bold font-serif text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 hidden md:block">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs text-news-timestamp mt-2">
            <span>{article.author}</span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/berita/${article.slug}`}
      className="group block overflow-hidden"
    >
      <div className="relative overflow-hidden rounded-md aspect-video mb-3">
        <img
          src={getArticleImage(article.category, article.imageUrl)}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded uppercase">
          {article.category}
        </span>
      </div>
      <h3 className="text-base font-bold font-serif text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-2 text-xs text-news-timestamp mt-2">
        <span>{article.author}</span>
        <span>•</span>
        <span>{formatDate(article.publishedAt)}</span>
      </div>
    </Link>
  );
};

export default ArticleCard;
