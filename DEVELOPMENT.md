# Development Notes

## Project Decisions & Rationale

### Why Express over Fastify?
- Better Vercel serverless support
- Larger ecosystem
- Simpler for this use case
- Easy to migrate to Fastify later if needed

### Why Prisma?
- Type-safe database access
- Excellent TypeScript integration
- Easy migrations
- Works with both SQLite and PostgreSQL

### Why SQLite for local dev?
- Zero setup required
- No external dependencies
- Fast for development
- Easy to reset/seed

### Why Zustand over Redux?
- Simpler API
- Less boilerplate
- Better TypeScript support
- Perfect for small to medium apps

### Why TanStack Query?
- Industry standard for data fetching
- Automatic caching and invalidation
- Optimistic updates
- Great DevTools

## Code Organization

### Backend Structure
- **routes/**: Express route handlers (thin controllers)
- **services/**: Business logic (testable, reusable)
- **middleware/**: Auth, validation, error handling
- **validators/**: Zod schemas for request validation

### Frontend Structure
- **pages/**: Route-level components
- **components/**: Reusable UI components
- **lib/**: Utilities and API client
- **store/**: Global state management

## Testing Strategy

### What's Tested
- ✅ Timeline generation logic
- ✅ Recurring task expansion
- ✅ Progress calculation
- ✅ Date validation

### What Should Be Added
- [ ] API endpoint integration tests
- [ ] Auth middleware tests
- [ ] Frontend component tests
- [ ] E2E tests with Playwright/Cypress

## Performance Optimization Opportunities

### Backend
1. **Database Indexing**: Already added indexes on userId, goalId, date
2. **Query Optimization**: Use `select` to fetch only needed fields
3. **Caching**: Add Redis for frequently accessed goals/templates
4. **Pagination**: Implement for goals and tasks lists
5. **N+1 Queries**: Use Prisma's `include` wisely

### Frontend
1. **Code Splitting**: Lazy load routes
2. **Image Optimization**: Use next/image equivalent
3. **Bundle Size**: Analyze with `vite-bundle-visualizer`
4. **Memoization**: Use `useMemo` for expensive calculations
5. **Virtual Scrolling**: For long timelines/task lists

## Security Considerations

### Implemented
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Input validation (Zod)
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma)

### TODO
- [ ] Rate limiting (express-rate-limit)
- [ ] Helmet.js for security headers
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] Audit logging

## Scalability Considerations

### Current Limitations
- Single server (Vercel serverless handles this)
- In-memory session (JWT is stateless, good!)
- No caching layer
- No queue for background jobs

### For Scale
1. **Caching**: Redis for goals, templates, user sessions
2. **Queue**: BullMQ for email reminders, heavy computations
3. **CDN**: Cloudflare for static assets
4. **Database**: Read replicas for heavy read load
5. **Monitoring**: Sentry for error tracking, Datadog for APM

## Deployment Checklist

### Pre-deployment
- [ ] Set strong JWT_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Enable HTTPS only
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Test all API endpoints
- [ ] Run lighthouse audit
- [ ] Security audit

### Post-deployment
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Verify email sending (when implemented)
- [ ] Test payment flow (if added)
- [ ] Smoke test all features

## Known Issues & Workarounds

### TypeScript Errors
The project has some TypeScript compilation errors in route handlers due to Express typing quirks. These don't affect runtime but should be cleaned up:

```typescript
// Current
router.post('/login', async (req, res: Response) => { ... })

// Better
router.post('/login', async (req: Request, res: Response) => { ... })
```

### Prisma JSON Fields
Using `String` type with JSON.stringify/parse. Consider using Prisma's native JSON type for PostgreSQL:

```prisma
model Goal {
  defaultTasks Json  // instead of String
}
```

### Date Handling
Dates are stored as ISO strings. Consider using Prisma's DateTime type more consistently and handling timezone conversions at the API boundary.

## Future Features Roadmap

### Phase 1 (MVP+)
- [ ] Calendar view implementation
- [ ] Real email notifications
- [ ] Task notes editing in UI
- [ ] Goal progress charts

### Phase 2
- [ ] Goal templates marketplace
- [ ] Social features (share goals)
- [ ] Mobile app (React Native)
- [ ] Gamification (streaks, badges)

### Phase 3
- [ ] Team collaboration
- [ ] AI task suggestions
- [ ] Integration with calendars (Google, Outlook)
- [ ] Voice commands

## Useful Commands

### Database
```powershell
# Reset database
npm run db:reset

# View database
npm run prisma:studio

# Create migration
npx prisma migrate dev --name migration_name

# Push schema without migration
npx prisma db push
```

### Debugging
```powershell
# Backend debug mode
$env:DEBUG="*"; npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Prisma debug
$env:DEBUG="prisma:*"; npm run dev
```

### Testing
```powershell
# Run specific test
npm test -- timeline.test.ts

# Update snapshots
npm test -- -u

# Coverage report
npm test -- --coverage --coverageReporters=html
```

## Contributing Guidelines

1. Follow existing code style
2. Write tests for business logic
3. Update API.md for endpoint changes
4. Add JSDoc comments for complex functions
5. Use conventional commits (feat:, fix:, docs:, etc.)

## Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
