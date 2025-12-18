# Backend README

## Overview
The backend is a TypeScript-powered Express API that handles authentication, task management, real-time collaboration (via Socket.IO), and integrations with Google OAuth. Prisma manages the PostgreSQL schema, and Zod validates the request/response contracts.

## Tech Stack
- Node.js + TypeScript
- Express 5
- Prisma ORM with PostgreSQL
- Socket.IO (real-time updates)
- Zod for schema validation
- JWT, bcrypt, and cookie-based auth helpers
- Helmet, cors, and cookie-parser for hardened middleware
- Google OAuth via `google-auth-library`

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL instance (local or remote)
- Optional: `pnpm`/`yarn` (but the scripts below use `npm`)

### Install
```bash
cd backend
npm install
```

### Environment
Create a `.env` file at the repo root (or copy from this folder) with:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=<strong-secret>
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=<from Google Cloud>
GOOGLE_CLIENT_SECRET=<from Google Cloud>
```

Adjust the values to match your PostgreSQL credentials and OAuth client.

### Database
```bash
npm run prisma:dev
```
This runs `prisma migrate dev` and keeps the local database in sync; rerun whenever you update schema changes.

### Development
- `npm run dev` starts the API with `ts-node-dev` and restarts on changes.

### Production
- `npm run build` runs `prisma generate` and compiles `src/` into `dist/`.
- `npm run start` launches the compiled server (`dist/server.js`).

## Directory notes
- `src/app.ts` wires middleware, routes, and sockets.
- `src/server.ts` boots the HTTP server.
- `src/routes`, `controllers`, `services`, and `validators` follow a layered architecture for request handling.
- `src/sockets` hosts the real-time task collaboration logic.
