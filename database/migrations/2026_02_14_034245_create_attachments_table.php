<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->string('original_name'); // 原始文件名
            $table->string('file_name'); // 存储的文件名
            $table->string('file_path'); // 文件路径
            $table->string('mime_type'); // 文件类型
            $table->unsignedBigInteger('file_size'); // 文件大小（字节）
            $table->string('file_extension', 50); // 文件扩展名
            $table->timestamps();

            $table->index('lesson_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
