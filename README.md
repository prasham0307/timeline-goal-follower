# Timeline Goal Follower

A comprehensive web application for tracking time-bounded goals with automated daily timelines, task management, and progress tracking.

## 🎯 Overview

Timeline Goal Follower helps users create goals with specific start dates and deadlines. The backend automatically generates a timeline of days between these dates, each containing a configurable checklist of tasks. Users can track daily progress, manage recurring and one-off tasks, and visualize their journey through calendar and timeline views.

## ✨ Features

- **Time-Bounded Goals**: Create goals with start dates and deadlines (e.g., 4-month fitness plan)
- **Automated Timeline Generation**: Backend generates all days between start and deadline
- **Flexible Task Management**:
  - Default daily tasks from templates
  - Recurring tasks (daily or specific days of week)
  - One-off tasks for specific dates
  - Mark tasks complete and track progress
- **Multiple Views**:
  - Goal list with progress indicators
  - Timeline view (horizontal day scroller)
  - Calendar view (coming soon)
  - Daily detailed view with task checklist
- **Goal Templates**: Pre-configured templates (Fitness, Language Learning, etc.)
- **Progress Tracking**: Real-time progress calculation per goal and per day
- **User Authentication**: Email/password authentication with JWT tokens
- **Email Reminders**: Extensible notification system (currently console-stubbed)

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- TanStack Query (data fetching)
- Zustand (state management)
- Axios (HTTP client)

**Backend:**
- Node.js + TypeScript
- Express (REST API)
- Prisma (ORM)
- PostgreSQL (production) / SQLite (development)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- Zod (validation)
- date-fns (date utilities)

**Testing:**
- Jest (backend unit tests)
- Vitest (frontend tests)
- React Testing Library

**Deployment:**
- Vercel (frontend + serverless backend)
- Supabase/Neon (hosted PostgreSQL)

## 📁 Project Structure

```
timeline-goal-follower/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Seed data
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts            # Authentication endpoints
│   │   │   ├── goals.ts           # Goal management
│   │   │   ├── tasks.ts           # Task management
│   │   │   └── templates.ts       # Template endpoints
│   │   ├── services/
│   │   │   ├── timeline.ts        # Timeline generation logic
│   │   │   ├── timeline.test.ts   # Unit tests
│   │   │   └── notifications.ts   # Email adapter
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT middleware
│   │   ├── validators/
│   │   │   └── schemas.ts         # Zod validation schemas
│   │   ├── db.ts                  # Prisma client
│   │   └── index.ts               # Express app
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell.tsx       # Layout wrapper
│   │   │   └── ProgressBar.tsx    # Progress indicator
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx      # Login form
│   │   │   ├── SignupPage.tsx     # Signup form
│   │   │   ├── DashboardPage.tsx  # Goal list
│   │   │   ├── GoalDetailPage.tsx # Goal timeline view
│   │   │   └── DayDetailPage.tsx  # Daily task view
│   │   ├── lib/
│   │   │   └── api.ts             # API client
│   │   ├── store/
│   │   │   └── auth.ts            # Auth state
│   │   ├── App.tsx                # Router setup
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── .gitignore
├── .prettierrc
├── package.json
├── vercel.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Development Setup

#### 1. Clone and Install

```powershell
# Clone the repository
cd d:\BITS\tp

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

#### 2. Backend Setup

```powershell
cd backend

# Copy environment file
Copy-Item .env.example .env

# Edit .env if needed (default SQLite settings work fine)

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed
```

This creates:
- A user: `prasham@example.com` / `changeme`
- A 4-month fitness goal (June 1 - Sept 30, 2025)
- Sample recurring and one-off tasks
- Two templates: "Fitness 4-Month Plan" and "Language Learning 90 Days"

#### 3. Frontend Setup

```powershell
cd ../frontend

# Copy environment file
Copy-Item .env.example .env

# Default settings should work (proxies to localhost:3001)
```

#### 4. Run the Application

From the project root:

```powershell
# Run both frontend and backend concurrently
npm run dev
```

Or run them separately:

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

**Login with demo credentials:**
- Email: `prasham@example.com`
- Password: `changeme`

## 🧪 Testing

### Backend Tests

```powershell
cd backend

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

Tests cover:
- Timeline generation (date ranges, task attachment)
- Recurring task expansion (daily, day-of-week patterns)
- Progress calculation
- Goal duration validation

### Frontend Tests

```powershell
cd frontend

