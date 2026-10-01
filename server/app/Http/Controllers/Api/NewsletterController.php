<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Mail\NewsletterWelcomeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:newsletter_subscribers,email',
        ]);

        $token = Str::random(64);

        $subscriber = NewsletterSubscriber::create([
            'email' => $validated['email'],
            'verified' => true,
            'token' => $token,
        ]);

        // Send welcome email
        try {
            Mail::to($subscriber->email)->send(new NewsletterWelcomeMail($token));
        } catch (\Exception $e) {
            \Log::error('Failed to send newsletter welcome email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Berhasil berlangganan newsletter! Cek email Anda.',
            'subscriber' => $subscriber
        ], 201);
    }

    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $subscriber = NewsletterSubscriber::where('email', $validated['email'])->first();

        if ($subscriber) {
            $subscriber->delete();
        }

        return response()->json(['message' => 'Berhasil berhenti berlangganan.']);
    }

    public function unsubscribeByToken(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $subscriber = NewsletterSubscriber::where('token', $validated['token'])->first();

        if (!$subscriber) {
            return response()->json(['message' => 'Token tidak valid.'], 404);
        }

        $subscriber->delete();

        return response()->json(['message' => 'Berhasil berhenti berlangganan.']);
    }
}
