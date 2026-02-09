<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('articles')->get();
        return response()->json($categories);
    }

    public function show(string $id)
    {
        $category = Category::with([
            'articles' => function ($q) {
                $q->published()->orderBy('created_at', 'desc')->limit(10);
            }
        ])->findOrFail($id);

        return response()->json($category);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'nullable|string|max:50|unique:categories,id',
            'label' => 'required|string|max:100',
            'color' => 'nullable|string|max:50',
        ]);

        // Generate ID from label if not provided
        if (empty($validated['id'])) {
            $validated['id'] = strtolower(preg_replace('/[^a-z0-9\s-]/i', '', $validated['label']));
            $validated['id'] = preg_replace('/\s+/', '-', $validated['id']);
        }

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);
        $category->update($request->only(['label', 'color']));
        return response()->json($category);
    }

    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}

