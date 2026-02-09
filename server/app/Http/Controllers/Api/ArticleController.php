<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::with('category')->withCount('comments');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // Default: only published articles for public
            if (!$request->user()) {
                $query->published();
            }
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter featured
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Filter breaking
        if ($request->boolean('breaking')) {
            $query->breaking();
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Order
        $query->orderBy('published_at', 'desc')->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $request->get('per_page', 10);
        $articles = $query->paginate($perPage);

        return response()->json($articles);
    }

    public function show(string $slug)
    {
        $article = Article::with([
            'category',
            'comments' => function ($q) {
                $q->approved()->orderBy('created_at', 'desc');
            }
        ])->where('slug', $slug)->firstOrFail();

        // Increment views
        $article->increment('views');

        return response()->json($article);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'nullable|uuid|exists:categories,id',
            'image_url' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_breaking' => 'boolean',
            'status' => 'in:draft,published,scheduled',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'published_at' => 'nullable|date',
            'scheduled_at' => 'nullable|date',
        ]);

        if (isset($validated['slug'])) {
            $slug = Str::slug($validated['slug']);
        } else {
            $slug = Str::slug($validated['title']);
        }

        $originalSlug = $slug;
        $count = 1;
        while (Article::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }
        $validated['slug'] = $slug;
        $validated['author'] = $request->user()->name ?? 'Admin';

        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        $article = Article::create($validated);

        // Log activity
        ActivityLog::create([
            'action' => 'create',
            'target_type' => 'article',
            'target_title' => $article->title,
            'user_email' => $request->user()->email ?? null,
        ]);

        return response()->json($article, 201);
    }

    public function update(Request $request, string $id)
    {
        $article = Article::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'excerpt' => 'sometimes|string',
            'content' => 'sometimes|string',
            'category_id' => 'nullable|uuid|exists:categories,id',
            'image_url' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_breaking' => 'boolean',
            'status' => 'in:draft,published,scheduled',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'published_at' => 'nullable|date',
            'scheduled_at' => 'nullable|date',
        ]);

        // Update slug if title changed
        if (isset($validated['title']) && $validated['title'] !== $article->title) {
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $count = 1;
            while (Article::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
            $validated['slug'] = $slug;
        }

        // Set published_at when status changes to published
        if (isset($validated['status']) && $validated['status'] === 'published' && $article->status !== 'published') {
            $validated['published_at'] = now();
        }

        // Handle image cleanup
        if (isset($validated['image_url']) && $validated['image_url'] !== $article->image_url && $article->image_url) {
            $oldPath = str_replace(asset('storage/'), '', $article->image_url);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
        }

        $article->update($validated);

        // Log activity
        ActivityLog::create([
            'action' => 'update',
            'target_type' => 'article',
            'target_title' => $article->title,
            'user_email' => $request->user()->email ?? null,
        ]);

        return response()->json($article);
    }

    public function destroy(Request $request, string $id)
    {
        $article = Article::findOrFail($id);
        $title = $article->title;

        // Delete image if exists
        if ($article->image_url) {
            $path = str_replace(asset('storage/'), '', $article->image_url);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
        }

        $article->delete();

        // Log activity
        ActivityLog::create([
            'action' => 'delete',
            'target_type' => 'article',
            'target_title' => $title,
            'user_email' => $request->user()->email ?? null,
        ]);

        return response()->json(['message' => 'Article deleted successfully']);
    }
}
