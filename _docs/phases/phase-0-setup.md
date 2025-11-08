# Phase 0: Setup - Foundation Infrastructure

## Overview
This phase establishes the basic project infrastructure with a minimal but functional setup. The goal is to have a running application with core dependencies configured, basic authentication, and a navigable interface—even if features are not yet implemented.

**Timeline:** Day 1 (6-8 hours)  
**Status:** Foundation  
**Deliverable:** A running Next.js application with authentication and database connectivity

---

## Success Criteria

By the end of this phase, you should be able to:
- ✅ Run the application locally at `http://localhost:3000`
- ✅ Log in with a test user account
- ✅ Navigate to a basic dashboard
- ✅ See the database connection is working
- ✅ View basic UI components (buttons, forms work)

---

## Features & Tasks

### Feature 1: Project Initialization

**Goal:** Set up Next.js 14 project with TypeScript and core dependencies

**Steps:**
1. Initialize Next.js project with TypeScript, Tailwind CSS, and App Router
   ```bash
   pnpm create next-app@latest skyshift --typescript --tailwind --app
   cd skyshift
   ```

2. Install core dependencies (tRPC, Prisma, Zod, React Query)
   ```bash
   pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next
   pnpm add @tanstack/react-query @prisma/client zod
   pnpm add -D prisma
   ```

3. Configure TypeScript with strict mode in `tsconfig.json`
   - Enable `strict: true`
   - Set up path aliases (`@/` pointing to `src/`)
   - Configure for Next.js App Router

4. Set up ESLint and Prettier configurations
   ```bash
   pnpm add -D prettier eslint-config-prettier prettier-plugin-tailwindcss
   ```

5. Create initial project structure according to `project-rules.md`
   - Create `/src/app`, `/src/components`, `/src/server`, `/src/lib`, `/src/types` directories
   - Add `.env.example` file with required environment variables

**Validation:**
- `pnpm dev` starts development server successfully
- TypeScript compiles without errors
- Can access `http://localhost:3000`

---

### Feature 2: Database Configuration

**Goal:** Set up PostgreSQL database with Prisma ORM

**Steps:**
1. Initialize Prisma with PostgreSQL provider
   ```bash
   pnpm prisma init
   ```

2. Create initial Prisma schema with core models
   - User model (id, email, name, password, role, trainingLevel)
   - Session model for NextAuth
   - Account model for OAuth (future use)

3. Create and run initial migration
   ```bash
   pnpm prisma migrate dev --name init
   ```

4. Generate Prisma client and create singleton instance
   - Create `src/lib/db.ts` with Prisma client
   - Implement proper client instantiation for development (prevent multiple instances)

5. Create seed script with test users
   - Add `prisma/seed.ts` with sample student, instructor, and admin users
   - Run seed: `pnpm prisma db seed`

**Validation:**
- Database migrations run successfully
- Prisma Studio opens: `pnpm prisma studio`
- Can view seeded users in database
- Import `db` from `@/lib/db` works in code

---

### Feature 3: Authentication Setup

**Goal:** Implement basic authentication with NextAuth.js

**Steps:**
1. Install NextAuth.js and dependencies
   ```bash
   pnpm add next-auth@beta @auth/prisma-adapter bcryptjs
   pnpm add -D @types/bcryptjs
   ```

2. Create NextAuth configuration in `src/lib/auth.ts`
   - Configure credentials provider (email/password)
   - Set up Prisma adapter
   - Configure session strategy (database sessions)

3. Create NextAuth API route handler
   - Create `src/app/api/auth/[...nextauth]/route.ts`
   - Export GET and POST handlers

4. Create authentication type definitions
   - Augment NextAuth types in `src/types/next-auth.d.ts`
   - Add role and trainingLevel to session

5. Create basic login page
   - Create `src/app/(auth)/login/page.tsx`
   - Simple form with email and password fields
   - Use server action for login

**Validation:**
- Can navigate to `/login` page
- Can log in with seeded user credentials
- Session persists after login
- Can access user data from session

---

### Feature 4: UI Component Foundation

**Goal:** Set up shadcn/ui components and Tailwind configuration

**Steps:**
1. Initialize shadcn/ui
   ```bash
   pnpm dlx shadcn-ui@latest init
   ```

2. Install essential UI components
   ```bash
   pnpm dlx shadcn-ui@latest add button card input label select dialog toast
   ```

3. Configure Tailwind with custom theme colors
   - Update `tailwind.config.ts` with brand colors
   - Set up CSS variables in `src/app/globals.css`
   - Configure font family (if using custom fonts)

4. Create common layout components
   - Create `src/components/common/loading-spinner.tsx`
   - Create `src/components/common/empty-state.tsx`
   - Create `src/components/common/error-message.tsx`

5. Test component rendering
   - Create a test page using all base components
   - Verify Tailwind classes apply correctly
   - Check responsive behavior

**Validation:**
- shadcn/ui components render correctly
- Tailwind styles apply as expected
- Components are accessible (keyboard navigation works)
- Dark mode variables are set up (even if not implemented)

---

### Feature 5: tRPC Configuration

**Goal:** Set up tRPC for type-safe API communication

**Steps:**
1. Create tRPC initialization files
   - Create `src/server/trpc.ts` with router and procedure builders
   - Create `src/server/context.ts` for creating request context
   - Add authentication middleware

