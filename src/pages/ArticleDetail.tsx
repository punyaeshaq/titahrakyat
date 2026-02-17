import { useParams, Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useArticleBySlug } from "@/hooks/useArticles";
import { formatFullDate } from "@/data/articles";
import { getArticleImage } from "@/data/images";
import CommentSection from "@/components/CommentSection";
import AdSlot from "@/components/AdSlot";
import { ArrowLeft, Clock, Tag as TagIcon } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import RelatedArticles from "@/components/RelatedArticles";
import Sidebar from "@/components/Sidebar";
import { calculateReadingTime } from "@/utils/readingTime";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

import { useRef, useState, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticleBySlug(slug || "");
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [images, setImages] = useState<{ src: string }[]>([]);

  useEffect(() => {
    if (article && contentRef.current) {
      const imgElements = contentRef.current.querySelectorAll("img");
      const imageUrls: { src: string }[] = [];

      // Add featured image if available
      const featuredImgSrc = article.imageUrl ? getArticleImage(article.category, article.imageUrl) : null;
      if (featuredImgSrc) {
        imageUrls.push({ src: featuredImgSrc });
      }

      const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
      };

      const listeners: { el: HTMLImageElement, fn: () => void }[] = [];

      imgElements.forEach((img, index) => {
        imageUrls.push({ src: img.src });
        img.style.cursor = "pointer";
        const fn = () => openLightbox(featuredImgSrc ? index + 1 : index);
        img.addEventListener("click", fn);
        listeners.push({ el: img, fn });
      });

      setImages(imageUrls);

      return () => {
        listeners.forEach(({ el, fn }) => {
          el.removeEventListener("click", fn);
        });
      };
    }
  }, [article]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const readingTime = article ? calculateReadingTime(article.content) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container py-8 space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
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
      <SEO
        title={article.title}
        description={article.excerpt}
        image={getArticleImage(article.category, article.imageUrl)}
        type="article"
        publishedTime={article.publishedAt}
        author={article.author}
      />
      <main className="container py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft size={16} /> Kembali
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <article className="max-w-none">
              <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded uppercase mb-3">
                {article.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-4">{article.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                <span className="font-medium text-foreground">{article.author}</span>
                <span>•</span>
                <time>{formatFullDate(article.publishedAt)}</time>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {readingTime} min baca</span>
              </div>
              <div className="relative overflow-hidden rounded-lg aspect-video mb-6 cursor-pointer" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
                <img src={getArticleImage(article.category, article.imageUrl)} alt={article.title} className="w-full h-full object-cover" />
              </div>

              {/* Ringkasan Berita */}
              {article.excerpt && (
                <div className="rounded-xl mb-8 overflow-hidden" style={{ background: "linear-gradient(135deg, #C62828 0%, #B71C1C 50%, #8E0000 100%)" }}>
                  <div className="px-5 py-4 sm:px-6 sm:py-5">
                    <h3 className="text-white font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-yellow-400 rounded-full inline-block"></span>
                      Ringkasan Berita:
                    </h3>
                    <ul className="space-y-2.5">
                      {article.excerpt
                        .split(/(?:\.\s|\n)+/)
                        .map((s: string) => s.trim())
                        .filter((s: string) => s.length > 5)
                        .map((point: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5 text-white/95 text-sm sm:text-base leading-relaxed">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"></span>
                            <span>{point.endsWith('.') ? point : `${point}.`}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              <div
                ref={contentRef}
                className="prose prose-lg max-w-none mb-8 text-foreground [&_p]:mb-4 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="flex items-center text-sm font-semibold text-muted-foreground"><TagIcon size={16} className="mr-1" /> Tags:</span>
                  {article.tags.map(tag => (
                    <Link key={tag.id} to={`/tag/${tag.slug}`} className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded transition-colors">
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* In-Article Ad */}
              <AdSlot position="in_article" className="mb-8" />

              <ShareButtons title={article.title} url={shareUrl} />

              <CommentSection articleId={article.id} />
            </article>

            {article.categoryId && (
              <div className="mt-8 border-t border-border pt-8">
                <RelatedArticles currentArticleId={article.id} categoryId={article.categoryId} />
              </div>
            )}
          </div>
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </main>
      <SiteFooter />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={images}
      />
    </div>
  );
};

export default ArticleDetail;
