import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'video.other';
    publishedTime?: string;
    author?: string;
}

const SEO = ({
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    author
}: SEOProps) => {
    const siteTitle = "TitahRakyat.Com";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDescription = description || "Portal Berita Terkini & Terpercaya. Mengawal Kepentingan Publik.";
    const metaImage = image || "https://TitahRakyat.Com/og-image-default.png"; // Fallback
    const metaUrl = url || typeof window !== 'undefined' ? window.location.href : "https://TitahRakyat.Com";

    return (
        <Helmet>
            {/* Standard Meta */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Article Specific */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={metaUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
