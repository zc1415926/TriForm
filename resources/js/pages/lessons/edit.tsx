import { Head, useForm, usePage } from '@inertiajs/react';
import { LessonForm } from '@/components/lesson-form';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '课时管理',
        href: '/lessons',
    },
    {
        title: '编辑课时',
        href: '#',
    },
];

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

interface AssignmentData {
    name: string;
    upload_type_id: string;
    is_required: boolean;
    is_published: boolean;
}

interface Lesson {
    id: number;
    name: string;
    year: string;
    is_active: boolean;
    content: string | null;
    assignments: Assignment[];
}

type PageProps = {
    lesson: Lesson;
    uploadTypes: UploadType[];
};

export default function LessonEdit() {
    const { lesson, uploadTypes } = usePage<PageProps>().props;

    const { data, setData, processing, errors, put } = useForm({
        name: lesson.name,
        year: lesson.year,
        is_active: lesson.is_active,
        content: lesson.content || '',
        assignments: lesson.assignments.map((assignment) => ({
            name: assignment.name,
            upload_type_id: assignment.upload_type_id.toString(),
            is_required: assignment.is_required,
            is_published: assignment.is_published,
        })) as AssignmentData[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('lessons.update', lesson.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="编辑课时" />
            <LessonForm
                uploadTypes={uploadTypes}
                lessonId={lesson.id}
                initialData={data}
                data={data}
                setData={setData}
                onSubmit={submit}
                processing={processing}
                errors={errors}
                submitLabel="保存修改"
                processingLabel="保存中..."
            />
        </AppLayout>
    );
}
