<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\ActivityLog;

class VideoController extends Controller
{
    public function index(Request $request)
    {
        $query = Video::query();

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $videos = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($videos);
    }

    public function show(string $id)
    {
        $video = Video::findOrFail($id);
        $video->increment('views');

        return response()->json($video);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'youtube_url' => 'required|string|max:500',
            'thumbnail_url' => 'nullable|string|max:500',
            'is_featured' => 'nullable|boolean',
        ]);

        if (isset($validated['youtube_url'])) {
            $validated['video_url'] = $validated['youtube_url'];
        }

        $video = Video::create($validated);
        return response()->json($video, 201);
    }

    public function update(Request $request, string $id)
    {
        $video = Video::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'youtube_url' => 'sometimes|string',
            'thumbnail_url' => 'nullable|string',
            'is_featured' => 'boolean',
        ]);

        if (isset($validated['youtube_url'])) {
            $validated['video_url'] = $validated['youtube_url'];
        }

        // Handle thumbnail cleanup
        if (isset($validated['thumbnail_url']) && $validated['thumbnail_url'] !== $video->thumbnail_url && $video->thumbnail_url) {
            $oldPath = str_replace(asset('storage/'), '', $video->thumbnail_url);
            Storage::disk('public')->delete($oldPath);
        }

        $video->update($validated);

        // Log activity
        ActivityLog::create([
            'action' => 'update',
            'target_type' => 'video',
            'target_title' => $video->title,
            'user_email' => $request->user()->email ?? null,
        ]);

        return response()->json($video);
    }

    public function destroy(Request $request, string $id)
    {
        $video = Video::findOrFail($id);
        $title = $video->title;

        // Delete thumbnail if exists
        if ($video->thumbnail_url) {
            $path = str_replace(asset('storage/'), '', $video->thumbnail_url);
            Storage::disk('public')->delete($path);
        }

        $video->delete();
        return response()->json(['message' => 'Video deleted']);
    }
}
