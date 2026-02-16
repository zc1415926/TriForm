<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // 为现有学生创建用户账户
        $this->createUserAccountsForExistingStudents();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }

    /**
     * 为现有学生创建用户账户
     */
    private function createUserAccountsForExistingStudents(): void
    {
        $students = \App\Models\Student::whereNull('user_id')->get();
        $defaultPassword = Hash::make('123456'); // 统一默认密码

        foreach ($students as $student) {
            // 检查是否已存在该学生的用户账户
            $email = "student{$student->id}@student.local";
            $existingUser = \App\Models\User::where('email', $email)->first();

            if ($existingUser) {
                $student->update(['user_id' => $existingUser->id]);

                continue;
            }

            // 创建用户账户
            $user = \App\Models\User::create([
                'name' => $student->name,
                'email' => $email,
                'password' => $defaultPassword,
                'role' => \App\Models\User::ROLE_STUDENT,
                'avatar' => $student->avatar,
            ]);

            // 关联学生与用户
            $student->update(['user_id' => $user->id]);
        }
    }
};
