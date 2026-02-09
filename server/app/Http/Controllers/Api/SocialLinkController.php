<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use Illuminate\Http\Request;

class SocialLinkController extends Controller
{
    public function index()
    {
        $links = SocialLink::where('is_active', true)->orderBy('sort_order')->get();
        return response()->json($links);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'platform' => 'required|string|max:50',
            'url' => 'required|string|max:500',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer',
        ]);

        $link = SocialLink::create($validated);
        return response()->json($link, 201);
    }

    public function update(Request $request, $id)
    {
        $link = SocialLink::findOrFail($id);
        $link->update($request->only(['platform', 'url', 'icon', 'sort_order', 'is_active']));
        return response()->json($link);
    }

    public function destroy($id)
    {
        $link = SocialLink::findOrFail($id);
        $link->delete();
        return response()->json(['message' => 'Link deleted']);
    }
}
