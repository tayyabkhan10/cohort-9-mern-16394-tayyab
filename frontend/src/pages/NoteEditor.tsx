// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import Spine from '../components/Spine';
// import RichTextEditor from '../components/RichTextEditor';
// import * as notesApi from '../api/notes';

// const NoteEditor = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isNew = !id || id === 'new';

//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [isLoading, setIsLoading] = useState(!isNew);
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (isNew || !id) return;
//     notesApi
//       .getNote(id)
//       .then((note) => {
//         setTitle(note.title);
//         setContent(note.content || '');
//       })
//       .catch(() => setError('Could not load this note.'))
//       .finally(() => setIsLoading(false));
//   }, [id, isNew]);

//   const handleSave = async () => {
//     if (!title.trim()) {
//       setError('Give your note a title before saving.');
//       return;
//     }
//     setIsSaving(true);
//     setError('');
//     try {
//       if (isNew) {
//         await notesApi.createNote(title, content);
//       } else if (id) {
//         await notesApi.updateNote(id, title, content);
//       }
//       navigate('/dashboard');
//     } catch (err) {
//       setError('Could not save this note. Try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="app-shell">
//         <Spine />
//         <main className="main-area">
//           <p>Loading note…</p>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="app-shell">
//       <Spine />
//       <main className="main-area">
//         <div className="page-header">
//           <div>
//             <div className="eyebrow">{isNew ? 'New entry' : 'Editing'}</div>
//             <h1>{isNew ? 'Untitled note' : title || 'Untitled note'}</h1>
//           </div>
//         </div>

//         {error && <div className="auth-error">{error}</div>}

//         <div className="editor-shell">
//           <div className="field">
//             <label htmlFor="title">Title</label>
//             <input
//               id="title"
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="What is this note about?"
//             />
//           </div>
//           <div className="field">
//             <label>Content</label>
//             <RichTextEditor value={content} onChange={setContent} placeholder="Start writing…" />
//           </div>
//           <div className="editor-actions">
//             <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
//               {isSaving ? 'Saving…' : 'Save note'}
//             </button>
//             <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
//               Cancel
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default NoteEditor;


import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spine from '../components/Spine';
import RichTextEditor from '../components/RichTextEditor';
import * as notesApi from '../api/notes';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew || !id) return;
    notesApi
      .getNote(id)
      .then((note) => {
        setTitle(note.title);
        setContent(note.content || '');
      })
      .catch(() => setError('Could not load this note.'))
      .finally(() => setIsLoading(false));
  }, [id, isNew]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Give your note a title before saving.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      if (isNew) {
        await notesApi.createNote(title, content);
      } else if (id) {
        await notesApi.updateNote(id, title, content);
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Could not save this note. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex stack:flex-col min-h-screen">
        <Spine />
        <main className="flex-1 min-w-0 px-12 stack:px-5 pt-10 stack:pt-6 pb-16 stack:pb-12">
          <p className="text-body-muted">Loading note…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex stack:flex-col min-h-screen">
      <Spine />
      <main className="flex-1 min-w-0 px-12 stack:px-5 pt-10 stack:pt-6 pb-16 stack:pb-12">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-7">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-body-muted mb-1.5">
              {isNew ? 'New entry' : 'Editing'}
            </div>
            <h1 className="text-[32px]">{isNew ? 'Untitled note' : title || 'Untitled note'}</h1>
          </div>
        </div>

        {error && (
          <div className="bg-danger-soft text-danger text-[13px] px-3 py-2.5 rounded-card mb-4">{error}</div>
        )}

        <div className="max-w-[760px]">
          <div className="flex flex-col gap-1.5 mb-[18px]">
            <label htmlFor="title" className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-muted">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="border border-canvas-line bg-paper rounded-card px-[13px] py-[11px] text-[15px] text-body focus:outline-none focus:border-accent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is this note about?"
            />
          </div>
          <div className="flex flex-col gap-1.5 mb-[18px]">
            <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-muted">Content</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Start writing…" />
          </div>
          <div className="flex gap-2.5 mt-[22px]">
            <button
              type="button"
              className="font-body font-semibold text-sm rounded-card border border-transparent bg-ink text-paper px-[18px] py-2.5 inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:enabled:bg-ink-soft disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save note'}
            </button>
            <button
              type="button"
              className="font-body font-semibold text-sm rounded-card border border-canvas-line bg-transparent text-ink px-[18px] py-2.5 inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:border-ink"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteEditor;