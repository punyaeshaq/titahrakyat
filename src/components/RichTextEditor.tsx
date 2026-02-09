import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3,
  Link as LinkIcon, Image as ImageIcon, Undo, Redo, Minus, Upload, Loader2,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addImageByUrl = () => {
    const url = prompt("URL gambar:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("article-images").upload(fileName, file);
    if (error) {
      alert("Upload gagal: " + error.message);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const { data: publicUrl } = supabase.storage.from("article-images").getPublicUrl(fileName);
    editor.chain().focus().setImage({ src: publicUrl.publicUrl }).run();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addLink = () => {
    const url = prompt("URL link:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-input rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-0.5 p-1.5 bg-secondary border-b border-input">
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleBold().run()} data-active={editor.isActive("bold")}>
          <Bold size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={addLink}>
          <LinkIcon size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={addImageByUrl} title="Sisipkan gambar via URL">
          <ImageIcon size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Upload gambar dari perangkat">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={14} />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={14} />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 min-h-[250px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[250px] [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-md"
      />
    </div>
  );
};

export default RichTextEditor;
