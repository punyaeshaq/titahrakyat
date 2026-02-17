<?php echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{{ url('/') }}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    @foreach ($categories as $category)
    <url>
        <loc>{{ url('/kategori/' . $category->slug) }}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    @endforeach
    @foreach ($articles as $article)
    <url>
        <loc>{{ url('/berita/' . $article->slug) }}</loc>
        <lastmod>{{ $article->published_at->toAtomString() }}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>
    @endforeach
    @foreach ($tags as $tag)
    <url>
        <loc>{{ url('/tag/' . $tag->slug) }}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
    </url>
    @endforeach
</urlset>
