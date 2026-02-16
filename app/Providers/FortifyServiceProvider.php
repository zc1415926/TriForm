<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->configureAuthentication();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }

    /**
     * Configure custom authentication logic.
     */
    private function configureAuthentication(): void
    {
        // 自定义认证逻辑 - 支持学生账户登录
        Fortify::authenticateUsing(function (Request $request) {
            $email = $request->input('email');
            $password = $request->input('password');

            \Log::debug('[登录] 认证请求', [
                'email' => $email,
                'has_password' => ! empty($password),
            ]);

            // 检查是否是学生账户登录（email 格式为 student{id}@student.local）
            if (str_starts_with($email, 'student') && str_ends_with($email, '@student.local')) {
                // 提取学生 ID
                $studentId = (int) str_replace(['student', '@student.local'], '', $email);

                \Log::debug('[登录] 学生账户登录', ['student_id' => $studentId]);

                // 查找学生
                $student = \App\Models\Student::find($studentId);

                if (! $student) {
                    \Log::warning('[登录] 学生不存在', ['student_id' => $studentId]);

                    return null;
                }

                if (! $student->user_id) {
                    \Log::warning('[登录] 学生未关联用户', ['student_id' => $studentId]);

                    return null;
                }

                // 获取关联的用户
                $user = $student->user;

                if (! $user) {
                    \Log::warning('[登录] 关联用户不存在', ['user_id' => $student->user_id]);

                    return null;
                }

                // 验证密码（学生使用统一密码 '123456'）
                if (! \Illuminate\Support\Facades\Hash::check($password, $user->password)) {
                    \Log::warning('[登录] 密码验证失败', ['student_id' => $studentId, 'user_id' => $user->id]);

                    return null;
                }

                // 将 student_id 存入 session，以便后续使用
                session(['student_id' => $student->id]);

                \Log::info('[登录] 学生登录成功', [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'user_id' => $user->id,
                ]);

                return $user;
            }

            // 普通用户登录（教师/管理员）
            $user = User::where('email', $email)->first();

            if (! $user || ! \Illuminate\Support\Facades\Hash::check($password, $user->password)) {
                return null;
            }

            // 清除可能存在的 student_id
            session()->forget('student_id');

            return $user;
        });
    }
}
