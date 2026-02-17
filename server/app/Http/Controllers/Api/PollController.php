<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use Illuminate\Http\Request;

class PollController extends Controller
{
    public function getActive()
    {
        $poll = Poll::with('options')
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->first();

        if (!$poll) {
            return response()->json(null);
        }

        // Check if user already voted (by IP)
        $ip = request()->ip();
        $userVoted = $poll->votes()->where('ip_address', $ip)->exists();

        return response()->json([
            'poll' => $poll,
            'userVoted' => $userVoted
        ]);
    }

    public function vote(Request $request, string $id)
    {
        $poll = Poll::findOrFail($id);

        if (!$poll->is_active || ($poll->expires_at && $poll->expires_at < now())) {
            return response()->json(['message' => 'Polling sudah tidak aktif.'], 400);
        }

        $validated = $request->validate([
            'option_id' => 'required|exists:poll_options,id',
        ]);

        $option = PollOption::where('poll_id', $poll->id)->where('id', $validated['option_id'])->firstOrFail();

        // Check double vote
        $ip = $request->ip();
        if ($poll->votes()->where('ip_address', $ip)->exists()) {
            return response()->json(['message' => 'Anda sudah memilih dalam polling ini.'], 403);
        }

        $option->increment('votes_count');

        PollVote::create([
            'poll_id' => $poll->id,
            'poll_option_id' => $option->id,
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Terima kasih atas partisipasi Anda.']);
    }

    // Admin methods can be added later (store, update, destroy)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'options' => 'required|array|min:2',
            'options.*' => 'required|string',
            'expires_at' => 'nullable|date',
        ]);

        $poll = Poll::create([
            'question' => $validated['question'],
            'is_active' => true,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        foreach ($validated['options'] as $optionText) {
            PollOption::create([
                'poll_id' => $poll->id,
                'option_text' => $optionText,
            ]);
        }

        return response()->json($poll->load('options'), 201);
    }

    public function index()
    {
        // Admin: Get all polls with vote counts
        $polls = Poll::with('options')->withCount('votes')->latest()->paginate(10);
        return response()->json($polls);
    }

    public function update(Request $request, string $id)
    {
        $poll = Poll::findOrFail($id);

        $validated = $request->validate([
            'question' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'expires_at' => 'nullable|date',
        ]);

        $poll->update($validated);

        return response()->json($poll);
    }

    public function destroy(string $id)
    {
        $poll = Poll::findOrFail($id);
        $poll->delete();
        return response()->json(['message' => 'Polling dihapus']);
    }
}
