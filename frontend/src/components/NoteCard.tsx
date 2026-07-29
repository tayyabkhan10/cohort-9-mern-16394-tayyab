import { Pencil, Trash2, Clock } from 'lucide-react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const stripHtml = (html: string | null): string => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (isoDate: string): string => {
  return new Date(isoDate).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

const NoteCard = ({ note, onOpen, onDelete }: NoteCardProps) => {
  return (
    <div
      className="group relative bg-white rounded-2xl border border-gray-200 px-5 pt-4 pb-4 min-h-[190px] flex flex-col cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
      onClick={() => onOpen(note.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.08em] text-gray-400 font-semibold">
          {formatDate(note.updated_at)}
        </span>
        <button
          type="button"
          className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-900 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(note.id);
          }}
          aria-label="Edit note"
        >
          <Pencil size={13} strokeWidth={2.25} />
        </button>
      </div>

      <h3 className="text-[16px] font-semibold text-gray-900 mt-2 mb-1.5 leading-snug">{note.title}</h3>

      <p className="text-[13px] leading-relaxed text-gray-500 flex-1 overflow-hidden line-clamp-4">
        {stripHtml(note.content) || 'No content yet.'}
      </p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
          <Clock size={12} strokeWidth={2.25} />
          {formatTime(note.updated_at)}
        </div>
        <button
          type="button"
          className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          aria-label="Delete note"
        >
          <Trash2 size={13} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;