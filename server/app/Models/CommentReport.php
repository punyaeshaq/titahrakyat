<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentReport extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['comment_id', 'reason', 'ip_address'];

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }
}
