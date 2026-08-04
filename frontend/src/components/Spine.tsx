import { NavLink, useNavigate } from 'react-router-dom';
import { NotebookPen, User, StickyNote } from 'lucide-react';
import { NOTE_COLORS, NOTE_COLOR_CLASSES } from '../utils/noteColors';

const linkClasses = (isActive: boolean) =>
  `w-14 h-14 stack:w-11 stack:h-11 rounded-2xl flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-white/50 no-underline border-0 cursor-pointer bg-transparent transition-colors duration-150 hover:bg-white/[0.08] hover:text-paper ${
    isActive ? 'bg-white/10 text-paper' : ''
  }`;

const Spine = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-[92px] stack:w-full bg-ink text-paper flex flex-col stack:flex-row items-center py-7 stack:py-3 stack:px-4 shrink-0">
      <div className="flex flex-col items-center gap-1 mb-8 stack:mb-0 stack:mr-auto stack:flex-row">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
          <NotebookPen size={18} strokeWidth={2.25} />
        </div>
        <span className="font-display text-[11px] font-semibold tracking-[0.12em] mt-1 stack:mt-0 stack:ml-2">
          10 Pearls
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate('/notes/new')}
        className="w-12 h-12 stack:w-10 stack:h-10 rounded-2xl bg-accent text-paper flex items-center justify-center mb-2 cursor-pointer hover:bg-accent/85 transition-colors"
        aria-label="Add new note"
        title="New note"
      >
        <StickyNote size={18} strokeWidth={2.25} />
      </button>

      <div className="flex stack:flex-row gap-1.5 mb-8 stack:mb-0 stack:mx-4">
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`w-3 h-3 rounded-full ${NOTE_COLOR_CLASSES[c].dot} hover:scale-125 transition-transform cursor-pointer`}
            onClick={() => navigate(`/notes/new?color=${c}`)}
            title={`New ${c} note`}
            aria-label={`New note with ${c} color`}
          />
        ))}
      </div>

      <div className="flex flex-col stack:flex-row gap-2 flex-1">
        <NavLink to="/dashboard" className={({ isActive }) => linkClasses(isActive)}>
          <StickyNote size={16} strokeWidth={2} />
          Notes
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => linkClasses(isActive)}>
          <User size={16} strokeWidth={2} />
          Profile
        </NavLink>
      </div>
    </nav>
  );
};

export default Spine;