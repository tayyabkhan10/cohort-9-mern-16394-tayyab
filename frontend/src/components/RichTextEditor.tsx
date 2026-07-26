// import { useEffect, useRef } from 'react';

// interface RichTextEditorProps {
//   value: string;
//   onChange: (html: string) => void;
//   placeholder?: string;
// }

// const COMMANDS: { label: string; command: string; arg?: string }[] = [
//   { label: 'B', command: 'bold' },
//   { label: 'I', command: 'italic' },
//   { label: 'U', command: 'underline' },
//   { label: '"', command: 'formatBlock', arg: 'blockquote' },
//   { label: '•', command: 'insertUnorderedList' },
//   { label: '1.', command: 'insertOrderedList' }
// ];

// const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const isFirstRender = useRef(true);

//   useEffect(() => {
//     if (editorRef.current && isFirstRender.current) {
//       editorRef.current.innerHTML = value || '';
//       isFirstRender.current = false;
//     }
//   }, [value]);

//   const runCommand = (command: string, arg?: string) => {
//     editorRef.current?.focus();
//     document.execCommand(command, false, arg);
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML);
//     }
//   };

//   const handleInput = () => {
//     if (editorRef.current) {
//       onChange(editorRef.current.innerHTML);
//     }
//   };

//   return (
//     <div>
//       <div className="editor-toolbar" role="toolbar" aria-label="Formatting options">
//         {COMMANDS.map((item) => (
//           <button
//             key={item.label}
//             type="button"
//             onClick={() => runCommand(item.command, item.arg)}
//             aria-label={item.command}
//           >
//             {item.label}
//           </button>
//         ))}
//       </div>
//       <div
//         ref={editorRef}
//         className="rich-editor"
//         contentEditable
//         role="textbox"
//         aria-multiline="true"
//         aria-label={placeholder || 'Note content'}
//         data-placeholder={placeholder}
//         onInput={handleInput}
//         suppressContentEditableWarning
//       />
//     </div>
//   );
// };

// export default RichTextEditor;



import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const COMMANDS: { label: string; command: string; arg?: string }[] = [
  { label: 'B', command: 'bold' },
  { label: 'I', command: 'italic' },
  { label: 'U', command: 'underline' },
  { label: '"', command: 'formatBlock', arg: 'blockquote' },
  { label: '•', command: 'insertUnorderedList' },
  { label: '1.', command: 'insertOrderedList' }
];

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (editorRef.current && isFirstRender.current) {
      editorRef.current.innerHTML = value || '';
      isFirstRender.current = false;
    }
  }, [value]);

  const runCommand = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div>
      <div
        className="flex gap-1 border border-canvas-line border-b-0 rounded-t-card p-2 bg-canvas"
        role="toolbar"
        aria-label="Formatting options"
      >
        {COMMANDS.map((item) => (
          <button
            key={item.label}
            type="button"
            className="w-8 h-8 border border-transparent bg-transparent rounded-card cursor-pointer font-bold text-ink hover:bg-paper hover:border-canvas-line"
            onClick={() => runCommand(item.command, item.arg)}
            aria-label={item.command}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="border border-canvas-line rounded-b-card min-h-[320px] p-5 bg-paper text-[15px] leading-[1.7] focus:outline-none focus:border-accent"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder || 'Note content'}
        data-placeholder={placeholder}
        onInput={handleInput}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;