<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
protected $fillable = [
        'employee_id',
        'is_shared',
        'reviewer_id',
        'file_path',
        'review_file_path',
        'status',
        'reviewer_note',
        'submitted_at',
        'reviewed_at',
        'is_draft',
    ];

    protected function casts(): array
    {
        return [
            'is_draft' => 'boolean',
            'is_shared' => 'boolean',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Scope for shared PDFs within last 30 days
     */
    public function scopeRecentShared($query)
    {
        return $query->where('is_shared', true)
                     ->where('created_at', '>=', now()->subDays(30));
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee_name' => $this->employee ? $this->employee->full_name : "",
            'reviewer_id' => $this->reviewer_id,
            'file_path' => $this->file_path,
            'review_file_path' => $this->review_file_path,
            'status' => $this->status,
            'reviewer_note' => $this->reviewer_note,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
            'submitted_at' => $this->submitted_at ? $this->submitted_at->toISOString() : null,
            'reviewed_at' => $this->reviewed_at ? $this->reviewed_at->toISOString() : null,
            'is_draft' => (bool) $this->is_draft,
        ];
    }
}