# Run tests
npm test

# Run tests with UI
npm run test:ui
```

## 📡 API Documentation

### Authentication

**POST /api/auth/signup**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**GET /api/auth/me**
- Requires: `Authorization: Bearer <token>`

**POST /api/auth/password-reset**
```json
{
  "email": "user@example.com"
}
```

### Goals

**GET /api/goals**
- Returns all user's goals with progress

**POST /api/goals**
```json
{
  "title": "4-Month Fitness Plan",
  "description": "Get in shape",
  "startDate": "2025-06-01T00:00:00Z",
  "deadline": "2025-09-30T00:00:00Z",
  "template": "Fitness 4-Month Plan",
  "defaultTasks": [
    {
      "title": "Morning cardio 30min",
      "isRecurring": true,
      "recurrence": "daily"
    }
  ]
}
```

**GET /api/goals/:goalId**
- Returns goal with timeline preview, progress, and task breakdown

**GET /api/goals/:goalId/days/:date**
- Example: `/api/goals/abc123/days/2025-06-15`
- Returns default tasks and specific tasks for that date

**POST /api/goals/:goalId/generate-timeline**
- Regenerates full timeline (idempotent)

**POST /api/goals/:goalId/tasks**
```json
{
  "title": "Gym: Leg day",
  "notes": "Focus on squats",
  "date": "2025-06-10T00:00:00Z",
  "isRecurring": false
}
```

**DELETE /api/goals/:goalId**

### Tasks

**PATCH /api/tasks/:taskId**
```json
{
  "completed": true,
  "notes": "Updated notes"
}
```

**DELETE /api/tasks/:taskId**

### Templates

**GET /api/templates**
- Returns all available templates

**GET /api/templates/:name**
- Returns specific template with default tasks

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  goals     Goal[]
  tasks     Task[]
  createdAt DateTime @default(now())
}

model Goal {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(...)
  title        String
  description  String?
  startDate    DateTime
  deadline     DateTime
  template     String?
  defaultTasks String   // JSON array
  tasks        Task[]
  createdAt    DateTime @default(now())
}

model Task {
  id          String    @id @default(cuid())
  goalId      String?
  goal        Goal?     @relation(...)
  userId      String?
  user        User?     @relation(...)
  date        DateTime?
  title       String
  notes       String?
  isRecurring Boolean   @default(false)
  recurrence  String?   // "daily", "mon,wed,fri", etc.
  completed   Boolean   @default(false)
  createdAt   DateTime  @default(now())
}

model Template {
  id           String   @id @default(cuid())
  name         String   @unique
  description  String?
  defaultTasks String   // JSON array
  category     String?
  createdAt    DateTime @default(now())
}
```

## 🚢 Deployment

### Vercel Deployment (Recommended)

#### Prerequisites
1. Vercel account
2. Hosted PostgreSQL (Supabase, Neon, Railway, etc.)

#### Steps

1. **Set up hosted PostgreSQL:**
   - Sign up for Supabase (free tier) or Neon
   - Create a new database
   - Copy the connection string (e.g., `postgresql://user:pass@host:5432/dbname`)

2. **Push to GitHub:**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Deploy to Vercel:**
   - Go to https://vercel.com and import your repository
   - Configure build settings:
     - Framework Preset: Other
     - Build Command: `npm run build`
     - Output Directory: `frontend/dist`
     - Install Command: `npm install`

4. **Set environment variables in Vercel:**
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   JWT_SECRET=your-production-secret-key-here
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. **Run migrations on production DB:**
   ```powershell
   # Set DATABASE_URL locally to production DB
   $env:DATABASE_URL="postgresql://user:pass@host:5432/dbname"
   cd backend
   npm run prisma:migrate
   npm run prisma:seed  # Optional: seed production data
   ```

6. **Deploy:**
   - Vercel will auto-deploy on git push
   - Frontend: Served as static files
   - Backend: Runs as Vercel Serverless Functions

### Alternative: Manual Docker Deployment

A Dockerfile can be added if needed. The current setup is optimized for Vercel's serverless architecture.

## 📧 Email Notifications

The app includes an extensible email notification system:

**Current Implementation:**
- `ConsoleEmailAdapter`: Logs emails to console (development)
- `SmtpEmailAdapter`: Stub for production email sending

**To enable real emails:**

1. Install nodemailer:
   ```powershell
   cd backend
   npm install nodemailer @types/nodemailer
   ```

