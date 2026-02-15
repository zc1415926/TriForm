import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { User, Lock, Shield, Palette, Sparkles } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: '个人资料',
        href: edit(),
        icon: User,
    },
    {
        title: '修改密码',
        href: editPassword(),
        icon: Lock,
    },
    {
        title: '双重认证',
        href: show(),
        icon: Shield,
    },
    {
        title: '外观设置',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">设置</h1>
                        <p className="text-gray-500">管理您的个人资料和账户设置</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-56">
                    <nav
                        className="flex flex-col space-y-1 space-x-0 bg-gray-50/50 p-2 rounded-xl"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                    'w-full justify-start rounded-lg h-10',
                                    isCurrentUrl(item.href)
                                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                        : 'hover:bg-white hover:shadow-sm'
                                )}
                            >
                                <Link href={item.href} className="flex items-center gap-2">
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    <span className="font-medium">{item.title}</span>
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
