import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, BookOpen, CheckCircle, XCircle, FileText } from 'lucide-react';

interface UploadType {
    id: number;
    name: string;
    description: string | null;
}

interface Assignment {
    id: number;
    name: string;
    upload_type_id: number;
    is_required: boolean;
    is_published: boolean;
}

interface Lesson {
    id: number;
    name: string;
    year: string;
    is_active: boolean;
    content: string | null;
    created_at: string;
    assignments: Assignment[];
}

interface LessonDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    lesson: Lesson | null;
    uploadTypes: UploadType[];
}

export function LessonDetailDialog({
    isOpen,
    onClose,
    lesson,
    uploadTypes,
}: LessonDetailDialogProps) {
    if (!lesson) return null;

    const getUploadTypeName = (uploadTypeId: number) => {
        const type = uploadTypes.find((t) => t.id === uploadTypeId);
        return type?.name || '未知类型';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {lesson.name}
                    </DialogTitle>
                    <DialogDescription>课时详细信息</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh]">
                    <div className="space-y-6 py-4">
                        {/* 基本信息 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">年份</p>
                                <p className="flex items-center gap-2 font-medium">
                                    <Calendar className="h-4 w-4" />
                                    {lesson.year}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">状态</p>
                                <div>
                                    {lesson.is_active ? (
                                        <Badge variant="default" className="flex w-fit items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            已启用
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="flex w-fit items-center gap-1">
                                            <XCircle className="h-3 w-3" />
                                            已禁用
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* 课时内容 */}
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                课时内容
                            </h4>
                            {lesson.content ? (
                                <div
                                    className="rounded-lg border p-4 prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                                />
                            ) : (
                                <p className="text-muted-foreground text-sm">暂无内容</p>
                            )}
                        </div>

                        <Separator />

                        {/* 作业列表 */}
                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                作业列表 ({lesson.assignments.length})
                            </h4>
                            {lesson.assignments.length > 0 ? (
                                <div className="space-y-3">
                                    {lesson.assignments.map((assignment, index) => (
                                        <div
                                            key={assignment.id}
                                            className="rounded-lg border p-4 space-y-2"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium">{assignment.name}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {assignment.is_required ? (
                                                        <Badge variant="destructive">必做</Badge>
                                                    ) : (
                                                        <Badge variant="outline">选做</Badge>
                                                    )}
                                                    {assignment.is_published ? (
                                                        <Badge variant="default">已发布</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">未发布</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground pl-8">
                                                类型: {getUploadTypeName(assignment.upload_type_id)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">暂无作业</p>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex justify-end pt-4">
                    <Button onClick={onClose}>关闭</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