2. Update `backend/src/services/notifications.ts` SmtpEmailAdapter with nodemailer implementation

3. Set environment variables:
   ```
   EMAIL_ADAPTER=smtp
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

4. Use NotificationService:
   ```typescript
   import { NotificationService } from './services/notifications';
   
   const notificationService = new NotificationService();
   await notificationService.sendTaskReminder(
     'user@example.com',
     'Morning cardio 30min',
     '2025-06-15'
   );
   ```

## 🎨 UI Components

### Mobile-First Design
All components are responsive and work on mobile devices.

### Key Components:
- **AppShell**: Header with user menu and logout
- **ProgressBar**: Visual progress indicator
- **GoalList**: Card-based goal overview
- **TimelineView**: Horizontal scrollable day cards
- **DayDetail**: Full task checklist with completion toggle
- **Modals**: Goal creation, task editing

### Tailwind CSS Classes:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.input`
- `.card`

## 🧩 Business Logic

### Timeline Generation
```typescript
function generateTimeline(
  startIso: string,
  endIso: string,
  defaultTasks: DefaultTask[]
): Day[]
```
- Generates inclusive array of days
- Attaches default tasks to each day
- Validates date ranges

### Recurring Tasks
```typescript
function shouldTaskAppearOnDate(
  task: { isRecurring: boolean; recurrence?: string; date?: Date },
  targetDate: Date
): boolean
```
Supports:
- `daily`: Every day
- `mon,wed,fri`: Specific days of week
- One-off: Specific date only

### Progress Calculation
```typescript
function calculateProgress(tasks: Task[]): {
  percentage: number;
  completed: number;
  total: number;
}
```

## ⚠️ Known Limitations & Future Improvements

### Current Limitations:
1. Calendar view is placeholder (timeline view works)
2. Email sending is stubbed (console logging only)
3. No task notes editing in UI
4. No batch task operations
5. No goal sharing/collaboration
6. No mobile app (web only)
7. No offline support

### Suggested Improvements:

**High Priority:**
- [ ] Implement full calendar view with month navigation
- [ ] Add real email sending via SendGrid/SMTP
- [ ] Add task filtering and search
- [ ] Implement notifications/reminders scheduling
- [ ] Add goal progress charts and analytics
- [ ] Export goal data (PDF, CSV)

**Medium Priority:**
- [ ] Recurring task editing after creation
- [ ] Bulk task operations (mark all complete, delete multiple)
- [ ] Goal templates marketplace/sharing
- [ ] User profile management
- [ ] Password reset email flow
- [ ] Social sharing of achievements

**Nice to Have:**
- [ ] Dark mode
- [ ] Goal categories and tags
- [ ] Sub-goals and milestones
- [ ] Collaborative goals (teams)
- [ ] Mobile app (React Native)
- [ ] Gamification (streaks, badges)
- [ ] AI-powered task suggestions
- [ ] Voice input for tasks

### Performance Considerations:
- **Large goals (>365 days)**: Timeline generation may be slow. Consider pagination.
- **Many tasks**: Database queries could be optimized with proper indexing.
- **Real-time updates**: Consider WebSocket for multi-device sync.
- **Caching**: Add Redis for frequently accessed goals/templates.

## 🐛 Troubleshooting

### Database Issues

**"Can't reach database server"**
```powershell
# Reset database
cd backend
npm run db:reset
```

**"Prisma Client not generated"**
```powershell
cd backend
npm run prisma:generate
```

### Port Conflicts

**Backend port 3001 in use:**
```powershell
# Change PORT in backend/.env
PORT=3002
```

**Frontend port 5173 in use:**
```powershell
# Edit frontend/vite.config.ts
server: { port: 5174 }
```

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that backend is running before frontend

### Authentication Issues
- Clear localStorage: `localStorage.clear()` in browser console
- Check JWT_SECRET is set in backend `.env`
- Verify token is being sent in Authorization header

## 📝 Scripts Reference

### Root
- `npm run dev` - Run both frontend and backend
- `npm run build` - Build both apps
- `npm test` - Run all tests
- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier

### Backend
- `npm run dev` - Start dev server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production build
- `npm test` - Run tests with coverage
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:seed` - Seed database
- `npm run prisma:studio` - Open Prisma Studio GUI
- `npm run db:reset` - Reset database

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code

## 📄 License

MIT

## 👤 Author

Prasham

---

**Happy goal tracking! 🎯**
