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

## ✨ Features
- Secure JWT authentication with HttpOnly cookies and bcrypt hashing
- Task lifecycle management (create, read, update, delete) with creator/assignee tracking
- Real-time task collaboration via Socket.io
- User dashboard endpoints for assigned, created, and overdue views
- Flexible filtering/sorting by status, priority, and due date
- Role-aware validation with Zod DTOs

## 🛠 Tech Stack
- Node.js 20+ with TypeScript
- Express 5 routing layer
- Prisma ORM connecting to PostgreSQL
- Zod for schema validation and DTO enforcement
- Socket.io for real-time events
- JWT + bcrypt for auth
- Jest with ts-jest for unit testing
- Helmet, cors, cookie-parser, and rate-limiting middleware

## 🏗 Architecture
`backend/src/` follows a layered Service-Repository pattern:

```
src/
├── controllers/     # HTTP handlers + response shaping
├── services/        # Business logic orchestration
├── repositories/    # Prisma data access code
├── routes/          # Express routers wired to controllers
├── middleware/      # Auth, validation, and error handling
├── dtos/            # Zod schemas + transformation helpers
├── socket/           # Socket.io handlers (task collaboration)
├── config/          # Database + app configuration
└── __tests__/        # Unit tests
```

Controllers validate inputs, services encapsulate workflows, and repositories talk to Prisma, allowing easy unit testing and replacement of persistence layers down the road.

## 📦 Prerequisites
- PostgreSQL 14+
- Node.js 20
- npm 10+ (or pnpm/yarn, though scripts assume `npm`)

## 🚀 Installation & Setup

```bash
# from repo root
cd backend
npm install
```

1. Create a `.env` file with the required keys:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   JWT_SECRET=<strong-secret>
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   PORT=5000
   ```
   Update each value to match your local database and frontend origin.
2. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
3. Apply the schema migrations locally:
   ```bash
   npm run prisma:migrate
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

The API listens on `http://localhost:5000` by default.

## 📚 API Documentation
### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

#### `POST /auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```
Registers a user, returns `success`, `data`, and a JWT token.

#### `POST /auth/login`
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
Returns authenticated user data and a token in a secure cookie.

#### `POST /auth/logout`
Authorization: Bearer `<token>`

### Task Endpoints
All require a valid JWT.

#### `POST /tasks`
- Creates a task; optional `assignedToId`.
#### `GET /tasks`
- Supports filters: `status`, `priority`, `sortBy`, `sortOrder`.
#### `GET /tasks/:id`
- Fetch single task with creator/assignee details.
#### `PUT /tasks/:id` / `DELETE /tasks/:id`
- Update status/priority or delete (cascades via Prisma relations).
#### Dashboard & Views
- `GET /tasks/dashboard`, `/tasks/my/assigned`, `/tasks/my/created`, `/tasks/overdue`.

### Users
#### `GET /users/profile`
Returns authenticated user info.
#### `PUT /users/profile`
Allows name/email updates.

## ⚡ Real-Time Features
Socket.io powers live collaboration:

```typescript
export const initializeTaskSocket = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('task:assign', (data) => {
      io.to(`user:${data.assignedToId}`).emit('task-assigned', {
        taskId: data.taskId,
        taskTitle: data.task.title,
        assignedBy: data.task.creator?.name,
      });
    });
  });
};
```

Emitted events: `task-created`, `task-updated`, `task-deleted`, `task-assigned`.

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
1. **PostgreSQL**: ACID compliance, Prisma compatibility, JSON flexibility, proven scalability.
2. **JWT Authentication**: HttpOnly cookie storage, 7-day expiration, SameSite strict + secure flag in prod.
3. **Service/Repository Pattern**: Keeps business logic separate from Prisma; easier to test/migrate.
4. **SWR + Socket.io (frontend interplay)**: Enables cache-first rendering with eventual real-time updates (details in frontend README).
5. **Zod Validation**: Shared runtime/type-safety between controllers and dtos.
6. **Socket.io Room Pattern**: `user:${userId}` rooms enable targeted notifications.

## 🧪 Testing
- `npm test` (uses Jest/ts-jest)
- `npm test -- --coverage`

Existing coverage highlights:
  - Auth service registration/login
  - Task service business logic
  - Repository layer with Prisma mocks

## 🚀 Deployment
1. Set up PostgreSQL on Railway/Render.
2. Configure env vars:
   ```
   DATABASE_URL=<connection-string>
   JWT_SECRET=<strong-secret>
   CLIENT_URL=https://your-frontend-url
   NODE_ENV=production
   ```
3. Build: `npm run build`
4. Start: `npm start`
5. Ensure migrations ran: `npm run prisma:migrate`

## 📄 License
ISC

## 👤 Author
**Krishna Mohan** · https://github.com/VKM112
