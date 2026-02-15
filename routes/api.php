<?php

use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// 使用 web 中间件以支持 session 认证
Route::middleware(['web'])->group(function () {
    // 公开访问的 API（作品提交相关）
    Route::prefix('submissions')->name('api.submissions.')->group(function () {
        Route::get('/students-by-year', [SubmissionController::class, 'getStudentsByYear'])->name('students-by-year');
        Route::get('/lessons-by-year', [SubmissionController::class, 'getLessonsByYear'])->name('lessons-by-year');
        Route::get('/assignments-by-lesson', [SubmissionController::class, 'getAssignmentsByLesson'])->name('assignments-by-lesson');
        Route::get('/submissions-by-assignment', [SubmissionController::class, 'getSubmissionsByAssignment'])->name('submissions-by-assignment');
        Route::get('/all', [SubmissionController::class, 'getAllSubmissions'])->name('all');
        Route::post('/{id}/like', [SubmissionController::class, 'likeSubmission'])->name('like');
    });

    // 学生相关 API
    Route::prefix('student')->name('api.student.')->group(function () {
        Route::post('/login', [SubmissionController::class, 'studentLogin'])->name('login');
        Route::get('/dashboard', [SubmissionController::class, 'studentDashboard'])->name('dashboard');
    });

    // 需要认证的 API
    Route::middleware(['auth'])->prefix('submissions')->name('api.submissions.')->group(function () {
        Route::post('/score', [SubmissionController::class, 'updateScore'])->name('score');
        Route::post('/cancel-score', [SubmissionController::class, 'cancelScore'])->name('cancel-score');
        Route::post('/batch-score', [SubmissionController::class, 'batchScore'])->name('batch-score');
        Route::get('/student-report/{studentId}', [SubmissionController::class, 'studentReport'])->name('student-report');
        Route::get('/class-report', [SubmissionController::class, 'classReport'])->name('class-report');
        Route::delete('/{id}', [SubmissionController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/preview', [SubmissionController::class, 'uploadPreview'])->name('upload-preview');
    });

    // 上传相关 API（需要认证）
    Route::middleware(['auth'])->prefix('upload')->group(function () {
        Route::post('/ckeditor-image', [UploadController::class, 'ckeditorImage'])->name('api.upload.ckeditor-image');
        Route::post('/move-lesson-images', [UploadController::class, 'moveLessonImages'])->name('api.upload.move-lesson-images');
        Route::post('/attachment', [UploadController::class, 'attachment'])->name('api.upload.attachment');
    });
});
