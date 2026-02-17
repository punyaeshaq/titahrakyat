<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;

class RssController extends Controller
{
    public function index()
    {
        $articles = Article::published()->latest()->limit(50)->get();

        $content = view('rss', compact('articles'))->render();

        return response($content, 200)
            ->header('Content-Type', 'text/xml');
    }
}
