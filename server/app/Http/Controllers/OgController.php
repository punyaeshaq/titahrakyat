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
        $article = Article::with('category')->where('slug', $slug)->where('status', 'published')->first();

        if (!$article) {
            // If article not found, show default OG tags
            return view('og-article', [
                'title' => 'TitahRakyat.Com - Media Online',
                'description' => 'Media online yang menyajikan informasi publik secara jernih, berimbang, dan bertanggung jawab.',
                'image' => config('app.frontend_url', 'https://TitahRakyat.Com') . '/og-image-default.png',
                'url' => config('app.frontend_url', 'https://TitahRakyat.Com'),
            ]);
        }

        $frontendUrl = config('app.frontend_url', 'https://TitahRakyat.Com');
        $articleUrl = $frontendUrl . '/berita/' . $article->slug;

        // Build a fully-qualified image URL that social media crawlers can fetch
        $image = null;
        if ($article->image_url) {
            if (str_starts_with($article->image_url, 'http')) {
                // Already a full URL
                $image = $article->image_url;
            } else {
                // Relative path — prepend the app URL
                $image = rtrim(config('app.url', $frontendUrl), '/') . '/' . ltrim($article->image_url, '/');
            }
        }

        if (!$image) {
            $image = $frontendUrl . '/og-image-default.png';
        }

        return view('og-article', [
            'title' => $article->meta_title ?: $article->title,
            'description' => $article->meta_description ?: $article->excerpt ?: substr(strip_tags($article->content), 0, 200),
            'image' => $image,
            'url' => $articleUrl,
        ]);
    }
}
