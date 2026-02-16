<?php

namespace App\Listeners;

use App\Models\Student;
use App\Models\StudentLoginLog;
use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;

class LogStudentLogin
{
    /**
     * HTTP 请求实例
     */
    protected Request $request;

    /**
     * Create the event listener.
     */
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        // 只处理学生登录
        if (! $user || ! $user->isStudent()) {
            return;
        }

        // 查找关联的学生
        $student = Student::where('user_id', $user->id)->first();

        if (! $student) {
            return;
        }

        // 记录登录日志
        StudentLoginLog::create([
            'user_id' => $user->id,
            'student_id' => $student->id,
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
            'login_type' => 'student',
        ]);
    }
}
