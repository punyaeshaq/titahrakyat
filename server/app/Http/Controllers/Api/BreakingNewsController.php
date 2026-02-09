<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BreakingNews;
use Illuminate\Http\Request;

class BreakingNewsController extends Controller
{
    public function index()
    {
        $breakingNews = BreakingNews::active()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($breakingNews);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string|max:500',
        ]);

        $breakingNews = BreakingNews::create($validated);

        return response()->json($breakingNews, 201);
    }

    public function update(Request $request, string $id)
    {
        $breakingNews = BreakingNews::findOrFail($id);

        $validated = $request->validate([
            'text' => 'sometimes|string|max:500',
            'is_active' => 'sometimes|boolean',
        ]);

        $breakingNews->update($validated);

        return response()->json($breakingNews);
    }

    public function destroy(string $id)
    {
        $breakingNews = BreakingNews::findOrFail($id);
        $breakingNews->delete();

        return response()->json(['message' => 'Breaking news deleted']);
    }
}
