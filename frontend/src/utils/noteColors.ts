import type { NoteColor } from '../types';

interface ColorClasses {
  bg: string;
  text: string;
  dot: string;
  border: string;
}

// Tailwind's JIT scanner needs literal class strings — it can't resolve
// `bg-note-${color}` built at runtime — so every option is spelled out here.
export const NOTE_COLOR_CLASSES: Record<NoteColor, ColorClasses> = {
  yellow: { bg: 'bg-note-yellow', text: 'text-note-yellow-ink', dot: 'bg-note-yellow', border: 'border-note-yellow' },
  coral: { bg: 'bg-note-coral', text: 'text-note-coral-ink', dot: 'bg-note-coral', border: 'border-note-coral' },
  blue: { bg: 'bg-note-blue', text: 'text-note-blue-ink', dot: 'bg-note-blue', border: 'border-note-blue' },
  mint: { bg: 'bg-note-mint', text: 'text-note-mint-ink', dot: 'bg-note-mint', border: 'border-note-mint' },
  lavender: { bg: 'bg-note-lavender', text: 'text-note-lavender-ink', dot: 'bg-note-lavender', border: 'border-note-lavender' }
};

export const NOTE_COLORS: NoteColor[] = ['yellow', 'coral', 'blue', 'mint', 'lavender'];

/** Cycle through colors deterministically so a fresh note grid still looks varied. */
export const colorForIndex = (index: number): NoteColor => NOTE_COLORS[index % NOTE_COLORS.length];