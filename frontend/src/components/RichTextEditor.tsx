

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import ResizeImage from 'tiptap-extension-resize-image';
import {
  Undo2, Redo2, Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Pilcrow, Heading1, Heading2, Heading3, List, ListOrdered, ListChecks,
  Palette, Highlighter, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Unlink, ImagePlus, Quote, Code2, Minus, Maximize2,
  Minimize2, Printer, X, Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  Eraser, Save, Loader2
} from 'lucide-react';
import { uploadImage } from '../api/upload';

/* ---------- Custom font-size extension (TipTap has no built-in one) ---------- */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).run()
    };
  }
});


const FONT_SIZE_PRESETS = [10, 13, 15, 18, 22, 28, 36];
const MIN_FONT_SIZE = 0.1;
const MAX_FONT_SIZE = 1000;


declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineHeading: {
      setHeadingStyle: (level: 1 | 2 | 3) => ReturnType;
      unsetHeadingStyle: () => ReturnType;
    };
  }
}

const HEADING_PRESETS: Record<1 | 2 | 3, { fontSize: string; weight: string }> = {
  1: { fontSize: '1.6em', weight: '700' },
  2: { fontSize: '1.35em', weight: '600' },
  3: { fontSize: '1.15em', weight: '600' }
};

const InlineHeading = Extension.create({
  name: 'inlineHeading',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          headingWeight: {
            default: null,
            parseHTML: (element) => element.style.fontWeight || null,
            renderHTML: (attributes) => {
              if (!attributes.headingWeight) return {};
              return { style: `font-weight: ${attributes.headingWeight}` };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setHeadingStyle:
        (level: 1 | 2 | 3) =>
        ({ chain }) => {
          const preset = HEADING_PRESETS[level];
          return chain().setMark('textStyle', { fontSize: preset.fontSize, headingWeight: preset.weight }).run();
        },
      unsetHeadingStyle:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null, headingWeight: null }).run()
    };
  }
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onAutoSave?: (html: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  documentTitle?: string;
}

const TEXT_COLORS = ['#1a1a1a', '#b91c1c', '#b45309', '#15803d', '#1d4ed8', '#7e22ce', '#be185d', '#0891b2'];
const HIGHLIGHT_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff', '#a5f3fc', '#fecaca'];

