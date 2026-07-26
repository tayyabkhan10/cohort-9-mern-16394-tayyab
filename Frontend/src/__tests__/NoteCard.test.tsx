import { render, screen, fireEvent } from '@testing-library/react';
import NoteCard from '../components/NoteCard';
import type { Note } from '../types';

const sampleNote: Note = {
  id: '1',
  user_id: 'u1',
  title: 'Grocery list',
  content: '<p>Milk, eggs, bread</p>',
  created_at: '2026-07-01T10:00:00.000Z',
  updated_at: '2026-07-02T10:00:00.000Z'
};

describe('NoteCard', () => {
  it('renders the note title and stripped preview text', () => {
    render(<NoteCard note={sampleNote} onOpen={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Grocery list')).toBeInTheDocument();
    expect(screen.getByText('Milk, eggs, bread')).toBeInTheDocument();
  });

  it('calls onOpen when the card is clicked', () => {
    const onOpen = jest.fn();
    render(<NoteCard note={sampleNote} onOpen={onOpen} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByText('Grocery list'));
    expect(onOpen).toHaveBeenCalledWith('1');
  });

  it('calls onDelete without triggering onOpen when delete is clicked', () => {
    const onOpen = jest.fn();
    const onDelete = jest.fn();
    render(<NoteCard note={sampleNote} onOpen={onOpen} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('1');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('shows a fallback message when content is empty', () => {
    const emptyNote = { ...sampleNote, content: null };
    render(<NoteCard note={emptyNote} onOpen={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('No content yet.')).toBeInTheDocument();
  });
});
