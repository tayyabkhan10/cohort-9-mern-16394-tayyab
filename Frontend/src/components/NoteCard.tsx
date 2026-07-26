// import type { Note } from '../types';

// interface NoteCardProps {
//   note: Note;
//   onOpen: (id: string) => void;
//   onDelete: (id: string) => void;
// }

// const stripHtml = (html: string | null): string => {
//   if (!html) return '';
//   const div = document.createElement('div');
//   div.innerHTML = html;
//   return div.textContent || div.innerText || '';
// };

// const formatDate = (isoDate: string): string => {
//   return new Date(isoDate).toLocaleDateString(undefined, {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric'
//   });
// };

// const NoteCard = ({ note, onOpen, onDelete }: NoteCardProps) => {
//   return (
//     <div className="note-card" onClick={() => onOpen(note.id)}>
//       <h3>{note.title}</h3>
//       <p className="note-card__preview">{stripHtml(note.content) || 'No content yet.'}</p>
//       <div className="note-card__stamp">Updated {formatDate(note.updated_at)}</div>
//       <div className="note-card__actions">
//         <button
//           type="button"
//           className="btn btn-outline btn-sm"
//           onClick={(e) => {
//             e.stopPropagation();
//             onOpen(note.id);
//           }}
//         >
//           Edit
//         </button>
//         <button
//           type="button"
//           className="btn btn-danger btn-sm"
//           onClick={(e) => {
//             e.stopPropagation();
//             onDelete(note.id);
//           }}
//         >
//           Delete
//         </button>
//       </div>
//     </div>
//   );
// };

// export default NoteCard;


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
    day: 'numeric',
    year: 'numeric'
  });
};

const NoteCard = ({ note, onOpen, onDelete }: NoteCardProps) => {
  return (
    <div
      className="relative bg-canvas border border-canvas-line rounded-card px-5 pt-5 pb-4 min-h-[150px] flex flex-col cursor-pointer transition-[box-shadow,transform] duration-150 hover:shadow-lift hover:-translate-y-0.5 after:content-[''] after:absolute after:top-0 after:right-0 after:w-[22px] after:h-[22px] after:bg-[linear-gradient(135deg,theme(colors.paper)_50%,transparent_50%)] after:border-b after:border-l after:border-canvas-line"
      onClick={() => onOpen(note.id)}
    >
      <h3 className="text-[17px] mb-2 pr-5">{note.title}</h3>
      <p className="text-[13px] text-body-muted flex-1 overflow-hidden line-clamp-4">
        {stripHtml(note.content) || 'No content yet.'}
      </p>
      <div className="font-mono text-[10px] text-body-muted mt-3.5 uppercase tracking-[0.06em]">
        Updated {formatDate(note.updated_at)}
      </div>
      <div className="flex gap-1.5 mt-2.5">
        <button
          type="button"
          className="font-body font-semibold text-xs rounded-card border border-canvas-line bg-transparent text-ink px-3 py-1.5 cursor-pointer transition-colors duration-150 hover:border-ink"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(note.id);
          }}
        >
          Edit
        </button>
        <button
          type="button"
          className="font-body font-semibold text-xs rounded-card border border-transparent bg-danger-soft text-danger px-3 py-1.5 cursor-pointer transition-colors duration-150 hover:bg-danger-hover"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteCard;