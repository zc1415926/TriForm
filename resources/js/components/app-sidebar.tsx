import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, Folder, GraduationCap, LayoutGrid, Upload, Users, Calendar, UploadCloud, Eye } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import AppLogo from './app-logo';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            roles: string[];
            is_admin: boolean;
            is_teacher: boolean;
            is_student: boolean;
        } | null;
    };
}

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    // 判断是否显示管理菜单（管理员或教师）
    const canAccessManagement = user?.is_admin || user?.is_teacher;

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
                <SidebarMenu>
                    {/* Dashboard - 所有用户可见 */}
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Dashboard">
                            <Link href={dashboard()}>
                                <LayoutGrid />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* 教学管理菜单 - 仅管理员和教师可见，始终展开 */}
                    {canAccessManagement && (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton disabled tooltip="教学管理" className="opacity-100 cursor-default">
                                    <GraduationCap />
                                    <span className="font-semibold">教学管理</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/submissions/show">
                                            <Eye />
                                            <span>查看作品</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/lessons">
                                            <Calendar />
                                            <span>课时管理</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/upload-types">
                                            <Upload />
                                            <span>上传类型</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/assignments">
                                            <FileText />
                                            <span>作业管理</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/students">
                                            <Users />
                                            <span>学生管理</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </>
                    )}

                    {/* 作品提交 - 所有用户可见 */}
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="作品提交">
                            <Link href="/submissions">
                                <UploadCloud />
                                <span>作品提交</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* 作品广场 - 所有用户可见 */}
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="作品广场">
                            <Link href="/submissions/gallery">
                                <LayoutGrid />
                                <span>作品广场</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter
                    items={[
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
                    ]}
                    className="mt-auto"
                />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
