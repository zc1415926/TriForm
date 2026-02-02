import { Form, Head, Link, useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index, update } from '@/routes/students';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '学生管理',
        href: index().url,
    },
    {
        title: '编辑学生',
        href: '#',
    },
];

interface Student {
    id: number;
    name: string;
    grade: number;
    class: number;
    year: number;
}

type PageProps = {
    student: Student;
};

export default function StudentEdit() {
    const { student } = usePage<PageProps>().props;
    const { data, setData, processing, errors } = useForm({
        name: student.name,
        grade: student.grade.toString(),
        class: student.class.toString(),
        year: student.year.toString(),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        update.form(student.id);
    };

    const grades = [
        { value: 1, label: '一年级' },
        { value: 2, label: '二年级' },
        { value: 3, label: '三年级' },
        { value: 4, label: '四年级' },
        { value: 5, label: '五年级' },
        { value: 6, label: '六年级' },
    ];

    const years = [2023, 2024, 2025, 2026];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="编辑学生" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Link href={index().url}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            返回
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>编辑学生</CardTitle>
                        <CardDescription>
                            修改学生信息
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">姓名</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="请输入学生姓名"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade">年级</Label>
                                <Select
                                    value={data.grade}
                                    onValueChange={(value) =>
                                        setData('grade', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择年级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {grades.map((grade) => (
                                            <SelectItem
                                                key={grade.value}
                                                value={grade.value.toString()}
                                            >
                                                {grade.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.grade} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="class">班级</Label>
                                <Input
                                    id="class"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={data.class}
                                    onChange={(e) =>
                                        setData('class', e.target.value)
                                    }
                                    placeholder="请输入班级号"
                                />
                                <InputError message={errors.class} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">年份</Label>
                                <Select
                                    value={data.year}
                                    onValueChange={(value) =>
                                        setData('year', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择年份" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem
                                                key={year}
                                                value={year.toString()}
                                            >
                                                {year}年
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.year} />
                            </div>

                            <div className="flex justify-end gap-4">
                                <Link href={index().url}>
                                    <Button variant="outline" type="button">
                                        取消
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? '保存中...' : '保存'}
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}