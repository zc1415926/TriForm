<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    protected $fillable = [
        'name',
        'upload_type_id',
        'lesson_id',
        'is_required',
        'is_published',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_published' => 'boolean',
    ];

    public function uploadType(): BelongsTo
    {
        return $this->belongsTo(UploadType::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}