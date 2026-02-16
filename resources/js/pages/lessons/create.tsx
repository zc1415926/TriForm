import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { LessonForm } from '@/components/lesson-form';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '课时管理',
        href: '/lessons',
    },
    {
        title: '添加课时',
        href: '#',
    },
];

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

type PageProps = {
    uploadTypes: UploadType[];
};

export default function LessonCreate() {
    const { uploadTypes } = usePage<PageProps>().props;
    const [tempLessonId] = useState<string>(`temp_${Date.now()}`);

    const { data, setData, processing, errors, post } = useForm({
        name: '',
        year: new Date().getFullYear().toString(),
        is_active: true,
        content: '',
        assignments: [] as AssignmentData[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('lessons.store'), {
            onSuccess: (page) => {
                const newLessonId = (page.props as any).lesson?.id;
                if (newLessonId && tempLessonId) {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    fetch('/api/upload/move-lesson-images', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken || '',
                        },
                        body: JSON.stringify({
                            year: data.year,
                            temp_lesson_id: tempLessonId,
                            real_lesson_id: newLessonId.toString(),
                        }),
                    });
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="添加课时" />
            <LessonForm
                uploadTypes={uploadTypes}
                lessonId={tempLessonId}
                initialData={data}
                data={data}
                setData={setData}
                onSubmit={submit}
                processing={processing}
                errors={errors}
                submitLabel="创建"
                processingLabel="创建中..."
            />
        </AppLayout>
    );
}