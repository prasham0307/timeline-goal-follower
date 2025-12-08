# Project File Structure

```
timeline-goal-follower/
│
├── 📄 README.md                     # Main documentation & setup guide
├── 📄 QUICKSTART.md                 # 5-minute getting started guide
├── 📄 API.md                        # Complete API documentation
├── 📄 DEVELOPMENT.md                # Architecture & design decisions
├── 📄 TODO.md                       # Future enhancements roadmap
├── 📄 SUMMARY.md                    # Project overview & stats
├── 📄 CHECKLIST.md                  # Installation verification steps
├── 📄 package.json                  # Root package with scripts
├── 📄 .prettierrc                   # Code formatting rules
├── 📄 .gitignore                    # Git ignore patterns
├── 📄 .env.example                  # Environment template
├── 📄 vercel.json                   # Vercel deployment config
├── 📄 setup.ps1                     # Automated setup script
│
├── 🗂️ backend/                      # Backend API (Node.js + Express + TypeScript)
│   ├── 📄 package.json              # Backend dependencies
│   ├── 📄 tsconfig.json             # TypeScript configuration
│   ├── 📄 jest.config.js            # Jest test configuration
│   ├── 📄 .env                      # Backend environment variables
│   ├── 📄 .env.example              # Backend env template
│   ├── 📄 .eslintrc.js              # ESLint rules
│   │
│   ├── 🗂️ prisma/                   # Database schema & migrations
│   │   ├── 📄 schema.prisma         # Database models (User, Goal, Task, Template)
│   │   └── 📄 seed.ts               # Sample data seeding script
│   │
│   ├── 🗂️ src/                      # Source code
│   │   ├── 📄 index.ts              # Express app entry point
│   │   ├── 📄 db.ts                 # Prisma client instance
│   │   │
│   │   ├── 🗂️ routes/              # API route handlers
│   │   │   ├── 📄 auth.ts           # POST /signup, /login, /password-reset, GET /me
│   │   │   ├── 📄 goals.ts          # CRUD for goals, timeline generation
│   │   │   ├── 📄 tasks.ts          # PATCH, DELETE tasks
│   │   │   └── 📄 templates.ts      # GET templates
│   │   │
│   │   ├── 🗂️ services/            # Business logic (testable)
│   │   │   ├── 📄 timeline.ts       # Timeline generation, progress calc
│   │   │   ├── 📄 timeline.test.ts  # Unit tests (Jest)
│   │   │   └── 📄 notifications.ts  # Email adapter (console/SMTP)
│   │   │
│   │   ├── 🗂️ middleware/          # Express middleware
│   │   │   └── 📄 auth.ts           # JWT authentication & token generation
│   │   │
│   │   └── 🗂️ validators/          # Input validation
│   │       └── 📄 schemas.ts        # Zod validation schemas
│   │
│   └── 🗂️ dist/                     # Compiled JavaScript (generated)
│
├── 🗂️ frontend/                     # Frontend SPA (React + Vite + TypeScript)
│   ├── 📄 index.html                # HTML entry point
│   ├── 📄 package.json              # Frontend dependencies
│   ├── 📄 tsconfig.json             # TypeScript configuration
│   ├── 📄 tsconfig.node.json        # Node-specific TS config
│   ├── 📄 vite.config.ts            # Vite build configuration
│   ├── 📄 tailwind.config.js        # Tailwind CSS configuration
│   ├── 📄 postcss.config.js         # PostCSS configuration
│   ├── 📄 .env                      # Frontend environment variables
│   ├── 📄 .env.example              # Frontend env template
│   │
│   ├── 🗂️ src/                      # Source code
│   │   ├── 📄 main.tsx              # React app entry point
│   │   ├── 📄 App.tsx               # Router & query client setup
│   │   ├── 📄 index.css             # Global styles (Tailwind)
│   │   │
│   │   ├── 🗂️ pages/               # Route-level components
│   │   │   ├── 📄 LoginPage.tsx     # Login form
│   │   │   ├── 📄 SignupPage.tsx    # Signup form
│   │   │   ├── 📄 DashboardPage.tsx # Goal list with create modal
│   │   │   ├── 📄 GoalDetailPage.tsx# Timeline & calendar views
│   │   │   └── 📄 DayDetailPage.tsx # Daily task checklist
│   │   │
│   │   ├── 🗂️ components/          # Reusable UI components
│   │   │   ├── 📄 AppShell.tsx      # Layout wrapper (header, nav)
│   │   │   └── 📄 ProgressBar.tsx   # Progress indicator
│   │   │
│   │   ├── 🗂️ lib/                 # Utilities & API client
│   │   │   └── 📄 api.ts            # Axios client, API functions
│   │   │
│   │   └── 🗂️ store/               # State management
│   │       └── 📄 auth.ts           # Zustand auth store
│   │
│   └── 🗂️ dist/                     # Production build (generated)
│
└── 🗂️ node_modules/                 # Dependencies (not in git)
```

