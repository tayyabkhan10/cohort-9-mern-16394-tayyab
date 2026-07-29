import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Spine from '../components/Spine';
import RichTextEditor from '../components/RichTextEditor';
import * as notesApi from '../api/notes';
import * as foldersApi from '../api/folders';
import type { Folder } from '../types';

const NoteEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState<string>(searchParams.get('folder') || '');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedNoteId, setSavedNoteId] = useState<string | undefined>(isNew ? undefined : id);

  useEffect(() => {
    foldersApi.listFolders().then(setFolders).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    notesApi
      .getNote(id)
      .then((note) => {
        setTitle(note.title);
        setContent(note.content || '');
        setFolderId(note.folder_id || '');
      })
      .catch(() => setError('Could not load this note.'))
      .finally(() => setIsLoading(false));
  }, [id, isNew]);

  const persist = async (nextTitle: string, nextContent: string): Promise<void> => {
    const payload = {
      title: nextTitle || 'Untitled note',
      content: nextContent,
      folder_id: folderId || null
    };
    if (savedNoteId) {
      await notesApi.updateNote(savedNoteId, payload);
    } else {
      const created = await notesApi.createNote(payload);
      setSavedNoteId(created.id);
      window.history.replaceState(null, '', `/notes/${created.id}`);
    }
  };

  const handleAutoSave = async (html: string) => {
    if (!title.trim()) return;
    try {
      await persist(title, html);
    } catch {
      // silent
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Give your note a title before saving.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await persist(title, content);
      navigate('/dashboard');
    } catch {
      setError('Could not save this note. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex stack:flex-col min-h-screen bg-white">
        <Spine />
        <main className="flex-1 min-w-0 px-12 stack:px-5 pt-10 stack:pt-6 pb-16 stack:pb-12">
          <p className="text-gray-400">Loading note…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex stack:flex-col min-h-screen bg-white">
      <Spine />
      <main className="flex-1 min-w-0 px-12 stack:px-5 pt-10 stack:pt-6 pb-16 stack:pb-12 bg-white">
        <div className="w-full max-w-[1100px] mx-auto">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-7">
            <div>
              <div className="text-[11px] uppercase tracking-[0.12em] text-gray-400 mb-1.5 font-semibold">
                {isNew ? 'New entry' : 'Editing'}
              </div>
              <h1 className="text-[32px] font-bold text-gray-900">{title || 'Untitled note'}</h1>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] px-3 py-2.5 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5 mb-5">
            <label htmlFor="title" className="text-[11px] uppercase tracking-[0.08em] text-gray-400 font-semibold">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="border border-gray-200 bg-white rounded-xl px-4 py-3 text-[17px] font-semibold text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is this note about?"
            />
          </div>

          <div className="flex items-center gap-2.5 mb-6 bg-white border border-gray-200 rounded-xl px-4 py-3 w-fit">
            <span className="text-[11px] uppercase tracking-[0.08em] text-gray-400 font-semibold">Folder</span>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="border border-gray-200 bg-white rounded-full px-3 py-1.5 text-[13px] text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
            >
              <option value="">No folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-[11px] uppercase tracking-[0.08em] text-gray-400 font-semibold">Content</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing…"
              onAutoSave={handleAutoSave}
              documentTitle={title || 'Untitled note'}
            />
          </div>

          <div className="flex gap-2.5 mt-[22px]">
            <button
              type="button"
              className="font-semibold text-sm rounded-full border border-transparent bg-gray-900 text-white px-5 py-2.5 inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:enabled:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save note'}
            </button>
            <button
              type="button"
              className="font-semibold text-sm rounded-full border border-gray-200 bg-white text-gray-700 px-5 py-2.5 inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:border-gray-900 hover:text-gray-900"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            {savedNoteId && (
              <span className="self-center text-[11px] text-gray-400 ml-2">Auto Save Note</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteEditor;