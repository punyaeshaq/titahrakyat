<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentLike extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['comment_id', 'ip_address', 'user_agent'];

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }
}
