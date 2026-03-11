<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficeLocation extends Model
{
    protected $fillable = [
        'location',
        'reviewer_id',
    ];

    public function employees()
    {
        return $this->hasMany(User::class, 'office_location_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'location' => $this->location,
            'reviewer_id' => $this->reviewer_id,
        ];
    }
}