# Installation & Verification Checklist

## ✅ Step-by-Step Setup Verification

### 1. Prerequisites Check
- [ ] Node.js 18+ installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] Git installed (optional): `git --version`
- [ ] Terminal/PowerShell access

### 2. Project Setup

#### Option A: Automated Setup (Recommended)
```powershell
# Run the setup script
.\setup.ps1
```

#### Option B: Manual Setup
```powershell
# Root dependencies
npm install

# Backend setup
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
cd ..

# Frontend setup
cd frontend
npm install
cd ..
```

### 3. Verification Steps

#### Backend Health Check
```powershell
# Terminal 1: Start backend
cd backend
npm run dev

# Wait for "🚀 Server running on http://localhost:3001"
# Then test health endpoint
```
- [ ] Navigate to http://localhost:3001/health
- [ ] Should see: `{"status":"ok","timestamp":"..."}`

#### Database Verification
```powershell
# In backend directory
npm run prisma:studio
```
- [ ] Prisma Studio opens at http://localhost:5555
- [ ] Can see User, Goal, Task, Template tables
- [ ] User table has prasham@example.com
- [ ] Goal table has "4-Month Fitness Transformation"
- [ ] Task table has sample tasks

#### Frontend Health Check
```powershell
# Terminal 2: Start frontend
cd frontend
npm run dev

# Wait for "Local: http://localhost:5173"
```
- [ ] Navigate to http://localhost:5173
- [ ] Login page displays correctly
- [ ] No console errors in browser DevTools

### 4. Feature Verification

#### Authentication Flow
- [ ] Navigate to http://localhost:5173
- [ ] See login form
- [ ] Click "Sign up" link
- [ ] Signup form displays
- [ ] Go back to login
- [ ] Enter: prasham@example.com / changeme
- [ ] Click "Sign in"
- [ ] Redirects to dashboard

#### Dashboard
- [ ] See "4-Month Fitness Transformation" goal card
- [ ] Progress bar shows some progress (0-100%)
- [ ] Can see start date (Jun 01, 2025)
- [ ] Can see deadline (Sep 30, 2025)
- [ ] "View Details" button present
- [ ] "Delete" button present

#### Goal Detail View
- [ ] Click "View Details" on the goal
- [ ] See goal title and description
- [ ] See start date, deadline, total days (122)
- [ ] Progress bar displays
- [ ] Timeline view shows day cards
- [ ] Can scroll horizontally through days
- [ ] First 30 days are visible

#### Day Detail View
- [ ] Click on a day card (e.g., Jun 01)
- [ ] See date header (Sunday, June 01, 2025)
- [ ] See "Default Daily Tasks" section with 4 tasks
- [ ] See "Tasks for This Day" section
- [ ] See "Add Task" button
- [ ] Progress bar shows day-specific progress

#### Task Management
- [ ] Click "Add Task" button
- [ ] Input appears
- [ ] Type "Test task" and click "Add"
- [ ] Task appears in list
- [ ] Click checkbox next to task
- [ ] Task gets checkmark
- [ ] Progress bar updates
- [ ] Click "Delete" on task
- [ ] Confirm deletion
- [ ] Task disappears

#### Goal Creation
- [ ] Go back to dashboard
- [ ] Click "+ New Goal" button
- [ ] Modal opens
- [ ] Fill in:
  - Title: "Test Goal"
  - Start Date: Tomorrow
  - Deadline: One month from now
  - Template: Select "Language Learning 90 Days"
- [ ] Click "Create Goal"
- [ ] Modal closes
- [ ] New goal appears in list

#### Navigation
- [ ] Click logo to go to dashboard
- [ ] Click on a goal
- [ ] Click "Back to Goals" link
- [ ] Returns to dashboard
- [ ] User menu shows email
- [ ] Click "Logout"
- [ ] Redirects to login page

### 5. API Testing (Optional)

#### Using curl or Postman
```powershell
# Health check
curl http://localhost:3001/health

# Login (get token)
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"prasham@example.com","password":"changeme"}'

# Get goals (replace YOUR_TOKEN)
curl http://localhost:3001/api/goals `
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Health endpoint returns 200 OK
- [ ] Login returns token and user object
- [ ] Goals endpoint returns array of goals

### 6. Development Workflow

#### Hot Reload Testing
```powershell
# Backend hot reload
# 1. With backend running, edit backend/src/index.ts
# 2. Add a console.log('Hello')
# 3. Check terminal - should see restart message
# 4. Verify change reflected
```
- [ ] Backend restarts on file change

```powershell
# Frontend hot reload
# 1. With frontend running, edit frontend/src/App.tsx
# 2. Change something in JSX
# 3. Browser should auto-refresh
# 4. Verify change visible
```
- [ ] Frontend hot reloads in browser

#### Running Tests
```powershell
# Backend tests
cd backend
npm test

# Should see all tests passing:
# ✓ Timeline generation
# ✓ Recurring tasks
# ✓ Progress calculation
# ✓ Date validation
```
- [ ] All backend tests pass
- [ ] Coverage report shows >70%

### 7. Error Handling Verification

#### Invalid Login
- [ ] Try to login with wrong password
- [ ] See error message: "Invalid credentials"

#### Protected Routes
- [ ] Logout
- [ ] Try to navigate to http://localhost:5173/goals/abc123
- [ ] Redirects to login page

#### Network Error
- [ ] Stop backend server
- [ ] Try to create a goal in frontend
- [ ] Should see network error
- [ ] Restart backend
- [ ] Should recover

### 8. Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Mobile browser (Chrome/Safari)

### 9. Responsive Design

- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] All layouts look correct
- [ ] No horizontal scrolling
- [ ] Buttons are tappable

### 10. Performance Check

#### Lighthouse Audit
- [ ] Open Chrome DevTools
- [ ] Go to Lighthouse tab
- [ ] Run audit on http://localhost:5173
- [ ] Performance: >80
- [ ] Accessibility: >90
- [ ] Best Practices: >80

#### Network Tab
- [ ] Open Network tab
- [ ] Reload page
- [ ] All requests complete successfully
- [ ] No 404 or 500 errors
- [ ] Page loads in <2 seconds

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'express'"
**Solution:** Run `npm install` in backend directory

### Issue: "Prisma Client not generated"
**Solution:** Run `npm run prisma:generate` in backend directory

### Issue: Port 3001 already in use
**Solution:** 
- Change PORT in `backend/.env` to 3002
- Update VITE_API_URL in `frontend/.env` to http://localhost:3002

### Issue: CORS errors
**Solution:**
- Ensure FRONTEND_URL in backend/.env matches frontend URL
- Restart backend server

### Issue: Login doesn't work after signup
**Solution:**
- Check browser console for errors
- Verify JWT_SECRET is set in backend/.env
- Clear localStorage: `localStorage.clear()`

### Issue: Database is locked
**Solution:**
- Close Prisma Studio
- Run `npm run db:reset` in backend directory

### Issue: React errors in console
**Solution:**
- Ensure all dependencies installed: `npm install` in frontend
- Clear cache: Delete `frontend/node_modules/.vite`
- Restart dev server

## ✅ Final Verification

All checkboxes completed? Congratulations! Your Timeline Goal Follower is fully set up and working.

**Next Steps:**
1. Read QUICKSTART.md for usage tips
2. Check API.md for endpoint documentation
3. Review TODO.md for future enhancements
4. Start building your goals!

**Need Help?**
- Check DEVELOPMENT.md for debugging tips
- Review error messages carefully
- Ensure all dependencies are installed
- Verify environment variables are set

---

**Happy goal tracking! 🎯**
