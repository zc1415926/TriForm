<?php

use App\Events\LoginHistoryRequested;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\UploadController;
use Illuminate\Http\Request;
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
        Route::post('/logout', [SubmissionController::class, 'studentLogout'])->name('logout');
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

    // 教师监控 API（需要教师权限）- 只保留广播发送功能
    Route::middleware(['auth'])->prefix('teacher')->group(function () {
        // 发送广播请求（学生从本地显示登录记录）
        Route::post('/broadcast-login-check', function (Request $request) {
            $user = $request->user();

            if (! $user->isAdmin() && ! $user->isTeacher()) {
                return response()->json(['error' => '无权访问'], 403);
            }

            $targetStudentId = $request->input('target_student_id');

            try {
                // 广播事件
                event(new LoginHistoryRequested($user, $targetStudentId));

                return response()->json([
                    'success' => true,
                    'message' => $targetStudentId ? '已向指定学生发送请求' : '已向所有在线学生发送请求',
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => '广播发送失败: '.$e->getMessage(),
                ], 500);
            }
        })->name('api.teacher.broadcast-login-check');
    });
});
