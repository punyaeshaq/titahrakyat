import { useParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useArticleBySlug, useArticlesByCategory } from "@/hooks/useArticles";
import { formatFullDate } from "@/data/articles";
import { getArticleImage } from "@/data/images";
import ArticleCard from "@/components/ArticleCard";
import CommentSection from "@/components/CommentSection";
import { ArrowLeft, Share2, Facebook } from "lucide-react";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticleBySlug(slug || "");
  const { data: relatedRaw = [] } = useArticlesByCategory(article?.category || "");

  const related = relatedRaw.filter((a) => a.id !== article?.id).slice(0, 3);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-20 text-center text-muted-foreground">Memuat...</div>
        <SiteFooter />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft size={16} /> Kembali
        </Link>

        <article className="max-w-3xl mx-auto">
          <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded uppercase mb-3">
            {article.category}
          </span>
          <h1 className="text-2xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="font-medium text-foreground">{article.author}</span>
            <span>•</span>
            <time>{formatFullDate(article.publishedAt)}</time>
          </div>
          <div className="relative overflow-hidden rounded-lg aspect-video mb-6">
            <img src={getArticleImage(article.category, article.imageUrl)} alt={article.title} className="w-full h-full object-cover" />
          </div>
          <div
            className="prose prose-lg max-w-none mb-8 text-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          <div className="flex items-center gap-3 border-t border-b border-border py-4 mb-8">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Share2 size={16} /> Bagikan:</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              title="Bagikan ke Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-black/10 text-black hover:bg-black/20 transition-colors"
              title="Bagikan ke X"
            >
              {/* X Logo using simple SVG path since Lucide might not have it yet or we stick to Twitter icon if preferred, but user asked for X */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M4 4l11.733 16h8.267l-15.733-16-8.267 16 11.733-16z" /><path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772" /></svg>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${article.title} - ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              title="Bagikan ke WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
            </a>
          </div>

          <CommentSection articleId={article.id} />
        </article>

        {related.length > 0 && (
          <section className="max-w-3xl mx-auto">
            <h2 className="font-bold font-serif text-xl text-foreground mb-4 border-b-2 border-primary pb-2">Berita Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default ArticleDetail;
