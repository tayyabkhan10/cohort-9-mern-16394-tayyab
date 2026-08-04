`# Notes App Backend (TypeScript)

## Setup

1. `npm install`
2. Copy `.env.example` to `.env`, fill in Supabase Postgres connection string and JWT secret
3. Run `db/schema.sql` on Supabase (SQL Editor)
4. `npm run dev` for development, `npm run build && npm start` for production
5. `npm test` to run the test suite

## API Endpoints

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me (requires token)
- GET /api/notes?search=&page=&limit= (requires token)
- GET /api/notes/:id (requires token)
- POST /api/notes (requires token)
- PUT /api/notes/:id (requires token)
- DELETE /api/notes/:id (requires token)

All protected routes require header: `Authorization: Bearer <token>`

## Real-time Updates

The server exposes a Socket.IO endpoint on the same port. Clients must connect with a JWT in the `auth.token` field:

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000', { auth: { token: JWT_TOKEN } });
socket.on('note:created', (note) => {});
socket.on('note:updated', (note) => {});
socket.on('note:deleted', ({ id }) => {});
```

## Features

- JWT authentication
- Notes CRUD scoped per user
- Search notes by title/content (`?search=`)
- Pagination (`?page=&limit=`)
- Get logged-in user profile
- Global error handling middleware
- Pino request/response logging
- Full TypeScript with strict mode
- Mocha + Chai + Sinon + Supertest test suite

## Environment Variables (.env)

PORT=5000
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
NODE_ENV=development
