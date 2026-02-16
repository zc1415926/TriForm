<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubmissionController;
use Illuminate\Support\Facades\Route;

// 首页 - 根据用户角色重定向
Route::get('/', [DashboardController::class, 'index'])->name('home');

// 作品广场 - 公开访问
Route::get('submissions/gallery', [SubmissionController::class, 'gallery'])->name('submissions.gallery');

// 作品提交 - 公开访问
Route::get('submissions', [SubmissionController::class, 'index'])->name('submissions.index');
Route::post('submissions', [SubmissionController::class, 'store'])->name('submissions.store');

// 学生登录页面 - 公开访问（用于直接访问学生登录界面）
Route::inertia('student/login', 'student/login')->name('student.login');

// 学生个人中心 - 需要认证
Route::middleware(['auth'])->group(function () {
    Route::inertia('student/dashboard', 'student/dashboard')->name('student.dashboard');
});

// 需要认证的路由
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 学生管理 - 自定义路由必须在 resource 之前定义
    Route::inertia('students/report', 'students/report')->name('students.report');
    Route::inertia('students/class-report', 'students/class-report')->name('students.class-report');
    Route::get('students/{student}/report-pdf', [SubmissionController::class, 'exportStudentReportPdf'])->name('students.report.pdf');
    Route::get('students/template/download', [StudentController::class, 'downloadTemplate'])->name('students.template.download');
    Route::post('students/import', [StudentController::class, 'import'])->name('students.import');
    Route::get('students/export/all', [StudentController::class, 'export'])->name('students.export');
    Route::resource('students', StudentController::class);

    // 课时管理
    Route::resource('lessons', LessonController::class);
    Route::post('lessons/{lesson}/duplicate', [LessonController::class, 'duplicate'])->name('lessons.duplicate');
    Route::get('lessons/{lesson}/export', [LessonController::class, 'export'])->name('lessons.export');
    Route::post('lessons/import', [LessonController::class, 'import'])->name('lessons.import');

    // 作业管理
    Route::resource('assignments', AssignmentController::class);

    // 查看作品 - 需要登录
    Route::get('submissions/show', [SubmissionController::class, 'show'])->name('submissions.show');

    // 教师登录监控页面（仅管理员和教师）
    Route::middleware(['role:admin,teacher'])->group(function () {
        Route::inertia('teacher/login-monitor', 'teacher/login-monitor')->name('teacher.login-monitor');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/upload-types.php';
