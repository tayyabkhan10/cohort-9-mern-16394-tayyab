// import { useCallback, useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Spine from '../components/Spine';
// import NoteCard from '../components/NoteCard';
// import { useAuth } from '../context/AuthContext';
// import { useNotesSocket } from '../hooks/useNotesSocket';
// import * as notesApi from '../api/notes';
// import type { Note } from '../types';

// const PAGE_SIZE = 9;

// const Dashboard = () => {
//   const { token } = useAuth();
//   const navigate = useNavigate();
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [search, setSearch] = useState('');
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const importInputRef = useRef<HTMLInputElement>(null);

//   const fetchNotes = useCallback(async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const result = await notesApi.listNotes({ search: search || undefined, page, limit: PAGE_SIZE });
//       setNotes(result.notes);
//       setTotalPages(result.totalPages || 1);
//     } catch (err) {
//       setError('Could not load your notes right now.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [search, page]);

//   useEffect(() => {
//     fetchNotes();
//   }, [fetchNotes]);

//   const { isConnected } = useNotesSocket({
//     token,
//     onCreated: () => fetchNotes(),
//     onUpdated: (updated) => {
//       setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
//     },
//     onDeleted: (id) => {
//       setNotes((prev) => prev.filter((n) => n.id !== id));
//     }
//   });

//   const handleDelete = async (id: string) => {
//     const confirmed = window.confirm('Delete this note? This cannot be undone.');
//     if (!confirmed) return;
//     try {
//       await notesApi.deleteNote(id);
//       setNotes((prev) => prev.filter((n) => n.id !== id));
//     } catch (err) {
//       setError('Could not delete this note.');
//     }
//   };

//   const handleExport = async () => {
//     try {
//       const all = await notesApi.listNotes({ limit: 1000 });
//       const blob = new Blob([JSON.stringify(all.notes, null, 2)], { type: 'application/json' });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `notes-export-${Date.now()}.json`;
//       link.click();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       setError('Could not export your notes.');
//     }
//   };

//   const handleImportClick = () => {
//     importInputRef.current?.click();
//   };

//   const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     try {
//       const text = await file.text();
//       const parsed = JSON.parse(text);
//       const items: { title: string; content?: string }[] = Array.isArray(parsed) ? parsed : [parsed];
//       for (const item of items) {
//         if (item.title) {
//           await notesApi.createNote(item.title, item.content || '');
//         }
//       }
//       await fetchNotes();
//     } catch (err) {
//       setError('That file could not be imported. Make sure it is a valid notes export.');
//     } finally {
//       event.target.value = '';
//     }
//   };

//   return (
//     <div className="app-shell">
//       <Spine />
//       <main className="main-area">
//         <div className="page-header">
//           <div>
//             <div className="eyebrow">Your collection</div>
//             <h1>Notes</h1>
//           </div>
//           <div className="toolbar">
            
//             <input
//               className="search-input"
//               type="search"
//               placeholder="Search notes…"
//               value={search}
//               onChange={(e) => {
//                 setPage(1);
//                 setSearch(e.target.value);
//               }}
//             />
//             <button type="button" className="btn btn-outline" onClick={handleExport}>
//               Export
//             </button>
//             <button type="button" className="btn btn-outline" onClick={handleImportClick}>
//               Import
//             </button>
//             <input
//               ref={importInputRef}
//               type="file"
//               accept="application/json"
//               className="hidden-input"
//               onChange={handleImportFile}
//             />
//             <button type="button" className="btn btn-primary" onClick={() => navigate('/notes/new')}>
//               New note
//             </button>
//           </div>
//         </div>

//         {error && <div className="auth-error">{error}</div>}

//         {!isLoading && notes.length === 0 && (
//           <div className="empty-state">
//             <div className="mark">A blank page</div>
//             <p>You have not written anything yet. Start your first note.</p>
//             <button type="button" className="btn btn-primary" onClick={() => navigate('/notes/new')} style={{ marginTop: 16 }}>
//               Write a note
//             </button>
//           </div>
//         )}

//         <div className="notes-grid">
//           {notes.map((note) => (
//             <NoteCard key={note.id} note={note} onOpen={(id) => navigate(`/notes/${id}`)} onDelete={handleDelete} />
//           ))}
//         </div>

