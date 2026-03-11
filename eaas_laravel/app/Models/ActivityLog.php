<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'details',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function toArray()
    {
        $userName = "System";
        $userRole = "System";
        
        if ($this->user) {
            $userName = $this->user->full_name;
            $userRole = $this->user->role;
        }

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user_name' => $userName,
            'user_role' => $userRole,
            'action' => $this->action,
            'entity_type' => $this->entity_type,
            'entity_id' => (string) $this->entity_id,
            'details' => $this->details,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}