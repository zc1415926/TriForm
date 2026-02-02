<?php

use App\Http\Controllers\UploadTypeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [UploadTypeController::class, 'index'])->name('index');
    Route::get('/create', [UploadTypeController::class, 'create'])->name('create');
    Route::post('/', [UploadTypeController::class, 'store'])->name('store');
    Route::get('/{uploadType}/edit', [UploadTypeController::class, 'edit'])->name('edit');
    Route::put('/{uploadType}', [UploadTypeController::class, 'update'])->name('update');
    Route::delete('/{uploadType}', [UploadTypeController::class, 'destroy'])->name('destroy');
});