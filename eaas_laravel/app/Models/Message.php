<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'subject',
        'message',
        'is_read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Mark message as read
     */
    public function markAsRead()
    {
        $this->is_read = true;
        $this->read_at = now();
        $this->save();
    }

    /**
     * Scope for unread messages
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for messages received by a user
     */
    public function scopeInbox($query, $userId)
    {
        return $query->where('recipient_id', $userId);
    }

    /**
     * Scope for messages sent by a user
     */
    public function scopeSent($query, $userId)
    {
        return $query->where('sender_id', $userId);
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'sender_id' => $this->sender_id,
            'recipient_id' => $this->recipient_id,
            'sender_name' => $this->sender ? $this->sender->full_name : 'Unknown',
            'sender_user_id' => $this->sender ? $this->sender->user_id : null,
            'recipient_name' => $this->recipient ? $this->recipient->full_name : 'Unknown',
            'recipient_user_id' => $this->recipient ? $this->recipient->user_id : null,
            'subject' => $this->subject,
            'message' => $this->message,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at ? $this->read_at->toISOString() : null,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}