<?php
// app/Notifications/NewKnowledgebaseRequest.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\PendingKnowledgebase;

class NewKnowledgebaseRequest extends Notification
{
    use Queueable;
    protected $pending;

    public function __construct(PendingKnowledgebase $pending)
    {
        $this->pending = $pending;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'title' => 'New Knowledgebase Request',
            'message' => 'Dr. ' . $this->pending->doctor->name . ' added "' . $this->pending->title . '" for review.',
            'pending_id' => $this->pending->id,
        ];
    }
}
