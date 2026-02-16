<?php

use Illuminate\Support\Facades\Broadcast;

// 配置广播认证路由使用web中间件（支持session登录的学生）
Broadcast::routes(['middleware' => ['web']]);

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// 学生私有频道 - 学生自己可以订阅
Broadcast::channel('student.{studentId}', function (?\Illuminate\Contracts\Auth\Authenticatable $user, int $studentId): bool {
    \Log::debug('[频道授权] 学生频道授权请求', [
        'student_id_param' => $studentId,
        'user_id' => $user?->id,
        'user_type' => $user ? get_class($user) : 'null',
        'session_student_id' => session('student_id'),
    ]);

    // 学生通过 User 关联验证（Fortify 登录）
    if ($user instanceof \App\Models\User && $user->isStudent()) {
        $student = \App\Models\Student::where('user_id', $user->id)->first();
        \Log::debug('[频道授权] 检查学生用户', [
            'found_student' => $student?->id,
            'matches' => $student && $student->id === $studentId,
        ]);

        if ($student && $student->id === $studentId) {
            \Log::info('[频道授权] ✅ 学生授权成功', ['student_id' => $studentId, 'user_id' => $user->id]);

            return true;
        }
    }

    // 教师可以订阅任何学生频道
    if ($user instanceof \App\Models\User && ($user->isAdmin() || $user->isTeacher())) {
        \Log::info('[频道授权] ✅ 教师授权成功', ['student_id' => $studentId, 'user_id' => $user->id]);

        return true;
    }

    // 向后兼容：通过 session 验证（旧的学生登录方式）
    $sessionStudentId = session('student_id');
    if ($sessionStudentId !== null && (int) $sessionStudentId === $studentId) {
        \Log::info('[频道授权] ✅ Session授权成功', ['student_id' => $studentId]);

        return true;
    }

    \Log::warning('[频道授权] ❌ 授权失败', [
        'student_id' => $studentId,
        'user_id' => $user?->id,
        'session_student_id' => $sessionStudentId,
    ]);

    return false;
});

// 学生公共频道 - 任何人都可以订阅
Broadcast::channel('students', function () {
    return true;
});