## 📁 Key Directories Explained

### Root Level
- **Documentation files**: README, guides, API docs
- **Configuration**: package.json, prettier, vercel.json
- **Scripts**: setup.ps1 for automated installation

### Backend (`/backend`)
- **prisma/**: Database schema, migrations, seed data
- **src/routes/**: REST API endpoints (thin controllers)
- **src/services/**: Business logic (fat, testable)
- **src/middleware/**: Auth, validation, error handling
- **src/validators/**: Zod schemas for request validation

### Frontend (`/frontend`)
- **src/pages/**: One component per route
- **src/components/**: Reusable UI pieces
- **src/lib/**: API client, utilities
- **src/store/**: Global state (auth)

## 🔍 File Purposes

### Backend Core Files

**`backend/src/index.ts`**
- Express app setup
- CORS configuration
- Route mounting
- Error handling
- Server startup

**`backend/src/routes/auth.ts`**
- POST /api/auth/signup (create user)
- POST /api/auth/login (get JWT token)
- GET /api/auth/me (get current user)
- POST /api/auth/password-reset (stub)

**`backend/src/routes/goals.ts`**
- GET /api/goals (list user's goals)
- POST /api/goals (create goal)
- GET /api/goals/:id (goal details + timeline)
- GET /api/goals/:id/days/:date (tasks for day)
- POST /api/goals/:id/generate-timeline
- POST /api/goals/:id/tasks (create task)
- DELETE /api/goals/:id

**`backend/src/routes/tasks.ts`**
- PATCH /api/tasks/:id (update task, toggle complete)
- DELETE /api/tasks/:id

**`backend/src/routes/templates.ts`**
- GET /api/templates (all templates)
- GET /api/templates/:name (specific template)

**`backend/src/services/timeline.ts`**
- `generateTimeline()`: Create day array from date range
- `shouldTaskAppearOnDate()`: Check if recurring task applies
- `expandRecurringTasks()`: Map tasks to dates
- `calculateProgress()`: Compute completion percentage
- `validateGoalDuration()`: Check date validity

**`backend/src/services/notifications.ts`**
- `EmailAdapter` interface
- `ConsoleEmailAdapter`: Dev logging
- `SmtpEmailAdapter`: Production stub
- `NotificationService`: Email sending

**`backend/src/middleware/auth.ts`**
- `authMiddleware`: JWT validation
- `generateToken()`: Create JWT

**`backend/prisma/schema.prisma`**
- User model (email, password, goals)
- Goal model (dates, template, tasks)
- Task model (title, notes, completion)
- Template model (predefined task sets)

**`backend/prisma/seed.ts`**
- Creates demo user (prasham@example.com)
- Creates 4-month fitness goal
- Adds recurring and one-off tasks
- Creates two templates

### Frontend Core Files

**`frontend/src/main.tsx`**
- ReactDOM.render()
- App component mount

**`frontend/src/App.tsx`**
- React Router setup
- TanStack Query provider
- Protected route wrapper
- Route definitions

**`frontend/src/pages/DashboardPage.tsx`**
- Goal list display
- Progress bars
- Create goal modal
- Template selection
- Delete confirmation

**`frontend/src/pages/GoalDetailPage.tsx`**
- Goal info header
- Timeline view (horizontal scroll)
- Calendar view placeholder
- Default tasks list

**`frontend/src/pages/DayDetailPage.tsx`**
- Date header
- Default tasks (read-only)
- Specific tasks (editable)
- Add task form
- Task completion toggle
- Delete confirmation

**`frontend/src/components/AppShell.tsx`**
- Header with logo
- User email display
- Logout button
- Main content wrapper

**`frontend/src/components/ProgressBar.tsx`**
- Visual progress indicator
- Percentage display
- Completed/total counts

**`frontend/src/lib/api.ts`**
- Axios instance with interceptors
- Auth token injection
- Error handling (401 redirect)
- Type definitions (User, Goal, Task, Template)
- API functions:
  - authApi (signup, login, getMe, passwordReset)
  - goalsApi (getAll, getById, create, delete, getDayTasks, createTask)
  - tasksApi (update, delete)
  - templatesApi (getAll, getByName)

**`frontend/src/store/auth.ts`**
- Zustand store for auth
- setAuth(): Save user + token to localStorage
- clearAuth(): Remove user + token
- loadAuth(): Restore from localStorage on app load

## 🧪 Test Files

**`backend/src/services/timeline.test.ts`**
- Timeline generation tests (date ranges, task attachment)
- Recurring task pattern tests (daily, day-of-week)
- Progress calculation tests (0%, 50%, 100%)
- Date validation tests (invalid ranges, warnings)

## 📦 Configuration Files

**`package.json` (root)**
- Scripts to run both apps
- Prettier dependency

**`backend/package.json`**
- Express, Prisma, JWT, Zod, date-fns
- Jest for testing
- TypeScript tooling

**`frontend/package.json`**
- React, Vite, React Router
- TanStack Query, Zustand
- Tailwind CSS
- Axios

**`tsconfig.json`**
- TypeScript compiler options
- Strict mode enabled
- Target ES2020

**`tailwind.config.js`**
- Color palette (primary blues)
- Content paths for purging

**`.prettierrc`**
- Single quotes
- 2-space indentation
- 100 char line width

**`vercel.json`**
- Backend serverless function config
- Frontend static build config
- API routing
- Environment variables

## 🗄️ Database Schema

**User Table**
```
id: String (cuid)
email: String (unique)
password: String (bcrypt hash)
name: String?
goals: Goal[] (relation)
tasks: Task[] (relation)
createdAt: DateTime
```

**Goal Table**
```
id: String (cuid)
userId: String (FK → User)
title: String
description: String?
startDate: DateTime
deadline: DateTime
template: String?
defaultTasks: String (JSON)
tasks: Task[] (relation)
createdAt: DateTime
```

**Task Table**
```
id: String (cuid)
goalId: String? (FK → Goal)
userId: String? (FK → User)
date: DateTime?
title: String
notes: String?
isRecurring: Boolean
recurrence: String? ("daily", "mon,wed,fri")
completed: Boolean
createdAt: DateTime
```

**Template Table**
```
id: String (cuid)
name: String (unique)
description: String?
defaultTasks: String (JSON)
category: String?
createdAt: DateTime
```

## 🔗 Data Flow

### Authentication Flow
1. User submits login form → LoginPage.tsx
2. POST /api/auth/login → auth.ts route
3. bcrypt.compare() validates password
4. generateToken() creates JWT
5. Returns { user, token }
6. Frontend stores in localStorage + Zustand
7. Redirects to dashboard

### Goal Creation Flow
1. User fills create modal → DashboardPage.tsx
2. POST /api/goals → goals.ts route
3. Validates with Zod schema
4. Creates Goal in database
5. Returns goal object
6. TanStack Query invalidates cache
7. Dashboard re-fetches and displays new goal

### Task Completion Flow
1. User clicks checkbox → DayDetailPage.tsx
2. PATCH /api/tasks/:id { completed: true }
3. Updates task in database
4. Returns updated task
5. TanStack Query invalidates:
   - Current day query
   - Goal detail query
   - Goals list query
6. All affected views re-fetch and update
7. Progress bars recalculate automatically

---

**Navigate with confidence!** 🗺️
