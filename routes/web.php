<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

// 首页 - 根据用户角色重定向
Route::get('/', [DashboardController::class, 'index'])->name('home');

// 作品广场 - 公开访问
Route::get('submissions/gallery', [\App\Http\Controllers\SubmissionController::class, 'gallery'])->name('submissions.gallery');

// 作品提交 - 公开访问
Route::get('submissions', [\App\Http\Controllers\SubmissionController::class, 'index'])->name('submissions.index');
Route::post('submissions', [\App\Http\Controllers\SubmissionController::class, 'store'])->name('submissions.store');

// 作品提交 API - 公开访问
Route::get('api/submissions/students-by-year', [\App\Http\Controllers\SubmissionController::class, 'getStudentsByYear'])->name('api.submissions.students-by-year');
Route::get('api/submissions/lessons-by-year', [\App\Http\Controllers\SubmissionController::class, 'getLessonsByYear'])->name('api.submissions.lessons-by-year');
Route::get('api/submissions/assignments-by-lesson', [\App\Http\Controllers\SubmissionController::class, 'getAssignmentsByLesson'])->name('api.submissions.assignments-by-lesson');
Route::get('api/submissions/submissions-by-assignment', [\App\Http\Controllers\SubmissionController::class, 'getSubmissionsByAssignment'])->name('api.submissions.submissions-by-assignment');
Route::get('api/submissions/all', [\App\Http\Controllers\SubmissionController::class, 'getAllSubmissions'])->name('api.submissions.all');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('students', StudentController::class);
    Route::get('students/template/download', [StudentController::class, 'downloadTemplate'])->name('students.template.download');
    Route::post('students/import', [StudentController::class, 'import'])->name('students.import');
    Route::get('students/export/all', [StudentController::class, 'export'])->name('students.export');

    Route::resource('upload-types', \App\Http\Controllers\UploadTypeController::class);

    Route::resource('assignments', \App\Http\Controllers\AssignmentController::class);

    Route::resource('lessons', \App\Http\Controllers\LessonController::class);
    Route::post('lessons/{lesson}/duplicate', [\App\Http\Controllers\LessonController::class, 'duplicate'])->name('lessons.duplicate');
    Route::get('lessons/{lesson}/export', [\App\Http\Controllers\LessonController::class, 'export'])->name('lessons.export');
    Route::post('lessons/import', [\App\Http\Controllers\LessonController::class, 'import'])->name('lessons.import');

    Route::post('api/upload/ckeditor-image', [\App\Http\Controllers\UploadController::class, 'ckeditorImage']);
    Route::post('api/upload/move-lesson-images', [\App\Http\Controllers\UploadController::class, 'moveLessonImages']);
    Route::post('api/upload/attachment', [\App\Http\Controllers\UploadController::class, 'attachment']);

    // 查看作品 - 需要登录
    Route::get('submissions/show', [\App\Http\Controllers\SubmissionController::class, 'show'])->name('submissions.show');

    // 作品管理 API - 需要登录（评分、删除等）
    Route::post('api/submissions/score', [\App\Http\Controllers\SubmissionController::class, 'updateScore'])->name('api.submissions.score');
    Route::post('api/submissions/cancel-score', [\App\Http\Controllers\SubmissionController::class, 'cancelScore'])->name('api.submissions.cancel-score');
    Route::delete('api/submissions/{id}', [\App\Http\Controllers\SubmissionController::class, 'destroy'])->name('api.submissions.destroy');
    Route::post('api/submissions/{id}/preview', [\App\Http\Controllers\SubmissionController::class, 'uploadPreview'])->name('api.submissions.upload-preview');
});

require __DIR__.'/settings.php';
