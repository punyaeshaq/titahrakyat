<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class OgController extends Controller
{
    /**
     * Render OG meta tags for an article page.
     * Social media crawlers will see proper title, description, and image.
     */
    public function article(string $slug)
    {
        $article = Article::with('category')->where('slug', $slug)->first();

        if (!$article) {
            // If article not found, show default OG tags
            return view('og-article', [
                'title' => 'TitahRakyat.Com - Mengawal Kepentingan Publik',
                'description' => 'Media online yang menyajikan informasi publik secara jernih, berimbang, dan bertanggung jawab.',
                'image' => url('/assets/og-default.jpg'),
                'url' => config('app.frontend_url', 'https://TitahRakyat.Com'),
            ]);
        }

        $frontendUrl = config('app.frontend_url', 'https://TitahRakyat.Com');
        $articleUrl = $frontendUrl . '/berita/' . $article->slug;

        // Use article image, or fall back to a default
        $image = $article->image_url ?: url('/assets/og-default.jpg');

        return view('og-article', [
            'title' => $article->meta_title ?: $article->title,
            'description' => $article->meta_description ?: $article->excerpt ?: substr(strip_tags($article->content), 0, 200),
            'image' => $image,
            'url' => $articleUrl,
        ]);
    }
}
