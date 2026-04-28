<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficeLocation extends Model
{
    protected $fillable = [
        'location',
        'reviewer_id',
        'am_in',
        'am_out',
        'pm_in',
        'pm_out'
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
            'am_in' => $this->am_in,
            'am_out' => $this->am_out,
            'pm_in' => $this->pm_in,
            'pm_out' => $this->pm_out,
        ];
    }
}