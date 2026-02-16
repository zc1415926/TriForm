<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return md5_file(public_path('build/manifest.json'));
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // 获取学生信息（支持两种登录方式）
        $student = null;

        // 方式1：通过 session（旧的学生登录方式）
        $sessionStudentId = session('student_id');
        if ($sessionStudentId) {
            $student = \App\Models\Student::find($sessionStudentId);
        }

        // 方式2：通过 Fortify 登录的用户关联（新的学生登录方式）
        if (! $student && $user && $user->isStudent()) {
            $student = \App\Models\Student::where('user_id', $user->id)->first();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'roles' => $user->getRoles(),
                    'is_admin' => $user->isAdmin(),
                    'is_teacher' => $user->isTeacher(),
                    'is_student' => $user->isStudent(),
                ] : null,
                'student' => $student ? [
                    'id' => $student->id,
                    'name' => $student->name,
                    'grade' => $student->grade,
                    'class' => $student->class,
                    'year' => $student->year,
                    'is_student_account' => true,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'csrf' => csrf_token(),
        ];
    }
}
