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
            ->approved()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    public function adminIndex()
    {
        $comments = Comment::with('article:id,title,slug')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, string $articleId)
    {
        $validated = $request->validate([
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

    public function destroy(string $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}

