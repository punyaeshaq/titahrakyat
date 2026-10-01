<!doctype html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    {{-- Article-specific OG tags --}}
    <title>{{ $title }} - TitahRakyat.Com</title>
    <meta name="description" content="{{ $description }}" />

    <meta property="og:type" content="article" />
    <meta property="og:url" content="{{ $url }}" />
    <meta property="og:title" content="{{ $title }}" />
    <meta property="og:description" content="{{ $description }}" />
    <meta property="og:image" content="{{ $image }}" />
    <meta property="og:site_name" content="TitahRakyat.Com" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{ $title }}" />
    <meta name="twitter:description" content="{{ $description }}" />
    <meta name="twitter:image" content="{{ $image }}" />

    {{-- Redirect removed: Nginx now handles separation of Bots vs Users --}}
</head>

<body>
    <h1>{{ $title }}</h1>
    <p>{{ $description }}</p>
    <img src="{{ $image }}" alt="{{ $title }}" />
    <p>Memuat halaman... <a href="{{ $url }}">Klik di sini jika tidak otomatis dialihkan.</a></p>
</body>

</html>