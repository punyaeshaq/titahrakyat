<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OgController;

Route::get('/', function () {
    return view('welcome');
});

// OG meta tags route for social media preview (Rewritten by Nginx for Bots)
Route::get('/bot-share/berita/{slug}', [OgController::class, 'article']);

// Sitemap and RSS
Route::get('/sitemap.xml', [App\Http\Controllers\Api\SitemapController::class, 'index']);
Route::get('/rss.xml', [App\Http\Controllers\Api\RssController::class, 'index']);
