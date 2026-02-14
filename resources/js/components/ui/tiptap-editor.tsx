import Image from '@tiptap/extension-image';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Image as ImageIcon, Undo, Redo, Paperclip, FileText } from 'lucide-react';
import { Button } from './button';
import { useRef, useState } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    year?: string;
    lessonId?: string | number;
}

export default function RichTextEditor({ content, onChange, year, lessonId }: RichTextEditorProps) {
    const [isUploading, setIsUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                link: {
                    openOnClick: false,
                    HTMLAttributes: {
                        class: 'text-primary underline hover:text-primary/80',
                    },
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'tiptap-editor-content mx-auto focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto p-4 border rounded-lg',
            },
        },
        immediatelyRender: false,
    });

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log('Image upload triggered, file:', file);
        console.log('Year:', year, 'LessonId:', lessonId);
        
        if (!file || !editor || !year || !lessonId) {
            console.log('Missing required data');
            return;
        }

        // 获取 CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        console.log('CSRF Token:', csrfToken);

        const formData = new FormData();
        formData.append('upload', file);
        formData.append('year', year);
        formData.append('lesson_id', lessonId.toString());

        try {
            console.log('Uploading image...');
            const response = await fetch('/api/upload/ckeditor-image', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: formData,
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Upload success, URL:', data.url);
                editor.chain().focus().setImage({ src: data.url }).run();
            } else {
                console.error('图片上传失败, status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
            }
        } catch (error) {
            console.error('图片上传错误:', error);
        }

        // 重置 input
        event.target.value = '';
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        
        if (!file || !editor || !year || !lessonId) {
            console.log('Missing required data for file upload');
            return;
        }

        setIsUploading(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('year', year);
        formData.append('lesson_id', lessonId.toString());

        try {
            const response = await fetch('/api/upload/attachment', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                // 插入附件链接到编辑器
                const linkHtml = `<a href="${data.url}" target="_blank" download class="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors no-underline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span class="text-sm font-medium">${data.original_name}</span>
                    <span class="text-xs text-muted-foreground">(${data.size})</span>
                </a>`;
                editor.chain().focus().insertContent(linkHtml).run();
            } else {
                console.error('文件上传失败, status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                alert('文件上传失败，请重试');
            }
        } catch (error) {
            console.error('文件上传错误:', error);
            alert('文件上传错误，请重试');
        } finally {
            setIsUploading(false);
        }

        // 重置 input
        event.target.value = '';
    };

    if (!editor) {
        return <div className="min-h-[300px] border rounded-lg p-4">加载编辑器...</div>;
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* 工具栏 */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-muted' : ''}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-muted' : ''}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-muted' : ''}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={!year || !lessonId}
                    title="插入图片"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!year || !lessonId || isUploading}
                    title="上传附件"
                >
                    {isUploading ? (
                        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Paperclip className="h-4 w-4" />
                    )}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                />
            </div>

            {/* 编辑器内容 */}
            <EditorContent editor={editor} />

            {/* 提示信息 */}
            <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center gap-4">
                <span>提示: 支持直接粘贴图片</span>
                <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    附件最大 50MB
                </span>
            </div>
        </div>
    );
}
