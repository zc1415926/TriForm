import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Image as ImageIcon, Undo, Redo } from 'lucide-react';
import { Button } from './button';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    year?: string;
    lessonId?: number;
}

export default function RichTextEditor({ content, onChange, year, lessonId }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
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
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto p-4 border rounded-lg',
            },
        },
        immediatelyRender: false,
    });

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editor || !year || !lessonId) return;

        const formData = new FormData();
        formData.append('upload', file);
        formData.append('year', year);
        formData.append('lesson_id', lessonId.toString());

        try {
            const response = await fetch('/api/upload/ckeditor-image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                editor.chain().focus().setImage({ src: data.url }).run();
            } else {
                console.error('图片上传失败');
            }
        } catch (error) {
            console.error('图片上传错误:', error);
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
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                    className={editor.isActive('bold') ? 'bg-muted' : ''}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                    className={editor.isActive('italic') ? 'bg-muted' : ''}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
                    className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
                    className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
                    className={editor.isActive('orderedList') ? 'bg-muted' : ''}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
                    disabled={!editor.can().undo()}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
                    disabled={!editor.can().redo()}
                >
                    <Redo className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={!year || !lessonId}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        as="span"
                        disabled={!year || !lessonId}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </label>
            </div>

            {/* 编辑器内容 */}
            <EditorContent editor={editor} />
        </div>
    );
}