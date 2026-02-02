import { Link } from '@inertiajs/react';
import { BookOpen, FileText, Folder, LayoutGrid, Upload, Users, Calendar, UploadCloud } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: '学生管理',
        href: '/students',
        icon: Users,
    },
    {
        title: '课时管理',
        href: '/lessons',
        icon: Calendar,
    },
    {
        title: '作业管理',
        href: '/assignments',
        icon: FileText,
    },
    {
        title: '上传类型管理',
        href: '/upload-types',
        icon: Upload,
    },
    {
        title: '作品提交',
        href: '/submissions',
        icon: UploadCloud,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: '帮助文档',
        href: '/help',
        icon: BookOpen,
    },
    {
        title: '关于系统',
        href: '/about',
        icon: Folder,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}