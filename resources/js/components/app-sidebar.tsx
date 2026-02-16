import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, Folder, GraduationCap, LayoutGrid, Upload, Users, Calendar, UploadCloud, Eye, User, Sparkles, Shield } from 'lucide-react';
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
import type { SharedData } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const student = auth.student;

    // 判断是否显示管理菜单（管理员或教师）
    const canAccessManagement = user?.is_admin || user?.is_teacher;
    // 判断是否为学生登录
    const isStudentLoggedIn = !!student;

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
                    {/* 学生登录时的菜单 */}
                    {isStudentLoggedIn && (
                        <>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="我的空间">
                                    <Link href="/student/dashboard">
                                        <User />
                                        <span>我的空间</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="作品提交">
                                    <Link href="/submissions">
                                        <UploadCloud />
                                        <span>作品提交</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="作品广场">
                                    <Link href="/submissions/gallery">
                                        <Sparkles />
                                        <span>作品广场</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}

                    {/* 教师/管理员登录时的菜单 */}
                    {!isStudentLoggedIn && (
                        <>
                            {/* 仪表盘 - 学生可见（独立菜单），管理员/教师在教学管理下 */}
                            {!canAccessManagement && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="仪表盘">
                                        <Link href={dashboard()}>
                                            <LayoutGrid />
                                            <span>仪表盘</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}

                            {/* 教学管理菜单 - 仅管理员和教师可见 */}
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
                                                <Link href={dashboard()}>
                                                    <LayoutGrid />
                                                    <span>仪表盘</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
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
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild>
                                                <Link href="/teacher/login-monitor">
                                                    <Shield />
                                                    <span>登录监控</span>
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
                        </>
                    )}
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
