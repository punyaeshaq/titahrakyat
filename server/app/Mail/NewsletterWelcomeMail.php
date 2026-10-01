<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $unsubscribeUrl;

    public function __construct(string $unsubscribeToken)
    {
        $this->unsubscribeUrl = config('app.frontend_url', 'https://menarapublik.news') . '/newsletter/unsubscribe?token=' . $unsubscribeToken;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Selamat Datang di Newsletter MenaraPublik.News!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter-welcome',
        );
    }
}