2. Create root router
   - Create `src/server/routers/index.ts`
   - Set up router merging structure
   - Create placeholder health check procedure

3. Set up tRPC API route handler
   - Create `src/app/api/trpc/[trpc]/route.ts`
   - Configure CORS and request handling

4. Create client-side tRPC setup
   - Create `src/lib/trpc.ts` with React Query integration
   - Create tRPC provider component
   - Wrap app with providers in root layout

5. Test tRPC connection
   - Create simple test procedure (e.g., `hello` query)
   - Call from client component
   - Verify type safety works

**Validation:**
- tRPC procedures can be called from client
- TypeScript autocomplete works for procedures
- Authentication middleware blocks unauthorized requests
- Error handling works (try/catch)

---

### Feature 6: Basic Dashboard Layout

**Goal:** Create minimal dashboard shell with navigation

**Steps:**
1. Create protected route group
   - Create `src/app/(dashboard)/layout.tsx`
   - Add middleware to check authentication
   - Redirect to login if not authenticated

2. Build dashboard header component
   - Create `src/components/dashboard/dashboard-header.tsx`
   - Include logo, user menu, logout button
   - Show user name and role from session

3. Create dashboard navigation
   - Create `src/components/dashboard/dashboard-nav.tsx`
   - Add navigation links (Flights, Analytics, Profile)
   - Highlight active route

4. Build dashboard home page
   - Create `src/app/(dashboard)/page.tsx`
   - Simple welcome message with user's name
   - Placeholder for upcoming features

5. Add loading and error states
   - Create `src/app/(dashboard)/loading.tsx`
   - Create `src/app/(dashboard)/error.tsx`
   - Test by simulating errors

**Validation:**
- Can access dashboard after login
- Navigation links are visible and clickable
- Logout button works (redirects to login)
- Loading states show during navigation
- Error boundary catches errors

---

### Feature 7: Environment Configuration

**Goal:** Set up environment variables and configuration management

**Steps:**
1. Create comprehensive `.env.example` file
   - Database URL (PostgreSQL)
   - NextAuth configuration (SECRET, URL)
   - API keys placeholders (OpenAI, Weather, Email)
   - AWS configuration placeholders

2. Create `.env.local` from template
   - Copy `.env.example` to `.env.local`
   - Add actual development credentials
   - Add to `.gitignore`

3. Create environment variable validation
   - Create `src/lib/env.ts`
   - Use Zod to validate required env vars at startup
   - Throw helpful errors if missing

4. Document environment setup in README
   - Add "Getting Started" section
   - List all required environment variables
   - Include setup instructions

5. Test environment validation
   - Remove a required env var
   - Verify application fails with clear message
   - Restore and verify application starts

**Validation:**
- `.env.example` contains all required variables
- Application fails gracefully with missing env vars
- Development environment runs with valid configuration
- README has clear setup instructions

---

## Phase 0 Checklist

Before moving to Phase 1, verify:

- [ ] Next.js application runs without errors
- [ ] PostgreSQL database is connected and seeded
- [ ] Can log in with test user (email/password)
- [ ] Dashboard is accessible after authentication
- [ ] tRPC procedures can be called from client
- [ ] UI components render correctly (buttons, forms, cards)
- [ ] TypeScript strict mode is enabled with no errors
- [ ] ESLint and Prettier are configured
- [ ] Project structure follows `project-rules.md`
- [ ] `.env.example` is complete and documented
- [ ] Git repository is initialized with proper `.gitignore`

---

## Deliverables

1. **Running Application**
   - Next.js dev server on port 3000
   - PostgreSQL database with seeded data
   - Basic authentication working

2. **Code Structure**
   - Project organized per `project-rules.md`
   - All configuration files in place
   - Type-safe API with tRPC

3. **Documentation**
   - README with setup instructions
   - `.env.example` with all variables
   - Comments in configuration files

4. **Version Control**
   - Git repository initialized
   - Initial commit with setup complete
   - `.gitignore` configured

---

## Common Issues & Solutions

### Issue: Prisma Client Not Found
**Solution:** Run `pnpm prisma generate` after schema changes

### Issue: NextAuth Session Not Working
**Solution:** 
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches localhost URL
- Clear browser cookies and try again

### Issue: tRPC Type Errors
**Solution:**
- Restart TypeScript server in VS Code
- Run `pnpm dev` to regenerate types
- Check tRPC setup in `src/lib/trpc.ts`

### Issue: Database Connection Failed
**Solution:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Test connection with `pnpm prisma studio`

### Issue: Tailwind Styles Not Applying
**Solution:**
- Check `content` paths in `tailwind.config.ts`
- Verify `globals.css` is imported in root layout
- Clear Next.js cache: `rm -rf .next`

---

## Next Steps

Once Phase 0 is complete, proceed to **Phase 1: MVP - Core Features** which will implement:
- Flight booking system
- Weather API integration
- AI-powered rescheduling
- Email notifications
- Weather conflict detection

**Estimated Time for Phase 1:** Days 2-3 (12-16 hours)

---

**Phase 0 Complete!** 🎉

You now have a solid foundation to build upon. The application is running, authentication works, and the infrastructure is in place for rapid feature development.

