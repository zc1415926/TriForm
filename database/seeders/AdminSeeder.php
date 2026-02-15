<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 创建管理员账号
        User::firstOrCreate(
            ['email' => 'zc1415926@126.com'],
            [
                'name' => '管理员',
                'role' => 'admin,teacher,student',
                'password' => Hash::make('zaq12wsx'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('管理员账号创建成功！');
        $this->command->info('邮箱: zc1415926@126.com');
        $this->command->info('密码: zaq12wsx');
        $this->command->info('角色: admin,teacher,student');
    }
}
