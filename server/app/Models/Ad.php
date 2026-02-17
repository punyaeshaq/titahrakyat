<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'image_url',
        'target_url',
        'positions',
        'is_active',
        'start_date',
        'end_date',
        'click_count',
        'view_count',
        'sort_order',
        'max_width',
    ];

    protected $casts = [
        'positions' => 'array',
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'click_count' => 'integer',
        'view_count' => 'integer',
        'sort_order' => 'integer',
        'max_width' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')
                    ->orWhere('start_date', '<=', now()->toDateString());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now()->toDateString());
            });
    }

    /**
     * Filter ads that include a specific position in their positions array.
     */
    public function scopePosition($query, string $position)
    {
        return $query->where(function ($q) use ($position) {
            $q->whereJsonContains('positions', $position)
                ->orWhere('positions', 'LIKE', '%"' . $position . '"%');
        });
    }
}
