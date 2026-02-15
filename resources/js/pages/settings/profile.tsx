import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '个人资料设置',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    // 如果用户未登录，显示提示信息
    if (!auth.user) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Profile settings" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">请先登录</h2>
                        <p className="mt-2 text-muted-foreground">
                            您需要登录才能访问此页面
                        </p>
                        <Link
                            href="/login"
                            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            前往登录
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="个人资料设置" />

            <h1 className="sr-only">个人资料设置</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="个人资料信息"
                        description="更新您的姓名和邮箱地址"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-gray-700 font-medium">姓名</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        defaultValue={auth.user!.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="请输入您的姓名"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-gray-700 font-medium">邮箱地址</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        defaultValue={auth.user!.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="请输入您的邮箱地址"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user!.email_verified_at === null && (
                                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                                            <p className="text-sm text-amber-800">
                                                您的邮箱地址尚未验证。{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="font-medium text-amber-900 underline decoration-amber-400 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-amber-600"
                                                >
                                                    点击此处重新发送验证邮件
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-3 text-sm font-medium text-green-600 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                    新的验证链接已发送到您的邮箱
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                        保存修改
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            已保存
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
