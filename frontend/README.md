# Notes App Frontend (React + TypeScript)

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and point it at your backend:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```
3. `npm run dev` and open the printed local URL
4. `npm test` to run the Jest + React Testing Library suite
5. `npm run build` to produce a production build in `dist/`

## Pages

- `/login` — sign in
- `/signup` — create an account
- `/dashboard` — notes list with search, pagination, export/import, live updates
- `/notes/new` and `/notes/:id` — create or edit a note with the rich text editor
- `/profile` — account details and logout

## Features

- JWT auth stored in `localStorage`, attached automatically to API calls
- Notes CRUD against the backend REST API
- Custom rich text editor (bold, italic, underline, quote, lists) — no external editor dependency
- Search and pagination wired to the backend query params
- Export notes to a `.json` file, import notes from a `.json` file
- Live updates over Socket.IO: other sessions see new/edited/deleted notes without a refresh
- Protected routes redirect to `/login` when not authenticated
- Distinctive visual design: ink/paper/catalog-card theme, not a template default

## Testing

Tests live in `src/__tests__` and use Jest with `@testing-library/react`. They cover:
- `NoteCard` rendering, open, and delete interactions
- `Login` form submission and error handling
- `Signup` password-length validation

## Requires

The backend from the companion `notes-backend-ts` project running and reachable at `VITE_API_URL`.
