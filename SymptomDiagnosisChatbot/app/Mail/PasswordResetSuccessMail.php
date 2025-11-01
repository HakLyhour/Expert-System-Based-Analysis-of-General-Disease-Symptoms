<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $resetTime;

    public function __construct($userName = 'User')
    {
        $this->userName = $userName;
        $this->resetTime = now()->format('F j, Y \a\t g:i A');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Password Reset Successful - PiKrus',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset-success',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}