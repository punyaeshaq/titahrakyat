<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;

class AdController extends Controller
{
    /**
     * Public: Get active ads, optionally filtered by position.
     */
    public function index(Request $request)
    {
        $query = Ad::active()->orderBy('sort_order');

        if ($request->has('position')) {
            $query->position($request->position);
        }

        $ads = $query->get();

        // Increment view count for returned ads
        if ($ads->isNotEmpty()) {
            Ad::whereIn('id', $ads->pluck('id'))->increment('view_count');
        }

        return response()->json($ads);
    }

    /**
     * Admin: Get all ads.
     */
    public function adminIndex()
    {
        $ads = Ad::orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($ads);
    }

    /**
     * Admin: Create a new ad.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image_url' => 'required|string|max:2048',
            'target_url' => 'required|string|max:2048',
            'positions' => 'required|array|min:1',
            'positions.*' => 'string|in:header,sidebar,in_article,in_feed,footer',
            'is_active' => 'sometimes|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'sort_order' => 'sometimes|integer|min:0',
            'max_width' => 'nullable|integer|min:100|max:1200',
        ]);

        $ad = Ad::create($validated);

        return response()->json($ad, 201);
    }

    /**
     * Admin: Update an ad.
     */
    public function update(Request $request, string $id)
    {
        $ad = Ad::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'image_url' => 'sometimes|string|max:2048',
            'target_url' => 'sometimes|string|max:2048',
            'positions' => 'sometimes|array|min:1',
            'positions.*' => 'string|in:header,sidebar,in_article,in_feed,footer',
            'is_active' => 'sometimes|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'sort_order' => 'sometimes|integer|min:0',
            'max_width' => 'nullable|integer|min:100|max:1200',
        ]);

        $ad->update($validated);

        return response()->json($ad);
    }

    /**
     * Admin: Delete an ad.
     */
    public function destroy(string $id)
    {
        $ad = Ad::findOrFail($id);
        $ad->delete();

        return response()->json(['message' => 'Ad deleted']);
    }

    /**
     * Public: Track ad click and return the target URL.
     */
    public function click(string $id)
    {
        $ad = Ad::findOrFail($id);
        $ad->increment('click_count');

        return response()->json(['target_url' => $ad->target_url]);
    }
}
