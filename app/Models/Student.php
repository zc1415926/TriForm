<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    /** @use HasFactory<\Database\Factories\StudentFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'grade',
        'class',
        'year',
    ];

    protected $casts = [
        'grade' => 'integer',
        'class' => 'integer',
        'year' => 'integer',
    ];

    public function getGradeTextAttribute(): string
    {
        $grades = [1 => '一', 2 => '二', 3 => '三', 4 => '四', 5 => '五', 6 => '六'];

        return $grades[$this->grade] ?? '未知';
    }
}