//         {totalPages > 1 && (
//           <div className="pagination">
//             <button
//               type="button"
//               className="btn btn-outline btn-sm"
//               disabled={page <= 1}
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//             >
//               Prev
//             </button>
//             <span>
//               Page {page} of {totalPages}
//             </span>
//             <button
//               type="button"
//               className="btn btn-outline btn-sm"
//               disabled={page >= totalPages}
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Dashboard;



import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spine from '../components/Spine';
import NoteCard from '../components/NoteCard';
import { useAuth } from '../context/AuthContext';
import { useNotesSocket } from '../hooks/useNotesSocket';
import * as notesApi from '../api/notes';
import type { Note } from '../types';

const PAGE_SIZE = 9;

const Dashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await notesApi.listNotes({ search: search || undefined, page, limit: PAGE_SIZE });
      setNotes(result.notes);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError('Could not load your notes right now.');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const { isConnected } = useNotesSocket({
    token,
    onCreated: () => fetchNotes(),
    onUpdated: (updated) => {
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    },
    onDeleted: (id) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  });

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this note? This cannot be undone.');
    if (!confirmed) return;
    try {
      await notesApi.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError('Could not delete this note.');
    }
  };

  const handleExport = async () => {
    try {
      const all = await notesApi.listNotes({ limit: 1000 });
      const blob = new Blob([JSON.stringify(all.notes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notes-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Could not export your notes.');
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const items: { title: string; content?: string }[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item.title) {
          await notesApi.createNote(item.title, item.content || '');
        }
      }
      await fetchNotes();
    } catch (err) {
      setError('That file could not be imported. Make sure it is a valid notes export.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="flex stack:flex-col min-h-screen">
      <Spine />
      <main className="flex-1 min-w-0 px-12 stack:px-5 pt-10 stack:pt-6 pb-16 stack:pb-12">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-7">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-body-muted mb-1.5">
              Your collection
            </div>
            <h1 className="text-[32px]">Notes</h1>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <input
              className="border border-canvas-line bg-paper rounded-card px-[13px] py-[9px] text-sm min-w-[220px]"
              type="search"
              placeholder="Search notes…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <button
              type="button"
              className="font-body font-semibold text-sm rounded-card border border-canvas-line bg-transparent text-ink px-[18px] py-2.5 inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:border-ink"
              onClick={handleExport}
            >
              Export
            </button>
            <button
              type="button"
              className="font-body font-semibold text-sm rounded-card border border-canvas-line bg-transparent text-ink px-[18px] py-2.5 inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:border-ink"
              onClick={handleImportClick}
            >
              Import
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
            <button
              type="button"
              className="font-body font-semibold text-sm rounded-card border border-transparent bg-ink text-paper px-[18px] py-2.5 inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:bg-ink-soft"
              onClick={() => navigate('/notes/new')}
            >
              New note
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-danger-soft text-danger text-[13px] px-3 py-2.5 rounded-card mb-4">{error}</div>
        )}

        {!isLoading && notes.length === 0 && (
          <div className="text-center py-20 px-5 text-body-muted">
            <div className="font-display text-[22px] text-ink mb-2">A blank page</div>
            <p>You have not written anything yet. Start your first note.</p>
            <button
              type="button"
              className="font-body font-semibold text-sm rounded-card border border-transparent bg-ink text-paper px-[18px] py-2.5 inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:bg-ink-soft mt-4"
              onClick={() => navigate('/notes/new')}
            >
              Write a note
            </button>
          </div>
        )}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[18px] mt-7">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onOpen={(id) => navigate(`/notes/${id}`)} onDelete={handleDelete} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 items-center mt-8 font-mono text-xs text-body-muted">
            <button
              type="button"
              className="font-body font-semibold text-xs rounded-card border border-canvas-line bg-transparent text-ink px-3 py-1.5 cursor-pointer transition-colors duration-150 hover:border-ink disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="font-body font-semibold text-xs rounded-card border border-canvas-line bg-transparent text-ink px-3 py-1.5 cursor-pointer transition-colors duration-150 hover:border-ink disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;