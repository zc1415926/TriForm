import { Form, Head } from '@inertiajs/react';
import { GraduationCap, Lock, Mail, Sparkles } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';

type Props = {
    status?: string;
};

export default function Login({
    status,
}: Props) {
    return (
        <AuthLayout
            title="欢迎回来"
            description="请输入您的邮箱和密码登录系统"
        >
            <Head title="登录" />

            <Form
                {...store()}
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    邮箱地址
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="请输入邮箱地址"
                                    className="rounded-xl h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-gray-400" />
                                    密码
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="请输入密码"
                                    className="rounded-xl h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="remember" className="text-gray-600">记住我</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full rounded-xl h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                <GraduationCap className="w-5 h-5 mr-2" />
                                登录
                            </Button>
                        </div>


                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-green-800 font-medium text-sm">{status}</span>
                </div>
            )}
        </AuthLayout>
    );
}
