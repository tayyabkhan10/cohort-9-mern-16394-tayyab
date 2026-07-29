import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, X, FolderPlus, AlertTriangle } from 'lucide-react';
import Spine from '../components/Spine';
import NoteCard from '../components/NoteCard';
import FolderCard from '../components/FolderCard';
import { useAuth } from '../context/AuthContext';
import { useNotesSocket } from '../hooks/useNotesSocket';
import * as notesApi from '../api/notes';
import * as foldersApi from '../api/folders';
import type { Note, Folder } from '../types';

const PAGE_SIZE = 9;
type DateFilter = 'today' | 'week' | 'month' | 'all';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const isWithin = (iso: string, filter: DateFilter): boolean => {
  if (filter === 'all') return true;
  const date = new Date(iso);
  const now = new Date();
  const days = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (filter === 'today') return date.toDateString() === now.toDateString();
  if (filter === 'week') return days <= 7;
  if (filter === 'month') return days <= 30;
  return true;
};

const Dashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeFolderId = searchParams.get('folder') || undefined;
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notesFilter, setNotesFilter] = useState<DateFilter>('all');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const importInputRef = useRef<HTMLInputElement>(null);

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await notesApi.listNotes({
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
        folder_id: activeFolderId
      });
      setNotes(result.notes);
      setTotalPages(result.totalPages || 1);
    } catch {
      setError('Could not load your notes right now.');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, activeFolderId]);

  const fetchFolders = useCallback(async () => {
    try {
      const result = await foldersApi.listFolders();
      setFolders(result);
    } catch {
      setFolders((prev) => prev);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useNotesSocket({
    token,
    onCreated: () => fetchNotes(),
    onUpdated: (updated) => {
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    },
    onDeleted: (id) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  });

  const closeConfirm = () => setConfirmState((prev) => ({ ...prev, open: false }));

  const askConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({ open: true, title, message, onConfirm });
  };

  const handleDelete = (id: string) => {
    askConfirm('Delete this note?', 'This cannot be undone.', async () => {
      try {
        await notesApi.deleteNote(id);
        setNotes((prev) => prev.filter((n) => n.id !== id));
      } catch {
        setError('Could not delete this note.');
      }
      closeConfirm();
    });
  };

  const handleDeleteFolder = (id: string) => {
    askConfirm('Delete this folder?', 'Notes inside will stay, just unfiled.', async () => {
      try {
        await foldersApi.deleteFolder(id);
        setFolders((prev) => prev.filter((f) => f.id !== id));
      } catch {
        setError('Could not delete this folder.');
      }
      closeConfirm();
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const folder = await foldersApi.createFolder(newFolderName.trim());
      setFolders((prev) => [folder, ...prev]);
      setShowNewFolder(false);
      setNewFolderName('');
    } catch {
      setError('Could not create the folder.');
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
    } catch {
      setError('Could not export your notes.');
    }
  };

  const handleImportClick = () => importInputRef.current?.click();

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const items: { title: string; content?: string }[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item.title) {
          await notesApi.createNote({ title: item.title, content: item.content || '' });
        }
      }
      await fetchNotes();
    } catch {
      setError('That file could not be imported. Make sure it is a valid notes export.');
    } finally {
      event.target.value = '';
    }
  };

  const visibleNotes = notes.filter((n) => isWithin(n.updated_at, notesFilter));
  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex stack:flex-col min-h-screen bg-white">
      <Spine />
      <main className="flex-1 min-w-0 px-12 stack:px-5 pt-10 stack:pt-6 pb-16 stack:pb-12 bg-white">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-9">
          <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">My Notes</h1>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="border border-gray-200 bg-white rounded-full pl-10 pr-4 py-2.5 text-sm min-w-[240px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                type="search"
                placeholder="Search notes…"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <button
              type="button"
              className="text-sm font-semibold rounded-full border border-gray-200 bg-white text-gray-700 px-4 py-2 hover:border-gray-900 hover:text-gray-900 transition-colors"
              onClick={handleExport}
            >
              Export
            </button>
            <button
              type="button"
              className="text-sm font-semibold rounded-full border border-gray-200 bg-white text-gray-700 px-4 py-2 hover:border-gray-900 hover:text-gray-900 transition-colors"
              onClick={handleImportClick}
            >
              Import
            </button>
            <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />

            <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-[12px] font-semibold ml-1">
              {initials}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] px-3 py-2.5 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold text-gray-900">Folders</h2>
          <button
            type="button"
            onClick={() => setShowNewFolder(true)}
            className="text-[13px] font-semibold text-gray-500 flex items-center gap-1.5 hover:text-gray-900 transition-colors"
          >
            <FolderPlus size={15} /> New folder
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-11">
          {folders.slice(0, 7).map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpen={(id) => {
                setPage(1);
                navigate(`/dashboard?folder=${id}`);
              }}
              onDelete={handleDeleteFolder}
            />
          ))}
          <button
            type="button"
            onClick={() => setShowNewFolder(true)}
            className="min-h-[130px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors"
          >
            <Plus size={20} />
            <span className="text-[13px] font-medium">New folder</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[20px] font-semibold text-gray-900">
              {activeFolder ? activeFolder.name : 'My Notes'}
            </h2>
            {activeFolder && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[12px] font-semibold text-gray-400 hover:text-gray-900 underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-full p-1">
            {(['today', 'week', 'month', 'all'] as DateFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setNotesFilter(f)}
                className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-colors capitalize ${
                  notesFilter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {!isLoading && visibleNotes.length === 0 && (
          <div className="text-center py-16 px-5 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <div className="text-[20px] font-semibold text-gray-900 mb-2">A blank page</div>
            <p>Nothing here for this filter yet.</p>
            <button
              type="button"
              className="text-sm font-semibold rounded-full bg-gray-900 text-white px-5 py-2.5 mt-4 hover:bg-gray-700 transition-colors"
              onClick={() => navigate(activeFolderId ? '/notes/new?folder=' + activeFolderId : '/notes/new')}
            >
              Write a note
            </button>
          </div>
        )}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
          {visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpen={(id) => navigate(`/notes/${id}`)}
              onDelete={handleDelete}
            />
          ))}
          <button
            type="button"
            onClick={() => navigate(activeFolderId ? '/notes/new?folder=' + activeFolderId : '/notes/new')}
            className="min-h-[190px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors"
          >
            <Plus size={22} />
            <span className="text-[13px] font-medium">New note</span>
          </button>
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 items-center mt-8 text-xs text-gray-500">
            <button
              type="button"
              className="font-semibold text-xs rounded-full border border-gray-200 bg-white text-gray-700 px-3 py-1.5 hover:border-gray-900 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              className="font-semibold text-xs rounded-full border border-gray-200 bg-white text-gray-700 px-3 py-1.5 hover:border-gray-900 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {showNewFolder && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
          onClick={() => setShowNewFolder(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-[360px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-gray-900">New folder</h3>
              <button type="button" onClick={() => setShowNewFolder(false)} className="text-gray-400 hover:text-gray-900">
                <X size={18} />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder name"
              className="w-full border border-gray-200 bg-white rounded-xl px-3.5 py-2.5 text-[14px] text-gray-900 focus:outline-none focus:border-gray-900 mb-5 transition-colors"
            />
            <button
              type="button"
              onClick={handleCreateFolder}
              className="w-full text-sm font-semibold rounded-full bg-gray-900 text-white py-2.5 hover:bg-gray-700 transition-colors"
            >
              Create folder
            </button>
          </div>
        </div>
      )}

      {confirmState.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
          onClick={closeConfirm}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-[380px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3 className="text-[16px] font-semibold text-gray-900 mb-1.5">{confirmState.title}</h3>
            <p className="text-[13px] text-gray-500 mb-6">{confirmState.message}</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={closeConfirm}
                className="flex-1 text-sm font-semibold rounded-full border border-gray-200 bg-white text-gray-700 py-2.5 hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className="flex-1 text-sm font-semibold rounded-full bg-red-500 text-white py-2.5 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;