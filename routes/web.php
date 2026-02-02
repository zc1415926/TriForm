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

Route::get('submissions', [\App\Http\Controllers\SubmissionController::class, 'index'])->name('submissions.index');
Route::post('submissions', [\App\Http\Controllers\SubmissionController::class, 'store'])->name('submissions.store');

// API routes for submissions
Route::get('api/submissions/students-by-year', [\App\Http\Controllers\SubmissionController::class, 'getStudentsByYear']);
Route::get('api/submissions/lessons-by-year', [\App\Http\Controllers\SubmissionController::class, 'getLessonsByYear']);
Route::get('api/submissions/assignments-by-lesson', [\App\Http\Controllers\SubmissionController::class, 'getAssignmentsByLesson']);

require __DIR__.'/settings.php';