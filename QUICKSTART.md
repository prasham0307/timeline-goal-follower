# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies

```powershell
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

### Step 2: Set Up Backend

```powershell
cd backend

# Copy environment file
Copy-Item .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed with sample data
npm run prisma:seed

cd ..
```

### Step 3: Set Up Frontend

```powershell
cd frontend

# Copy environment file
Copy-Item .env.example .env

cd ..
```

### Step 4: Start the App

```powershell
# From project root - runs both frontend and backend
npm run dev
```

**That's it!** 🎉

### Step 5: Login

1. Open http://localhost:5173
2. Login with demo credentials:
   - **Email:** prasham@example.com
   - **Password:** changeme

### What You'll See

1. **Dashboard**: A 4-month fitness goal with progress bar
2. **Goal Detail**: Click the goal to see timeline view
3. **Day View**: Click any day to see daily tasks
4. **Add Tasks**: Add custom tasks for specific days
5. **Track Progress**: Check off tasks and watch progress update

### Next Steps

- Create your own goal
- Try different templates
- Explore the timeline view
- Add recurring tasks

### Troubleshooting

**Port conflicts?**
```powershell
# Change backend port
# Edit backend/.env: PORT=3002

# Change frontend port
# Edit frontend/vite.config.ts: server: { port: 5174 }
```

**Database issues?**
```powershell
cd backend
npm run db:reset  # Resets and re-seeds database
```

**Still stuck?**
- Check that Node.js 18+ is installed: `node --version`
- Make sure both terminals are running
- Clear browser localStorage if auth isn't working

---

## Development Workflow

### Making Changes

**Backend changes:**
- Edit files in `backend/src/`
- Server auto-restarts (tsx watch)
- Check http://localhost:3001/health

**Frontend changes:**
- Edit files in `frontend/src/`
- Browser auto-refreshes (Vite HMR)

### Testing

```powershell
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management

```powershell
cd backend

# View database visually
npm run prisma:studio

# Reset database
npm run db:reset

# Create new migration
npx prisma migrate dev --name add_new_field
```

### Useful URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health
- Prisma Studio: http://localhost:5555 (after `npm run prisma:studio`)

---

## Common Tasks

### Add a New API Endpoint

1. Create handler in `backend/src/routes/`
2. Add validation schema in `backend/src/validators/schemas.ts`
3. Add API client method in `frontend/src/lib/api.ts`
4. Use in component with TanStack Query

### Add a New Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link

### Modify Database Schema

1. Edit `backend/prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Update TypeScript types if needed
4. Re-run seed if needed: `npm run prisma:seed`

---

## Demo Scenarios

### Scenario 1: Create a Language Learning Goal
1. Click "New Goal"
2. Select "Language Learning 90 Days" template
3. Set dates
4. View auto-generated daily tasks

### Scenario 2: Track Daily Progress
1. Navigate to a specific day
2. Add custom tasks
3. Check off completed tasks
4. See progress bar update

### Scenario 3: Recurring Tasks
1. Create a task with "daily" recurrence
2. Or use "mon,wed,fri" for specific days
3. Task appears automatically on those days

---

**Happy coding! 🎯**
