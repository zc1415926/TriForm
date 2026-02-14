import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { LessonDetailDialog } from '@/components/lesson-detail-dialog';
import AppLayout from '@/layouts/app-layout';
import { index, create, edit, destroy } from '@/routes/lessons';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '课时管理',
        href: index().url,
    },
];

interface UploadType {
    id: number;
    name: string;
    description: string | null;
}

interface Lesson {
    id: number;
    name: string;
    year: string;
    is_active: boolean;
    content: string | null;
    created_at: string;
    assignments_count: number;
    assignments: {
        id: number;
        name: string;
        upload_type_id: number;
        is_required: boolean;
        is_published: boolean;
    }[];
}

type PageProps = {
    lessons: Lesson[];
    uploadTypes: UploadType[];
    success?: string;
};

export default function LessonIndex() {
    const { lessons, uploadTypes, success } = usePage<PageProps>().props;

    // 详情模态框状态
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    // 删除模态框状态
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);

    // 打开详情模态框
    const openDetailModal = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setIsDetailModalOpen(true);
    };

    // 打开删除确认模态框
    const openDeleteModal = (id: number) => {
        setDeletingLessonId(id);
        setIsDeleteModalOpen(true);
    };

    // 确认删除
    const handleDeleteConfirm = () => {
        if (!deletingLessonId) return;
        router.delete(destroy(deletingLessonId).url);
        setIsDeleteModalOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="课时管理" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">课时管理</h1>
                    <Link href={create().url}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            添加课时
                        </Button>
                    </Link>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 p-4 text-green-800">
                        {success}
                    </div>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>课时名称</TableHead>
                                <TableHead>年份</TableHead>
                                <TableHead>作业数量</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>创建时间</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lessons.map((lesson) => (
                                <TableRow key={lesson.id}>
                                    <TableCell>{lesson.id}</TableCell>
                                    <TableCell className="font-medium">
                                        <button
                                            onClick={() => openDetailModal(lesson)}
                                            className="text-primary hover:underline"
                                        >
                                            {lesson.name}
                                        </button>
                                    </TableCell>
                                    <TableCell>{lesson.year}</TableCell>
                                    <TableCell>{lesson.assignments_count}</TableCell>
                                    <TableCell>
                                        {lesson.is_active ? (
                                            <Badge variant="default">已启用</Badge>
                                        ) : (
                                            <Badge variant="secondary">已禁用</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(lesson.created_at).toLocaleDateString('zh-CN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDetailModal(lesson)}
                                                title="查看"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Link href={edit(lesson.id).url}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="编辑"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteModal(lesson.id)}
                                                title="删除"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {lessons.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* 课时详情模态框 */}
                <LessonDetailDialog
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    lesson={selectedLesson}
                    uploadTypes={uploadTypes}
                />

                {/* 删除确认模态框 */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>确认删除</DialogTitle>
                            <DialogDescription>
                                确定要删除这个课时吗？此操作不可撤销。
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                取消
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                删除
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
