<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'video_type',
        'duration',
        'is_featured',
        'views',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];
}
