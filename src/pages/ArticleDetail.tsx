import { useParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getArticleBySlug, articles, formatFullDate, formatDate } from "@/data/articles";
import { getArticleImage } from "@/data/images";
import ArticleCard from "@/components/ArticleCard";
import { ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug || "");

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold font-serif text-foreground mb-4">Berita tidak ditemukan</h1>
          <Link to="/" className="text-primary hover:underline">Kembali ke beranda</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const related = articles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>

        <article className="max-w-3xl mx-auto">
          <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded uppercase mb-3">
            {article.category}
          </span>

          <h1 className="text-2xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="font-medium text-foreground">{article.author}</span>
            <span>•</span>
            <time>{formatFullDate(article.publishedAt)}</time>
          </div>

          <div className="relative overflow-hidden rounded-lg aspect-video mb-6">
            <img
              src={getArticleImage(article.category, article.imageUrl)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div
            className="prose prose-lg max-w-none mb-8 text-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Share buttons */}
          <div className="flex items-center gap-3 border-t border-b border-border py-4 mb-8">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Share2 size={16} /> Bagikan:
            </span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook size={18} />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter size={18} />
            </a>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto">
            <h2 className="font-bold font-serif text-xl text-foreground mb-4 border-b-2 border-primary pb-2">
              Berita Terkait
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
};

export default ArticleDetail;
