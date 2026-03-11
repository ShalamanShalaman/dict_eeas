<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'user_id',
        'public_id',
        'email',
        'password',
        'role',
        'first_name',
        'middle_name',
        'last_name',
        'contact_no',
        'profile_picture',
        'profile_picture_updated',
        'is_active',
        'force_change_password',
        'office_location_id',
        'position_id',
        'last_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'force_change_password' => 'boolean',
            'profile_picture_updated' => 'datetime',
            'last_login' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->public_id)) {
                $model->public_id = (string) Str::uuid();
            }
        });
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function officeLocation()
    {
        return $this->belongsTo(OfficeLocation::class);
    }

    public function submittedDocuments()
    {
        return $this->hasMany(Document::class, 'employee_id');
    }

    public function reviewedDocuments()
    {
        return $this->hasMany(Document::class, 'reviewer_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function reviewedOffices()
    {
        return $this->hasMany(OfficeLocation::class, 'reviewer_id');
    }

    public function getFullNameAttribute()
    {
        $middle = $this->middle_name ? ' ' . $this->middle_name : '';
        return trim("{$this->first_name}{$middle} {$this->last_name}");
    }

    public function getAdjustmentNameAttribute()
    {
        $mi = $this->middle_name ? strtoupper(substr(trim($this->middle_name), 0, 1)) . '.' : '';
        if ($mi) {
            return trim("{$this->last_name}, {$this->first_name} {$mi}");
        }
        return trim("{$this->last_name}, {$this->first_name}");
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'user_id' => $this->user_id,
            'email' => $this->email,
            'role' => $this->role,
            'full_name' => $this->full_name,
            'adjustment_name' => $this->adjustment_name,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'contact_no' => $this->contact_no,
            'profile_picture' => $this->profile_picture,
            'profile_picture_updated' => $this->profile_picture_updated ? $this->profile_picture_updated->toISOString() : null,
            'is_active' => $this->is_active,
            'office_location_id' => $this->office_location_id,
            'position_id' => $this->position ? $this->position->name : "",
            'office_name' => $this->officeLocation ? $this->officeLocation->location : "",
            'provincial_officer' => $this->officeLocation && $this->officeLocation->reviewer ? $this->officeLocation->reviewer->full_name : "",
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}