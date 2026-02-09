<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class EditorialStaff extends Model
{
    use HasUuids;

    protected $table = 'editorial_staff';

    protected $fillable = ['name', 'position', 'sort_order'];
}
