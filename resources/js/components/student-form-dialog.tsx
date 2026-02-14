import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, Upload, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Student {
    id?: number;
    name: string;
    grade: number;
    class: number;
    year: number;
    avatar?: string | null;
}

interface StudentFormData {
    name: string;
    grade: string;
    class: string;
    year: string;
    avatar: File | null;
    remove_avatar: boolean;
}

interface StudentFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    student?: Student | null;
    onSubmit: (data: StudentFormData, studentId?: number) => void;
    processing?: boolean;
    errors?: Record<string, string>;
    mode: 'create' | 'edit';
}

const grades = [
    { value: 1, label: '一年级' },
    { value: 2, label: '二年级' },
    { value: 3, label: '三年级' },
    { value: 4, label: '四年级' },
    { value: 5, label: '五年级' },
    { value: 6, label: '六年级' },
];

// 头像文件大小限制 2MB
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export function StudentFormDialog({
    isOpen,
    onClose,
    student,
    onSubmit,
    processing = false,
    errors = {},
    mode,
}: StudentFormDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const { data, setData, reset, clearErrors } = useForm<StudentFormData>({
        name: '',
        grade: '',
        class: '',
        year: new Date().getFullYear().toString(),
        avatar: null,
        remove_avatar: false,
    });

    // 当 student 或 isOpen 变化时重置表单
    useEffect(() => {
        if (isOpen) {
            if (student && mode === 'edit') {
                setData({
                    name: student.name,
                    grade: student.grade.toString(),
                    class: student.class.toString(),
                    year: student.year.toString(),
                    avatar: null,
                    remove_avatar: false,
                });
                setAvatarPreview(student.avatar ? `/storage/${student.avatar}` : null);
            } else {
                reset();
                setAvatarPreview(null);
            }
            setAvatarError(null);
            clearErrors();
        }
    }, [isOpen, student, mode]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setAvatarError(null);

        if (!file) return;

        // 验证文件类型
        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
            setAvatarError('只支持 JPG、PNG、GIF、WEBP 格式的图片');
            return;
        }

        // 验证文件大小
        if (file.size > MAX_AVATAR_SIZE) {
            setAvatarError('头像文件大小不能超过 2MB');
            return;
        }

        setData('avatar', file);
        setData('remove_avatar', false);

        // 创建预览
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setData('avatar', null);
        setData('remove_avatar', true);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data, student?.id);
    };

    const title = mode === 'create' ? '添加学生' : '编辑学生';
    const description = mode === 'create'
        ? '填写学生信息以创建新的学生记录'
        : '修改学生信息';
    const submitLabel = mode === 'create'
        ? (processing ? '创建中...' : '创建')
        : (processing ? '保存中...' : '保存');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 头像上传区域 */}
                    <div className="space-y-3">
                        <Label>头像</Label>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-20 w-20 border-2 border-muted">
                                    <AvatarImage src={avatarPreview || undefined} alt={data.name || '学生'} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                                        {data.name ? data.name.charAt(0) : <User className="size-8" />}
                                    </AvatarFallback>
                                </Avatar>
                                {/* 上传按钮 */}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="size-4" />
                                </Button>
                            </div>
                            <div className="flex-1 space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mr-2 size-4" />
                                        上传头像
                                    </Button>
                                    {avatarPreview && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRemoveAvatar}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="mr-2 size-4" />
                                            清除
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    支持 JPG、PNG、GIF、WEBP 格式，最大 2MB
                                </p>
                                {avatarError && (
                                    <p className="text-sm text-red-600">{avatarError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 表单字段 */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">姓名</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="请输入学生姓名"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grade">年级</Label>
                            <Select
                                value={data.grade}
                                onValueChange={(value) => setData('grade', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="选择年级" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grades.map((grade) => (
                                        <SelectItem key={grade.value} value={grade.value.toString()}>
                                            {grade.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.grade && (
                                <p className="text-sm text-red-600">{errors.grade}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="class">班级</Label>
                            <Input
                                id="class"
                                type="number"
                                min="1"
                                max="20"
                                value={data.class}
                                onChange={(e) => setData('class', e.target.value)}
                                placeholder="请输入班级号"
                            />
                            {errors.class && (
                                <p className="text-sm text-red-600">{errors.class}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">年份</Label>
                            <Input
                                id="year"
                                type="number"
                                min="2020"
                                max="2030"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                placeholder="请输入年份"
                            />
                            {errors.year && (
                                <p className="text-sm text-red-600">{errors.year}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            取消
                        </Button>
                        <Button type="submit" disabled={processing || !!avatarError}>
                            {submitLabel}
        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
