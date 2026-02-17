<?php echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>{{ config('app.name') }}</title>
        <link>{{ url('/') }}</link>
        <description>Berita Terkini dan Terpercaya</description>
        <language>id</language>
        <atom:link href="{{ url('/api/rss') }}" rel="self" type="application/rss+xml" />
        @foreach ($articles as $article)
        <item>
            <title>{{ $article->title }}</title>
            <link>{{ url('/berita/' . $article->slug) }}</link>
            <description><![CDATA[{!! $article->excerpt !!}]]></description>
            <category>{{ $article->category->name ?? 'Umum' }}</category>
            <pubDate>{{ $article->published_at->toRssString() }}</pubDate>
            <guid>{{ url('/berita/' . $article->slug) }}</guid>
            @if ($article->image_url)
            <enclosure url="{{ $article->image_url }}" type="image/jpeg" />
            @endif
        </item>
        @endforeach
    </channel>
</rss>
