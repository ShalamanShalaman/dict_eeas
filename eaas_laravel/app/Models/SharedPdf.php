<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SharedPdf extends Model
{
    protected $fillable = [
        'document_id',
        'uploader_id',
        'uploader_name',
        'office_name',
        'file_path',
        'display_name',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class, 'document_id');
    }
}