const ToolButton = ({
  icon: Icon,
  label,
  onClick,
  active,
  disabled
}: {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) => (
  <div className="relative group">
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={!!active}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? 'bg-accent text-paper border-accent shadow-sm'
          : 'text-ink border-transparent hover:bg-canvas-line/60'
      }`}
    >
      <Icon size={16} strokeWidth={2.25} />
    </button>
    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap rounded-md bg-ink text-paper text-[11px] px-2 py-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-100 z-20">
      {label}
    </span>
  </div>
);

const GroupDivider = () => <div className="w-px h-6 bg-canvas-line mx-1.5 self-center shrink-0" />;

const normalizeHex = (input: string): string | null => {
  let v = input.trim();
  if (!v) return null;
  if (!v.startsWith('#')) v = `#${v}`;
  if (/^#([0-9a-fA-F]{3})$/.test(v)) {
    const m = v.slice(1);
    return `#${m[0]}${m[0]}${m[1]}${m[1]}${m[2]}${m[2]}`.toLowerCase();
  }
  if (/^#([0-9a-fA-F]{6})$/.test(v)) return v.toLowerCase();
  return null;
};

const SwatchPopover = ({
  colors,
  onPick,
  onClear,
  onClose
}: {
  colors: string[];
  onPick: (c: string) => void;
  onClear: () => void;
  onClose: () => void;
}) => {
  const [hexInput, setHexInput] = useState('');

  const applyHex = () => {
    const normalized = normalizeHex(hexInput);
    if (normalized) {
      onPick(normalized);
      onClose();
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 flex flex-col gap-2 bg-paper border border-canvas-line shadow-lift rounded-xl p-2 z-30 w-[172px]">
      <div className="flex items-center gap-1.5 flex-wrap">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            className="w-5 h-5 rounded-full border border-canvas-line hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
            onClick={() => {
              onPick(c);
              onClose();
            }}
            aria-label={`Pick ${c}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-t border-canvas-line pt-2">
        <input
          type="color"
          aria-label="Pick any color"
          className="w-7 h-7 rounded-md border border-canvas-line cursor-pointer bg-transparent p-0"
          onChange={(e) => {
            onPick(e.target.value);
            onClose();
          }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyHex()}
          placeholder="#rrggbb"
          className="min-w-0 flex-1 border border-canvas-line bg-canvas rounded-md px-1.5 py-1 text-[11px] font-mono text-ink focus:outline-none focus:border-accent"
        />
      </div>

      <button type="button" className="text-[11px] text-body-muted hover:text-ink px-1 text-left" onClick={() => { onClear(); onClose(); }}>
        Clear color
      </button>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder, onAutoSave, onSave, isSaving, documentTitle }: RichTextEditorProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [fontSizeInput, setFontSizeInput] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [savedPulse, setSavedPulse] = useState(false);
  const [, forceTick] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      InlineHeading,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
      Link.configure({ openOnClick: false, autolink: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Superscript,
      Subscript,
      ResizeImage,
      Placeholder.configure({ placeholder: placeholder || 'Start writing…' }),
      CharacterCount
    ],
    content: value || '',
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(html);
      if (onAutoSave) {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
          onAutoSave(html);
          setSavedPulse(true);
          setTimeout(() => setSavedPulse(false), 1500);
        }, 1200);
      }
    }
  });

  
  useEffect(() => {
    if (!editor) return;
    const rerender = () => forceTick((n) => n + 1);
    editor.on('selectionUpdate', rerender);
    editor.on('transaction', rerender);
    return () => {
      editor.off('selectionUpdate', rerender);
      editor.off('transaction', rerender);
    };
  }, [editor]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      if (errorTimer.current) clearTimeout(errorTimer.current);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editor && onAutoSave) onAutoSave(editor.getHTML());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editor, onAutoSave]);

  useEffect(() => {
    if (!onSave) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  const showError = (msg: string) => {
    setErrorBanner(msg);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setErrorBanner(''), 4000);
  };

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    setLinkUrl((editor.getAttributes('link').href as string) || '');
    setShowLinkDialog(true);
  }, [editor]);

  const applyLink = () => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
    }
    setShowLinkDialog(false);
  };

  const handleImageButtonClick = () => fileInputRef.current?.click();

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;
    if (!file.type.startsWith('image/')) {
      showError('Please choose an image file.');
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message;
      showError(serverMessage || 'Image upload failed. Check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const applyFontSizeInput = () => {
    if (!editor) return;
    const num = parseFloat(fontSizeInput);
    if (Number.isNaN(num)) return;
    const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, num));
    editor.chain().focus().setFontSize(`${clamped}px`).run();
  };

  const handlePrint = () => {
    if (!editor) return;
    const win = window.open('', '_blank', 'width=850,height=900');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle || 'Note'}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 720px; margin: 40px auto; line-height: 1.6; padding: 0 24px; }
            h1, h2, h3 { font-family: -apple-system, Segoe UI, sans-serif; }
            img { max-width: 100%; border-radius: 8px; }
            blockquote { border-left: 3px solid #ccc; margin: 0; padding-left: 16px; color: #555; }
            pre { background: #f4f4f4; padding: 12px; border-radius: 8px; overflow-x: auto; }
            ul, ol { padding-left: 1.4em; }
            .doc-title { font-size: 26px; margin-bottom: 4px; }
            ul[data-type="taskList"] { list-style: none; padding-left: 0; }
            ul[data-type="taskList"] li { display: flex; gap: 8px; align-items: flex-start; }
          </style>
        </head>
        <body>
          <div class="doc-title">${documentTitle || 'Untitled note'}</div>
          ${editor.getHTML()}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words?.() ?? 0;
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div className={isFullScreen ? 'fixed inset-0 z-50 bg-paper flex flex-col p-6' : ''}>
      {errorBanner && (
        <div className="flex items-center justify-between bg-danger-soft text-danger text-[13px] px-3 py-2 rounded-lg mb-2">
          <span>{errorBanner}</span>
          <button type="button" onClick={() => setErrorBanner('')} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      <div
        className="flex flex-wrap items-center gap-0.5 border border-canvas-line border-b-0 rounded-t-2xl px-2.5 py-2 bg-canvas shadow-sm"
        role="toolbar"
        aria-label="Formatting options"
      >
        <ToolButton icon={Undo2} label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
        <ToolButton icon={Redo2} label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
        <GroupDivider />

        {/* Font size: presets + a free numeric (float) input, e.g. 9.7px, 0.1–1000px */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontSize((s) => !s)}
            className="h-8 px-2 flex items-center gap-1 rounded-lg text-[12px] font-semibold text-ink hover:bg-canvas-line/60 border border-transparent"
          >
            Aa
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-2 bg-paper border border-canvas-line shadow-lift rounded-xl p-2 z-30 w-40">
              <div className="flex flex-wrap gap-1 mb-2">
                {FONT_SIZE_PRESETS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className="px-2 py-1 rounded-md text-[11px] text-ink border border-canvas-line hover:bg-canvas"
                    onClick={() => {
                      editor.chain().focus().setFontSize(`${size}px`).run();
                      setShowFontSize(false);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 border-t border-canvas-line pt-2">
                <input
                  type="number"
                  min={MIN_FONT_SIZE}
                  max={MAX_FONT_SIZE}
                  step={0.1}
                  value={fontSizeInput}
                  onChange={(e) => setFontSizeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFontSizeInput()}
                  placeholder="9.7"
                  className="min-w-0 flex-1 border border-canvas-line bg-canvas rounded-md px-1.5 py-1 text-[12px] text-ink focus:outline-none focus:border-accent"
                />
                <span className="text-[11px] text-body-muted">px</span>
                <button
                  type="button"
                  onClick={() => {
                    applyFontSizeInput();
                    setShowFontSize(false);
                  }}
                  className="text-[11px] font-semibold text-paper bg-ink rounded-md px-2 py-1 hover:bg-ink-soft"
                >
                  Set
                </button>
              </div>
              <button
                type="button"
                className="block w-full text-left px-1 py-1.5 mt-1 rounded-lg text-[11px] text-body-muted hover:bg-canvas"
                onClick={() => {
                  editor.chain().focus().unsetFontSize().run();
                  setShowFontSize(false);
                }}
              >
                Reset size
              </button>
            </div>
          )}
        </div>
        <GroupDivider />

        <ToolButton icon={Bold} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
        <ToolButton icon={Italic} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
        <ToolButton icon={UnderlineIcon} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} />
        <ToolButton icon={Strikethrough} label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} />
        <ToolButton icon={SuperscriptIcon} label="Superscript" onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} />
        <ToolButton icon={SubscriptIcon} label="Subscript" onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} />
        <ToolButton icon={Eraser} label="Clear Formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
        <GroupDivider />

        <ToolButton
          icon={Pilcrow}
          label="Paragraph / Clear Heading"
          onClick={() => editor.chain().focus().setParagraph().unsetHeadingStyle().run()}
          active={editor.isActive('paragraph') && !editor.isActive('textStyle', { fontSize: HEADING_PRESETS[1].fontSize }) && !editor.isActive('textStyle', { fontSize: HEADING_PRESETS[2].fontSize }) && !editor.isActive('textStyle', { fontSize: HEADING_PRESETS[3].fontSize })}
        />
        
        <ToolButton
          icon={Heading1}
          label="Heading 1 (selection)"
          onClick={() => {
            const isActive = editor.isActive('textStyle', { fontSize: HEADING_PRESETS[1].fontSize });
            if (isActive) editor.chain().focus().unsetHeadingStyle().run();
            else editor.chain().focus().setHeadingStyle(1).run();
          }}
          active={editor.isActive('textStyle', { fontSize: HEADING_PRESETS[1].fontSize })}
        />
        <ToolButton
          icon={Heading2}
          label="Heading 2 (selection)"
          onClick={() => {
            const isActive = editor.isActive('textStyle', { fontSize: HEADING_PRESETS[2].fontSize });
            if (isActive) editor.chain().focus().unsetHeadingStyle().run();
            else editor.chain().focus().setHeadingStyle(2).run();
          }}
          active={editor.isActive('textStyle', { fontSize: HEADING_PRESETS[2].fontSize })}
        />
        <ToolButton
          icon={Heading3}
          label="Heading 3 (selection)"
          onClick={() => {
            const isActive = editor.isActive('textStyle', { fontSize: HEADING_PRESETS[3].fontSize });
            if (isActive) editor.chain().focus().unsetHeadingStyle().run();
            else editor.chain().focus().setHeadingStyle(3).run();
          }}
          active={editor.isActive('textStyle', { fontSize: HEADING_PRESETS[3].fontSize })}
        />
        <GroupDivider />

        <ToolButton icon={List} label="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
        <ToolButton icon={ListOrdered} label="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />
        <ToolButton icon={ListChecks} label="Checklist" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} />
        <GroupDivider />

        <div className="relative">
          <ToolButton icon={Palette} label="Text Color" onClick={() => { setShowTextColor((s) => !s); setShowHighlight(false); }} active={showTextColor} />
          {showTextColor && (
            <SwatchPopover
              colors={TEXT_COLORS}
              onPick={(c) => editor.chain().focus().setColor(c).run()}
              onClear={() => editor.chain().focus().unsetColor().run()}
              onClose={() => setShowTextColor(false)}
            />
          )}
        </div>
        <div className="relative">
          <ToolButton icon={Highlighter} label="Background Color" onClick={() => { setShowHighlight((s) => !s); setShowTextColor(false); }} active={showHighlight} />
          {showHighlight && (
            <SwatchPopover
              colors={HIGHLIGHT_COLORS}
              onPick={(c) => editor.chain().focus().toggleHighlight({ color: c }).run()}
              onClear={() => editor.chain().focus().unsetHighlight().run()}
              onClose={() => setShowHighlight(false)}
            />
          )}
        </div>
        <GroupDivider />

        <ToolButton icon={AlignLeft} label="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} />
        <ToolButton icon={AlignCenter} label="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} />
        <ToolButton icon={AlignRight} label="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} />
        <ToolButton icon={AlignJustify} label="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} />
        <GroupDivider />

        <ToolButton icon={LinkIcon} label="Insert Link" onClick={openLinkDialog} active={editor.isActive('link')} />
        <ToolButton icon={Unlink} label="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} />
        <GroupDivider />

        <ToolButton icon={ImagePlus} label={isUploading ? 'Uploading…' : 'Insert Image'} onClick={handleImageButtonClick} disabled={isUploading} />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
        <GroupDivider />

        <ToolButton icon={Quote} label="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
        <ToolButton icon={Code2} label="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} />
        <ToolButton icon={Minus} label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <GroupDivider />

        <ToolButton icon={Printer} label="Print / Save as PDF" onClick={handlePrint} />
        <ToolButton icon={isFullScreen ? Minimize2 : Maximize2} label={isFullScreen ? 'Exit Full Screen' : 'Full Screen'} onClick={() => setIsFullScreen((s) => !s)} />

        {onSave && (
          <>
            <GroupDivider />
            <ToolButton
              icon={isSaving ? Loader2 : Save}
              label={isSaving ? 'Saving…' : 'Save (Ctrl+S)'}
              onClick={onSave}
              disabled={isSaving}
            />
          </>
        )}

        {onAutoSave && (
          <span className={`ml-auto text-[11px] font-mono px-2 transition-opacity duration-300 ${savedPulse ? 'text-accent opacity-100' : 'opacity-0'}`}>
            Saved
          </span>
        )}
      </div>

      <EditorContent
        editor={editor}
        className={`rte-content border border-canvas-line rounded-b-2xl p-6 bg-paper text-[15px] shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30 overflow-y-auto transition-colors ${isFullScreen ? 'flex-1' : 'min-h-[340px]'}`}
      />

      <div className="flex justify-end gap-3 mt-2 font-mono text-[11px] text-body-muted">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>

      {showLinkDialog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 backdrop-blur-[2px]" onClick={() => setShowLinkDialog(false)}>
          <div className="bg-paper rounded-2xl shadow-lift border border-canvas-line p-5 w-[360px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-ink">Insert link</h3>
              <button type="button" onClick={() => setShowLinkDialog(false)} aria-label="Close" className="text-body-muted hover:text-ink">
                <X size={16} />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyLink()}
              placeholder="https://example.com"
              className="w-full border border-canvas-line bg-canvas rounded-lg px-3 py-2 text-[14px] text-ink focus:outline-none focus:border-accent"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setShowLinkDialog(false)} className="text-sm font-medium px-3 py-1.5 rounded-lg text-body-muted hover:bg-canvas">
                Cancel
              </button>
              <button type="button" onClick={applyLink} className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-ink text-paper hover:bg-ink-soft">
                {linkUrl.trim() ? 'Apply' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

     
      <style>{`
        .rte-content .ProseMirror { outline: none; line-height: 1.55; }
        .rte-content .ProseMirror p { margin: 0 0 0.55em; }
        .rte-content .ProseMirror p:last-child { margin-bottom: 0; }
        .rte-content .ProseMirror h1 { font-size: 1.6em; margin: 0.6em 0 0.35em; }
        .rte-content .ProseMirror h2 { font-size: 1.35em; margin: 0.55em 0 0.3em; }
        .rte-content .ProseMirror h3 { font-size: 1.15em; margin: 0.5em 0 0.25em; }
        .rte-content .ProseMirror ul { list-style: disc; padding-left: 1.4em; margin: 0.4em 0; }
        .rte-content .ProseMirror ol { list-style: decimal; padding-left: 1.4em; margin: 0.4em 0; }
        .rte-content .ProseMirror li { margin: 0.15em 0; }
        .rte-content .ProseMirror li p { margin: 0; }
        .rte-content .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .rte-content .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5em; }
        .rte-content .ProseMirror ul[data-type="taskList"] li > label { margin-top: 0.2em; }
        .rte-content .ProseMirror blockquote { border-left: 3px solid var(--canvas-line, #E2DACB); margin: 0.5em 0; padding-left: 1em; color: var(--text-muted, #6B6559); }
        .rte-content .ProseMirror pre { background: var(--canvas, #F1EDE2); padding: 0.75em 1em; border-radius: 10px; overflow-x: auto; margin: 0.5em 0; }
        .rte-content .ProseMirror pre code { font-family: var(--font-mono, monospace); font-size: 0.9em; }
        .rte-content .ProseMirror hr { border: none; border-top: 1px solid var(--canvas-line, #E2DACB); margin: 1em 0; }
        .rte-content .ProseMirror img { border-radius: 10px; max-width: 100%; }
        .rte-content .ProseMirror img.ProseMirror-selectednode { outline: 2px solid var(--accent, #1F6F6B); outline-offset: 2px; }
        .rte-content .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-muted, #6B6559);
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;