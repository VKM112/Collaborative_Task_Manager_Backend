# 🚀 Collaborative Task Manager — Backend

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Real-Time Features](#-real-time-features)
- [Database Schema](#-database-schema)
- [Design Decisions](#-design-decisions)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [License](#-license)
- [Author](#-author)

## ✨ Features
- JWT authentication stored in HttpOnly cookies with bcrypt password hashing
- Full CRUD task management with creator/assignee relations and dashboard views
- Real-time task events scoped by user rooms through Socket.io
- Zod-powered DTOs for request validation and consistent error handling
- Google OAuth support via `google-auth-library`
- Environment-aware middleware stack (Helmet, cors, cookie-parser, rate limiting helper)

## 🛠 Tech Stack
- Node.js (v20+) with TypeScript 5.9
- Express 5 for routing
- Prisma 7 with PostgreSQL via `@prisma/client` and `@prisma/adapter-pg`
- Socket.io 4 for WebSockets
- Zod for runtime schema validation
- JWT (`jsonwebtoken`) + cookie-parser for stateless auth
- bcrypt for secure password hashing
- Helmet, cors, dotenv for hardened configuration
- Google OAuth via `google-auth-library`
- ts-node-dev / nodemon for developer workflows

## 🏗 Architecture

```
backend/src/
├── config/       # dotenv loaders + constants
├── controllers/  # Express handlers that format responses
├── services/     # Business logic coordinating repositories + sockets
├── routes/       # Auth, tasks, users routers wired in `app.ts`
├── middleware/   # Validation, auth guard, error handler
├── dtos/         # Zod schemas + transformation helpers
├── validators/   # Reusable schema builders
├── sockets/      # Socket.io room + event logic
├── types/        # Shared TypeScript definitions
├── utils/        # Helpers (date, notifications, pagination)
├── app.ts        # Express + Socket.io initialization
└── server.ts     # Entry point that boots the HTTP server
```

Controllers rely on services, services call Prisma (through repositories/DTOs), and sockets emit events based on service state changes to keep clients synchronized.

## 📦 Prerequisites
- PostgreSQL 14+ (local or remote instance)
- Node.js 20+
- npm 10+ (or pnpm/yarn if you prefer, though scripts use npm)

## 🚀 Installation & Setup

```bash
cd backend
npm install
```

Create a `.env` file with:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=<strong-secret>
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:dev
```

Start dev server with hot reloading:

```bash
npm run dev
```

For production:

```bash
npm run build
npm run start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Auth
- `POST /api/v1/auth/register` – body: `name`, `email`, `password`
- `POST /api/v1/auth/login` – issues JWT cookie + response body
- `POST /api/v1/auth/logout` – clears JWT cookie

### Tasks (require JWT)
- `POST /api/v1/tasks` – create with optional `assignedToId`
- `GET /api/v1/tasks` – list with `status`, `priority`, `dueDate`, `sortBy`, `sortOrder` filters
- `GET /api/v1/tasks/:id` – single task with creator/assignee
- `PUT /api/v1/tasks/:id` – update title/description/status/priority/dueDate
- `DELETE /api/v1/tasks/:id` – removes the task
- `GET /api/v1/tasks/dashboard` – grouped assigned/created/overdue tasks
- `/tasks/my/assigned`, `/tasks/my/created`, `/tasks/overdue` – filtered views

### Users
- `GET /api/v1/users/profile` – current user profile
- `PUT /api/v1/users/profile` – update name/email (and optionally picture)

## ⚡ Real-Time Features

Socket.io connects within `app.ts`, joining clients to `user:${userId}` rooms.

Events:
- Server emits `task-created`, `task-updated`, `task-deleted`, `task-assigned`
- Clients emit `join` and `task:assign`
- The backend integrates service logic with sockets so a task creation/update triggers emitted events to relevant rooms.

## 🗄 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  createdTasks  Task[] @relation("TaskCreator")
  assignedTasks Task[] @relation("TaskAssignee")
}

model Task {
  id          String   @id @default(cuid())
  title       String   @db.VarChar(100)
  description String   @db.Text
  dueDate     DateTime
  priority    Priority @default(MEDIUM)
  status      Status   @default(TODO)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  creatorId    String
  assignedToId String?

  creator    User  @relation("TaskCreator", fields: [creatorId], references: [id], onDelete: Cascade)
  assignedTo User? @relation("TaskAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum Status {
  TODO
  IN_PROGRESS
  REVIEW
  COMPLETED
}
```

## 💡 Design Decisions
1. **Service/Repository Layering** keeps HTTP concerns separate from business logic and Prisma persistence for easier testing.
2. **JWT + Cookies** allow stateless auth that integrates with HttpOnly cookies and CORS-safe clients.
3. **Socket.io Rooms** enable targeted notifications while Discord-style global events keep everyone informed.
4. **Zod DTOs** ensure the backend enforces the same shapes as responses, producing precise validation errors.
5. **Prisma + PostgreSQL** power relational task/user data with migrations and type-safe queries.

## 🧪 Testing
- Tests are powered by Jest/ts-jest (if added later); currently use manual verification plus `ts-node-dev`.

## 🚀 Deployment
1. Provision PostgreSQL (Railway/Render) and set `DATABASE_URL`.
2. Configure env vars (`JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`).
3. Run `npm run build` and `npm run start`.
4. Ensure `prisma migrate deploy` runs before startup in production.

## 📄 License
ISC

## 👤 Author
**Krishna Mohan** · https://github.com/VKM112
