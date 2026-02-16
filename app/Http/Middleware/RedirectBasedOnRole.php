<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectBasedOnRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // 学生重定向到学生仪表板
            if ($user->isStudent() && ! $user->isAdmin() && ! $user->isTeacher()) {
                // 如果当前不是在学生页面，重定向到学生仪表板
                if (! $request->is('student/*') && ! $request->is('api/*') && ! $request->is('broadcasting/*')) {
                    // 检查是否有需要跳转的意图
                    if ($request->is('dashboard') || $request->is('/')) {
                        return redirect()->intended('/student/dashboard');
                    }
                }
            }
        }

        return $next($request);
    }
}
