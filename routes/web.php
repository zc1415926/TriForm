<?php

use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('dashboard');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');

Route::resource('students', StudentController::class);

Route::resource('upload-types', \App\Http\Controllers\UploadTypeController::class);

Route::resource('assignments', \App\Http\Controllers\AssignmentController::class);

Route::resource('lessons', \App\Http\Controllers\LessonController::class);

Route::post('api/upload/ckeditor-image', [\App\Http\Controllers\UploadController::class, 'ckeditorImage']);
Route::post('api/upload/move-lesson-images', [\App\Http\Controllers\UploadController::class, 'moveLessonImages']);

Route::get('submissions', [\App\Http\Controllers\SubmissionController::class, 'index'])->name('submissions.index');
Route::get('submissions/show', [\App\Http\Controllers\SubmissionController::class, 'show'])->name('submissions.show');
Route::get('submissions/gallery', [\App\Http\Controllers\SubmissionController::class, 'gallery'])->name('submissions.gallery');
Route::post('submissions', [\App\Http\Controllers\SubmissionController::class, 'store'])->name('submissions.store');

// API routes for submissions
Route::get('api/submissions/students-by-year', [\App\Http\Controllers\SubmissionController::class, 'getStudentsByYear']);
Route::get('api/submissions/lessons-by-year', [\App\Http\Controllers\SubmissionController::class, 'getLessonsByYear']);
Route::get('api/submissions/assignments-by-lesson', [\App\Http\Controllers\SubmissionController::class, 'getAssignmentsByLesson']);
Route::get('api/submissions/submissions-by-assignment', [\App\Http\Controllers\SubmissionController::class, 'getSubmissionsByAssignment']);
Route::get('api/submissions/all', [\App\Http\Controllers\SubmissionController::class, 'getAllSubmissions']);
Route::post('api/submissions/score', [\App\Http\Controllers\SubmissionController::class, 'updateScore']);
Route::post('api/submissions/cancel-score', [\App\Http\Controllers\SubmissionController::class, 'cancelScore']);
Route::delete('api/submissions/{id}', [\App\Http\Controllers\SubmissionController::class, 'destroy']);

require __DIR__.'/settings.php';
