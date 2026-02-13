<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UploadType extends Model
{
    use HasFactory;

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
