import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export default function RichEditor({ value, onChange, className }: Props) {
  // GUNAKAN useMemo AGAR EKSTENSI TETAP UNIK DAN STABIL
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        // StarterKit sudah membawa history, heading, dll.
      }),
      Underline,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-emerald-600 underline cursor-pointer font-medium hover:text-emerald-700",
        },
        validate: (url) => !!url,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none prose-emerald dark:prose-invert",
      },
    },
    // Pastikan editor dihancurkan saat unmount (membantu Strict Mode)
    immediatelyRender: false,
  });

  // Sinkronisasi value dari luar
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Ganti 'false' dengan objek { emitUpdate: false }
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Masukkan URL Gambar:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL Link:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div
      className={`border border-border rounded-xl overflow-hidden bg-card shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 transition-colors ${className || ""}`}
    >
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-1 border-b border-border p-1.5 bg-muted/40 backdrop-blur-sm sticky top-0 z-10 py-3">
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="Teks Biasa"
        >
          <Type size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Rata Kiri"
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Rata Tengah"
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Rata Kanan"
        >
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Rata Kiri Kanan"
        >
          <AlignJustify size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Tebal"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Miring"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Garis Bawah"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Kutipan"
        >
          <Quote size={16} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="Tambah Link"
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Tambah Gambar">
          <ImageIcon size={16} />
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>
      <div className="bg-card">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1.5 self-center" />;
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors duration-200
      hover:bg-muted hover:text-foreground
      ${
        active ? "bg-emerald-500/10 text-emerald-600" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
