<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Hash;

class Student extends Model
{
    /** @use HasFactory<\Database\Factories\StudentFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'grade',
        'class',
        'year',
        'avatar',
        'user_id',
    ];

    protected $casts = [
        'grade' => 'integer',
        'class' => 'integer',
        'year' => 'integer',
    ];

    /**
     * 模型启动时注册事件监听
     */
    protected static function boot(): void
    {
        parent::boot();

        // 创建学生时自动创建用户账户
        static::created(function (Student $student): void {
            if (! $student->user_id) {
                $user = User::create([
                    'name' => $student->name,
                    'email' => "student{$student->id}@student.local",
                    'password' => Hash::make('123456'), // 统一默认密码
                    'role' => User::ROLE_STUDENT,
                    'avatar' => $student->avatar,
                ]);
                $student->update(['user_id' => $user->id]);
            }
        });

        // 更新学生时同步更新用户账户
        static::updated(function (Student $student): void {
            if ($student->user_id && $student->user) {
                $updateData = [];
                if ($student->isDirty('name')) {
                    $updateData['name'] = $student->name;
                }
                if ($student->isDirty('avatar')) {
                    $updateData['avatar'] = $student->avatar;
                }
                if (! empty($updateData)) {
                    $student->user->update($updateData);
                }
            }
        });

        // 删除学生时删除关联的用户账户
        static::deleted(function (Student $student): void {
            if ($student->user_id && $student->user) {
                $student->user->delete();
            }
        });
    }

    public function getGradeTextAttribute(): string
    {
        $grades = [1 => '一', 2 => '二', 3 => '三', 4 => '四', 5 => '五', 6 => '六'];

        return $grades[$this->grade] ?? '未知';
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
