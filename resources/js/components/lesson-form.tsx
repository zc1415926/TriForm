import { Link } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/ui/tiptap-editor';

interface UploadType {
    id: number;
    name: string;
    description: string | null;
}

interface AssignmentData {
    name: string;
    upload_type_id: string;
    is_required: boolean;
    is_published: boolean;
}

interface LessonFormData {
    name: string;
    year: string;
    is_active: boolean;
    content: string;
    assignments: AssignmentData[];
}

interface LessonFormProps {
    uploadTypes: UploadType[];
    initialData: LessonFormData;
    lessonId?: string | number;
    onSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    errors: Record<string, string>;
    submitLabel: string;
    processingLabel: string;
    data: LessonFormData;
    setData: (key: keyof LessonFormData, value: unknown) => void;
}

export function LessonForm({
    uploadTypes,
    lessonId,
    onSubmit,
    processing,
    errors,
    submitLabel,
    processingLabel,
    data,
    setData,
}: LessonFormProps) {
    const addAssignment = () => {
        setData('assignments', [
            ...data.assignments,
            {
                name: '',
                upload_type_id: '',
                is_required: true,
                is_published: true,
            },
        ]);
    };

    const removeAssignment = (index: number) => {
        setData(
            'assignments',
            data.assignments.filter((_assignment: AssignmentData, i: number) => i !== index)
        );
    };

    const updateAssignment = (
        index: number,
        field: keyof AssignmentData,
        value: string | boolean
    ) => {
        const updatedAssignments = [...data.assignments];
        updatedAssignments[index] = {
            ...updatedAssignments[index],
            [field]: value,
        };
        setData('assignments', updatedAssignments);
    };

    return (
        <div className="mx-auto max-w-7xl pb-6 px-4 w-full">
            <div className="space-y-8">
                <form onSubmit={onSubmit} className="space-y-8 pt-6 w-full">
                    {/* 基本信息区块 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="name" className="text-base font-medium">课时名称</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="请输入课时名称"
                                className="h-11"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year" className="text-base font-medium">年份</Label>
                            <Input
                                id="year"
                                type="number"
                                min="2020"
                                max="2030"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                placeholder="请输入年份"
                                className="h-11"
                            />
                            <InputError message={errors.year} />
                        </div>
                    </div>

                    {/* 课时内容区块 */}
                    <div className="space-y-3">
                        <Label htmlFor="content" className="text-base font-medium">课时内容</Label>
                        <div className="min-h-[400px]">
                            <RichTextEditor
                                content={data.content}
                                onChange={(content) => setData('content', content)}
                                year={data.year}
                                lessonId={lessonId}
                            />
                        </div>
                        <InputError message={errors.content} />
                    </div>

                    {/* 状态设置区块 */}
                    <div className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_active" className="text-base font-medium">启用状态</Label>
                            <p className="text-sm text-muted-foreground">关闭后学生将无法看到此课时</p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked)}
                        />
                    </div>

                    {/* 作业列表区块 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="text-lg font-semibold">作业列表</h3>
                                <p className="text-sm text-muted-foreground">为此课时配置相关作业</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addAssignment}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                添加作业
                            </Button>
                        </div>

                        {data.assignments.length > 0 && (
                            <div className="grid gap-4">
                                {data.assignments.map((assignment: AssignmentData, index: number) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">作业名称</Label>
                                                        <Input
                                                            value={assignment.name}
                                                            onChange={(e) =>
                                                                updateAssignment(index, 'name', e.target.value)
                                                            }
                                                            placeholder="请输入作业名称"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm">作业类型</Label>
                                                        <Select
                                                            value={assignment.upload_type_id}
                                                            onValueChange={(value) =>
                                                                updateAssignment(index, 'upload_type_id', value)
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="选择作业类型" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {uploadTypes.map((uploadType) => (
                                                                    <SelectItem
                                                                        key={uploadType.id}
                                                                        value={uploadType.id.toString()}
                                                                    >
                                                                        {uploadType.name}
                                                                        {uploadType.description && ` - ${uploadType.description}`}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-6">
                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={assignment.is_required}
                                                            onCheckedChange={(checked) =>
                                                                updateAssignment(index, 'is_required', checked)
                                                            }
                                                            id={`required-${index}`}
                                                        />
                                                        <div className="space-y-0.5">
                                                            <Label htmlFor={`required-${index}`} className="cursor-pointer text-sm font-medium">必做作业</Label>
                                                            <p className="text-xs text-muted-foreground">标记为必须完成的作业</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Switch
                                                            checked={assignment.is_published}
                                                            onCheckedChange={(checked) =>
                                                                updateAssignment(index, 'is_published', checked)
                                                            }
                                                            id={`published-${index}`}
                                                        />
                                                        <div className="space-y-0.5">
                                                            <Label htmlFor={`published-${index}`} className="cursor-pointer text-sm font-medium">立即发布</Label>
                                                            <p className="text-xs text-muted-foreground">发布后学生可见</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeAssignment(index)}
                                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {data.assignments.length === 0 && (
                            <div className="rounded-xl border border-dashed bg-muted/50 p-12 text-center w-full">
                                <p className="text-muted-foreground">暂无作业，点击上方按钮添加</p>
                            </div>
                        )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                        <Link href="/lessons">
                            <Button variant="outline" type="button" size="lg">
                                取消
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} size="lg">
                            {processing ? processingLabel : submitLabel}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
