import { MoreHorizontal, Folder as FolderIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Folder } from '../types';

interface FolderCardProps {
  folder: Folder;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });

const FolderCard = ({ folder, onOpen, onDelete }: FolderCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="relative bg-white rounded-2xl border border-gray-200 px-5 py-5 min-h-[130px] flex flex-col justify-between cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
      onClick={() => onOpen(folder.id)}
    >
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
          <FolderIcon size={17} strokeWidth={2.25} />
        </div>
        <div className="relative">
          <button
            type="button"
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((s) => !s);
            }}
            aria-label="Folder options"
          >
            <MoreHorizontal size={16} strokeWidth={2.25} />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] py-1 z-20 w-32"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                onClick={() => {
                  setShowMenu(false);
                  onDelete(folder.id);
                }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-[16px] font-semibold text-gray-900">{folder.name}</h3>
        <p className="text-[11px] text-gray-400 mt-1">
          {folder.note_count ?? 0} note{(folder.note_count ?? 0) === 1 ? '' : 's'} · {formatDate(folder.created_at)}
        </p>
      </div>
    </div>
  );
};

export default FolderCard;