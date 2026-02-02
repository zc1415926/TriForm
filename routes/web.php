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

require __DIR__.'/settings.php';
