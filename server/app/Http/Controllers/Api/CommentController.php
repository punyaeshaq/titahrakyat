<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(string $articleId)
    {
        $comments = Comment::where('article_id', $articleId)
            ->whereNull('parent_id') // Top level only
            ->with([
                'children' => function ($query) {
                    $query->where('is_approved', true)
                        ->withCount('likes');
                }
            ])
            ->withCount('likes')
            ->approved()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    public function adminIndex()
    {
        $comments = Comment::with('article:id,title,slug')
            ->withCount('reports')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    public function pendingCount()
    {
        $count = Comment::where('is_approved', false)->count();
        return response()->json(['count' => $count]);
    }

    public function store(Request $request, string $articleId)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:comments,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'content' => 'required|string|max:1000',
        ]);

        $validated['article_id'] = $articleId;
        $validated['is_approved'] = false; // Requires admin approval

        $comment = Comment::create($validated);

        return response()->json($comment, 201);
    }

    public function approve(string $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update(['is_approved' => true]);

        return response()->json($comment);
    }

    public function like(Request $request, string $id)
    {
        $comment = Comment::findOrFail($id);
        $ip = $request->ip();

        // Check if already liked
        if ($comment->likes()->where('ip_address', $ip)->exists()) {
            return response()->json(['message' => 'Already liked'], 409);
        }

        $comment->likes()->create([
            'ip_address' => $ip,
            'user_agent' => $request->userAgent()
        ]);

        return response()->json(['likes_count' => $comment->likes()->count()]);
    }

    public function report(Request $request, string $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $comment = Comment::findOrFail($id);

        $comment->reports()->create([
            'reason' => $validated['reason'],
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Comment reported']);
    }

    public function destroy(string $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}

