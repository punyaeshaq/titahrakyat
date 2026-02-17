<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;

class SitemapController extends Controller
{
    public function index()
    {
        $articles = Article::published()->latest()->get();
        $categories = Category::all();
        $tags = Tag::all();

        $content = view('sitemap', compact('articles', 'categories', 'tags'))->render();

        return response($content, 200)
            ->header('Content-Type', 'text/xml');
    }
}
