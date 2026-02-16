<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentLoginLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'student_id',
        'ip_address',
        'user_agent',
        'login_type',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * 操作人（教师）
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 被登录的学生
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
