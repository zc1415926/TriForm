<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UploadType extends Model
{
    protected $fillable = [
        'name',
        'description',
        'extensions',
        'max_size',
    ];

    protected $casts = [
        'extensions' => 'array',
        'max_size' => 'integer',
    ];
}
