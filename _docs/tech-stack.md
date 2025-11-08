# SkyShift Tech Stack - Complete Reference

## Overview
This document defines the complete technology stack for the **Weather Cancellation & AI Rescheduling** project, including comprehensive best practices, limitations, conventions, and common pitfalls for each technology. All selections prioritize rapid development within the 3-5 day timeline while maintaining production-quality standards.

**Last Updated:** November 8, 2025

---

## Table of Contents
1. [Frontend Stack](#frontend-stack)
2. [Backend Stack](#backend-stack)
3. [Database & ORM](#database--orm)
4. [AI & LLM](#ai--llm)
5. [External APIs](#external-apis)
6. [Authentication](#authentication)
7. [Communication Services](#communication-services)
8. [AWS Infrastructure](#aws-infrastructure)
9. [Development Tools](#development-tools)
10. [Testing Strategy](#testing-strategy)

---

# Frontend Stack

## Next.js 14 (App Router)

### Overview
- **Version:** 14.x
- **Rationale:** Unified frontend/backend framework with Server Components, built-in routing, and production optimizations

### Best Practices

#### Server vs Client Components
- **Use Server Components by default:** Fetch data on the server, render on the server
- **Add `'use client'` only when needed:** For interactivity, hooks, browser APIs, event handlers
- **Component composition:** Pass Server Components as children to Client Components
- **Data fetching:** Fetch at component level, not in `useEffect`
- **Loading states:** Use `loading.tsx` for route-level loading states
- **Error boundaries:** Use `error.tsx` for route-level error handling

#### Routing & File Structure
- **Dynamic routes:** Use `[param]` folders for dynamic segments
- **Route groups:** Use `(groupName)` to organize without affecting URLs
- **Parallel routes:** Use `@folder` for parallel route segments
- **Intercepting routes:** Use `(.)folder` for modal-like patterns
- **Co-location:** Keep components near where they're used

#### Performance Optimization
- **Image optimization:** Always use `next/image` component
- **Font optimization:** Use `next/font` for automatic font optimization
- **Code splitting:** Automatic, but use `dynamic()` for manual control
- **Lazy loading:** Use `React.lazy()` with Suspense for heavy components
- **Streaming:** Leverage React Suspense for progressive rendering

#### Caching Strategy
- **Request Memoization:** Automatic deduplication of fetch requests
- **Data Cache:** Use `revalidate` option for time-based revalidation
- **Full Route Cache:** Understand static vs dynamic routes
- **Router Cache:** Client-side cache of route segments
- **Manual revalidation:** Use `revalidatePath()` and `revalidateTag()`

#### Metadata & SEO
- **Static metadata:** Export `metadata` object from pages
- **Dynamic metadata:** Use `generateMetadata()` function
- **OpenGraph:** Include OG tags for social sharing
- **Robots.txt:** Configure via `robots.ts` file
- **Sitemap:** Generate via `sitemap.ts` file

### Limitations

- **Server Components:** Cannot use hooks, event handlers, or browser APIs
- **Build time:** Can be long for large applications (use turbopack in dev)
- **Learning curve:** App Router differs significantly from Pages Router
- **Hydration:** Mismatches between server/client can cause issues
- **Vercel optimization:** Some features optimized specifically for Vercel
- **File system routing:** Less flexible than programmatic routing

### Conventions

- **File naming:** `page.tsx` (routes), `layout.tsx` (layouts), `loading.tsx` (loading), `error.tsx` (errors)
- **Component exports:** Default exports for pages/layouts, named exports for components
- **Route organization:** Group related routes in folders
- **API routes:** Place in `app/api/` directory
- **Metadata location:** Define in `layout.tsx` or `page.tsx`

### Common Pitfalls

- **Using `useEffect` for data fetching:** Should use Server Components or Server Actions
- **Forgetting `'use client'`:** Not marking interactive components as Client Components
- **Hydration mismatches:** Server HTML not matching client render
- **Not using Image component:** Missing automatic optimization
- **Incorrect caching:** Not understanding when data is cached vs revalidated
- **Large bundle sizes:** Not code-splitting or lazy loading heavy components
- **Missing error boundaries:** Not handling errors with `error.tsx`
- **Over-using Client Components:** Converting entire tree to Client Components unnecessarily

---

## TypeScript

### Overview
- **Version:** 5.x
- **Rationale:** Type safety, better developer experience, catches errors at compile time

### Best Practices

#### Type System
- **Strict mode:** Enable all strict flags in `tsconfig.json`
- **Type inference:** Let TypeScript infer when obvious; explicitly type parameters and returns
- **Interface vs Type:** Use `interface` for object shapes, `type` for unions/intersections
- **Avoid `any`:** Use `unknown` and narrow with type guards
- **Generic constraints:** Use `extends` to constrain generics
- **Utility types:** Leverage `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`

#### Type Safety Patterns
- **Branded types:** Create distinct types for IDs to prevent mixing
- **Type guards:** Create functions that narrow types at runtime
- **Discriminated unions:** Use `type` field for type narrowing
- **Const assertions:** Use `as const` for literal types
- **Template literal types:** For type-safe string manipulation
- **Conditional types:** For complex type logic

#### Type Organization
- **Co-located types:** Place types near usage when specific
- **Shared types:** Use `types/` directory for shared types
- **Type-only imports:** Use `import type` for type-only imports
- **Enum alternatives:** Prefer union types over enums for better tree-shaking

### Limitations

- **Runtime erasure:** Types don't exist at runtime; need runtime validation
- **Learning curve:** Complex types can be difficult to understand
- **Build time:** Type checking adds to compilation time
- **Library support:** Some libraries have poor or missing type definitions
- **Type errors:** Can be cryptic for complex type scenarios

### Conventions

- **Naming:** PascalCase for types/interfaces, camelCase for variables/functions
- **File extensions:** `.ts` for TypeScript files, `.tsx` for React components
- **Type definitions:** Export types alongside related code
- **Generics:** Use descriptive names: `TData`, `TError` instead of `T`, `U`
- **Config:** Use `tsconfig.json` with `strict: true`

### Common Pitfalls

- **Using `any`:** Defeats purpose of TypeScript
- **Type assertions without validation:** Using `as` without runtime checks
- **Overly complex types:** Creating types that are hard to read/maintain
- **Not using strict mode:** Missing potential type errors
- **Ignoring errors:** Using `@ts-ignore` instead of fixing types
- **Mixing interface and type:** Inconsistent usage across codebase
- **Not typing function returns:** Implicit returns can hide errors
- **Circular dependencies:** Creating circular type dependencies

---

## TanStack Query (React Query)

### Overview
- **Version:** 5.x
- **Rationale:** Powerful server state management with caching, refetching, and optimistic updates

### Best Practices

#### Query Keys
- **Hierarchical structure:** `['flights'], ['flights', id], ['flights', { status: 'AT_RISK' }]`
- **Query key factories:** Create factories for type-safe keys
- **Consistency:** Use consistent key structure across app
- **Dependency tracking:** Include all dependencies in query keys
- **Serialization:** Ensure keys are JSON-serializable

#### Caching Strategy
- **Stale time:** Set appropriate `staleTime` based on data freshness needs
- **Cache time:** Use `gcTime` to control unused data retention
- **Background refetch:** Use `refetchOnWindowFocus` for real-time data
- **Polling:** Use `refetchInterval` for regular updates (weather dashboard)
- **Manual invalidation:** Use `queryClient.invalidateQueries()` after mutations

#### Mutations
- **Optimistic updates:** Use `onMutate` for instant UI feedback
- **Error rollback:** Restore previous state on error
- **Success invalidation:** Invalidate related queries on success
- **Loading states:** Use `isPending` for loading indicators
- **Error handling:** Use `onError` for error handling

#### Performance
- **Parallel queries:** Use `useQueries` for multiple queries
- **Dependent queries:** Use `enabled` option for dependent data
- **Prefetching:** Use `queryClient.prefetchQuery()` for anticipated data
- **Select option:** Transform data with `select` to prevent re-renders
- **Structural sharing:** Enabled by default, keeps referential equality

### Limitations

- **Learning curve:** Understanding cache behavior takes time
- **Bundle size:** Adds ~13KB gzipped to bundle
- **Server state only:** Not for client-only UI state (use Zustand)
- **Complex invalidation:** Managing cache invalidation can be tricky
- **No built-in persistence:** Need plugins for localStorage persistence

### Conventions

- **Hook naming:** `useFlights()`, `useFlight(id)`, `useCreateFlight()`
- **Query keys:** Create `flightKeys` factory: `{ all: ['flights'], detail: (id) => ['flights', id] }`
- **Mutation naming:** `useCreateFlight`, `useUpdateFlight`, `useDeleteFlight`
- **Error types:** Define typed error responses
- **Provider:** Single `QueryClient` instance in app root

### Common Pitfalls

- **Incorrect query keys:** Keys not matching causes cache misses
- **Not invalidating:** Forgetting to invalidate after mutations
- **Over-fetching:** Re-fetching data already in cache
- **Stale closures:** Using stale data in callbacks
- **Not handling errors:** Missing error UI or error boundaries
- **Race conditions:** Multiple mutations on same resource without sequencing
- **Cache pollution:** Not cleaning up unused queries
- **Infinite loops:** Circular dependencies in invalidation

---

## Zustand

### Overview
- **Version:** 4.x
- **Rationale:** Lightweight state management for client UI state (filters, modals, UI preferences)

### Best Practices

#### Store Organization
- **Single responsibility:** Create separate stores for different domains
- **Selective subscriptions:** Use selectors to prevent unnecessary re-renders
- **Immer integration:** Use `immer` middleware for immutable updates
- **Persist middleware:** Use `persist` for localStorage sync
- **DevTools:** Enable Redux DevTools in development

#### State Design
- **Flat structure:** Keep state as flat as possible
- **Actions:** Define actions as functions, not in components
- **Computed values:** Use selectors for derived state
- **Immutability:** Always return new objects, never mutate
- **TypeScript:** Use proper typing for stores and actions

#### Performance
- **Granular selectors:** Select only needed state: `useStore(state => state.filter)`
- **Shallow equality:** Use `shallow` for object/array selectors
- **Memoization:** Memoize expensive selectors
- **Store splitting:** Split large stores into smaller focused stores

### Limitations

- **No built-in async:** Handle async logic manually or with middleware
- **No time-travel:** Unlike Redux, limited debugging without DevTools
- **Smaller ecosystem:** Fewer middleware options than Redux
- **Manual persistence:** Need to configure persistence explicitly

### Conventions

- **Store naming:** `useUIStore`, `useFilterStore`, `useNotificationStore`
- **Action naming:** Verb-noun pattern: `setFilter`, `clearFilters`, `openModal`
- **File structure:** One store per file in `stores/` directory
- **Exports:** Export store hook and individual selectors

### Common Pitfalls

- **Not using selectors:** Subscribing to entire store causes unnecessary re-renders
- **Mutating state:** Directly mutating state outside `set`
- **Creating stores in components:** Stores should be module-level
- **Over-using Zustand:** Using for state that should be local
- **Not persisting correctly:** Persisting too much or sensitive data
- **Circular dependencies:** Stores depending on each other
- **Memory leaks:** Not cleaning up subscriptions in useEffect

---

# Backend Stack

## Prisma

### Overview
- **Version:** 5.x
- **Rationale:** Type-safe ORM with excellent TypeScript integration and migrations

### Best Practices

#### Schema Design
- **Naming:** Use PascalCase for models, camelCase for fields
- **Relations:** Define both sides of relationships
- **Indexes:** Add indexes on foreign keys and frequently queried fields
- **Constraints:** Use `@unique`, `@@unique`, `@@index` appropriately
- **Enums:** Define enums in schema for status fields
- **Default values:** Use `@default()` for timestamps and status fields

#### Query Optimization
- **Select specific fields:** Use `select` to fetch only needed data
- **Include relations:** Use `include` carefully to avoid N+1
- **Pagination:** Always use `skip` and `take` for list queries
- **Filtering:** Use `where` with indexed fields
- **Sorting:** Use `orderBy` with indexed fields
- **Aggregations:** Use `aggregate`, `count`, `groupBy` for analytics

#### Transactions
- **Use transactions:** For operations that must succeed/fail together
- **Interactive transactions:** Use `$transaction` with callback for complex logic
- **Batch operations:** Use `createMany`, `updateMany`, `deleteMany`
- **Optimistic concurrency:** Use `@@version` for version checking

#### Migrations
- **Dev migrations:** Use `prisma migrate dev` in development
- **Production migrations:** Use `prisma migrate deploy` in production
- **Migration naming:** Descriptive names: `add_weather_logs_table`
- **Seed data:** Use `prisma db seed` for initial data
- **Schema changes:** Always create migrations, don't edit database directly

### Limitations

- **No computed fields:** Cannot define calculated fields in schema
- **Limited raw SQL:** Some complex queries need raw SQL
- **No MongoDB transactions:** Limited transaction support for MongoDB
- **Migration conflicts:** Merge conflicts in migrations can be tricky
- **Performance overhead:** ORM abstraction adds some overhead
- **No advanced features:** Some PostgreSQL features not supported

### Conventions

- **Model naming:** Singular: `User`, `Booking`, `WeatherLog`
- **Table naming:** Prisma maps to snake_case: `users`, `bookings`, `weather_logs`
- **ID strategy:** Use `@default(autoincrement())` or `@default(uuid())`
- **Timestamps:** Include `createdAt` and `updatedAt` with `@default(now())` and `@updatedAt`
- **Relations:** Name foreign keys descriptively: `userId`, `bookingId`

### Common Pitfalls

- **N+1 queries:** Accessing relations in loops without proper includes
- **Missing indexes:** Slow queries due to missing indexes
- **Over-fetching:** Loading entire models when only few fields needed
- **Transaction deadlocks:** Long-running transactions blocking others
- **Not generating client:** Forgetting `prisma generate` after schema changes
- **Migration conflicts:** Multiple developers creating conflicting migrations
- **Cascade issues:** Incorrect cascade settings causing data loss
- **Raw queries:** Bypassing Prisma's type safety with raw SQL unnecessarily

---

## PostgreSQL (Amazon RDS)

### Overview
- **Version:** 15.x
- **Service:** Amazon RDS for PostgreSQL
- **Rationale:** ACID compliance, strong relational model, excellent for transactions and analytics

### Best Practices

#### Connection Management
- **Connection pooling:** Use PgBouncer or Prisma's connection pool
- **Connection limits:** Set `max_connections` appropriately for instance
- **Idle timeout:** Configure `idle_timeout` to close unused connections
- **SSL connections:** Always use SSL in production
- **Connection string:** Store in environment variables securely

#### Performance Optimization
- **Indexes:** Create indexes on foreign keys, status fields, timestamps
- **Partial indexes:** Use `WHERE` clause for conditional indexes
- **Covering indexes:** Include columns in index for index-only scans
- **VACUUM:** Monitor autovacuum settings for maintenance
- **ANALYZE:** Keep statistics updated for query planner
- **Query plans:** Use `EXPLAIN ANALYZE` to optimize slow queries

#### Data Integrity
- **Foreign keys:** Always define foreign key constraints
- **Check constraints:** Use `CHECK` for business rules
- **NOT NULL:** Use `NOT NULL` for required fields
- **UNIQUE constraints:** Prevent duplicate data
- **Transactions:** Use transactions for data consistency
- **Triggers:** Use sparingly, prefer application logic

#### Backup & Recovery
- **Automated backups:** Enable RDS automated backups
- **Backup retention:** Set appropriate retention period (7-30 days)
- **Point-in-time recovery:** Enable for critical databases
- **Manual snapshots:** Create before major changes
- **Test restores:** Regularly test backup restoration

### Limitations

- **Cost:** More expensive than self-hosted
- **Limited customization:** No OS access or custom extensions
- **Backup window:** Backups may impact performance
- **Vertical scaling:** Requires downtime to scale up
- **Version upgrades:** Major versions need manual intervention

### Conventions

- **Table naming:** Use snake_case: `flight_bookings`, `weather_logs`
- **Column naming:** Use snake_case: `created_at`, `user_id`, `training_level`
- **Primary keys:** Name `id`, type `SERIAL` or `UUID`
- **Timestamps:** Always include `created_at` and `updated_at`
- **Enums:** Use PostgreSQL ENUMs or VARCHAR with CHECK constraints

### Common Pitfalls

- **Connection leaks:** Not closing connections properly
- **Too many connections:** Exceeding max_connections limit
- **No backups:** Not enabling automated backups
- **Public access:** Making database publicly accessible
- **Weak passwords:** Using default or weak passwords
- **Missing indexes:** Slow queries due to table scans
- **Long transactions:** Blocking other operations
- **No monitoring:** Not setting up CloudWatch alarms

---

## tRPC

### Overview
- **Version:** 10.x
- **Rationale:** End-to-end type safety from database to frontend without code generation

### Best Practices

#### Router Organization
- **Feature-based routers:** Organize by domain: `flightsRouter`, `weatherRouter`
- **Nested routers:** Use `router.merge()` to compose routers
- **Procedure types:** Use `.query()` for reads, `.mutation()` for writes
- **Middleware:** Create reusable middleware for auth, logging, rate limiting
- **Context:** Pass shared resources (db, session) via context

#### Input Validation
- **Zod schemas:** Define input schemas for all procedures
- **Reusable schemas:** Share schemas between frontend and backend
- **Strict validation:** Use `.strict()` to reject unknown fields
- **Error messages:** Provide clear validation error messages
- **Transform:** Use `.transform()` for data normalization

#### Error Handling
- **TRPCError:** Use `TRPCError` with proper error codes
- **Error codes:** Use semantic codes: `BAD_REQUEST`, `UNAUTHORIZED`, `NOT_FOUND`
- **Error logging:** Log errors with context for debugging
- **Error responses:** Return user-friendly error messages
- **Global error handler:** Use `onError` for centralized error handling

#### Performance
- **Batching:** Enable query batching for multiple queries
- **Caching:** Leverage React Query caching on client
- **Parallel queries:** Structure procedures for parallel execution
- **Database optimization:** Optimize database queries in procedures
- **Response size:** Return only necessary data

### Limitations

- **TypeScript only:** Only works with TypeScript
- **Monorepo requirement:** Works best in monorepo or same repo
- **Not for public APIs:** Not suitable for external API consumers
- **Limited REST features:** No standard HTTP caching headers
- **Smaller ecosystem:** Fewer tools than REST/GraphQL

### Conventions

- **Procedure naming:** Use descriptive names: `getFlights`, `createBooking`
- **Router naming:** Suffix with "Router": `flightsRouter`, `weatherRouter`
- **Input naming:** Prefix input types: `CreateFlightInput`, `UpdateBookingInput`
- **Context naming:** Use `ctx` for context parameter
- **File structure:** Place routers in `server/routers/` directory

### Common Pitfalls

- **Not validating inputs:** Missing Zod schemas on procedures
- **Overly broad contexts:** Including too much in context
- **Missing auth checks:** Not verifying permissions in procedures
- **Large response payloads:** Returning too much data
- **Nested mutations:** Avoid calling mutations from mutations
- **Not handling errors:** Missing error handling in procedures
- **Circular dependencies:** Routers depending on each other
- **Missing types:** Not properly typing context or procedures

---

## Zod

### Overview
- **Version:** 3.x
- **Rationale:** Runtime validation that matches TypeScript types

### Best Practices

#### Schema Definition
- **Coerce types:** Use `.coerce.number()` for string-to-number conversion
- **Optional fields:** Use `.optional()` or `.nullable()` appropriately
- **Default values:** Use `.default()` for missing fields
- **Refinements:** Use `.refine()` for custom validation
- **Transforms:** Use `.transform()` for data normalization
- **Preprocess:** Use `.preprocess()` for input cleaning

#### Reusability
- **Base schemas:** Create base schemas and extend them
- **Schema composition:** Use `.merge()` and `.extend()` to compose
- **Partial schemas:** Use `.partial()` for update operations
- **Pick/Omit:** Use `.pick()` and `.omit()` for field selection
- **Shared schemas:** Export and reuse schemas across app

#### Error Handling
- **Custom errors:** Use `.refine()` with custom messages
- **Error maps:** Use `errorMap` for localized messages
- **Parse safely:** Use `.safeParse()` to handle errors gracefully
- **Error formatting:** Format errors for user-friendly messages

### Limitations

- **Bundle size:** Adds ~8KB gzipped to bundle
- **Performance:** Validation has runtime cost
- **No async validation:** Cannot validate async operations directly
- **Complex schemas:** Very complex schemas can be hard to read

### Conventions

- **Schema naming:** Suffix with "Schema": `createFlightSchema`, `userSchema`
- **Export types:** Export inferred types: `export type CreateFlightInput = z.infer<typeof createFlightSchema>`
- **File organization:** Co-locate with related code or in `schemas/` directory
- **Strict mode:** Use `.strict()` to catch unknown keys

### Common Pitfalls

- **Not using `.strict()`:** Allowing unexpected fields
- **Overly permissive:** Using `.any()` or `.unknown()` too liberally
- **Missing validation:** Not validating edge cases
- **Poor error messages:** Using default error messages
- **Not reusing schemas:** Duplicating schema definitions
- **Synchronous only:** Expecting async validation support

---

# AI & LLM

## Vercel AI SDK

### Overview
- **Version:** 3.x
- **Rationale:** Simplified AI integration with streaming, function calling, and provider abstraction

### Best Practices

#### Model Configuration
- **Provider abstraction:** Use provider-agnostic code
- **Model selection:** Choose appropriate model for task (GPT-4o vs GPT-4o-mini)
- **Temperature:** Lower temperature (0.2-0.3) for structured outputs
- **Max tokens:** Set reasonable limits to control costs
- **Timeout:** Configure request timeouts for reliability

#### Function Calling (Tools)
- **Tool definition:** Define clear tool schemas with Zod
- **Tool descriptions:** Write clear descriptions for AI understanding
- **Parameter validation:** Validate tool parameters thoroughly
- **Error handling:** Handle tool execution errors gracefully
- **Multiple tools:** Provide multiple tools for complex tasks

#### Streaming
- **Stream responses:** Use streaming for better UX with long responses
- **Partial updates:** Show progressive results to user
- **Error handling:** Handle stream errors and interruptions
- **Abort controllers:** Allow users to cancel long-running requests
- **Token counting:** Monitor token usage for cost control

#### Prompt Engineering
- **Clear instructions:** Write explicit, detailed prompts
- **System messages:** Use system message for role and constraints
- **Few-shot examples:** Provide examples for better outputs
- **Output format:** Specify exact output format needed
- **Context limits:** Stay within model's context window

### Limitations

- **Cost:** API calls can be expensive at scale
- **Latency:** LLM responses take 2-10 seconds
- **Rate limits:** Provider rate limits can impact throughput
- **Reliability:** External service dependency
- **Unpredictability:** AI outputs can be inconsistent

### Conventions

- **Function naming:** Use descriptive names: `generateRescheduleOptions`, `explainWeatherConflict`
- **Error handling:** Wrap AI calls in try-catch with fallbacks
- **Logging:** Log AI requests/responses for debugging
- **Cost tracking:** Monitor token usage and costs
- **Caching:** Cache similar requests to reduce API calls

### Common Pitfalls

- **No error handling:** Not handling API failures
- **Unbounded costs:** No token limits or cost monitoring
- **Poor prompts:** Vague or ambiguous prompts
- **Not validating outputs:** Trusting AI output without validation
- **Ignoring rate limits:** Exceeding provider rate limits
- **No fallbacks:** No graceful degradation when AI fails
- **Exposing API keys:** Including keys in client-side code
- **Not streaming:** Missing streaming for better UX

---

## OpenAI (GPT-4o / GPT-4o-mini)

### Overview
- **Models:** GPT-4o (production), GPT-4o-mini (development)
- **Rationale:** Best-in-class reasoning for scheduling logic and natural language tasks

### Best Practices

#### Model Selection
- **GPT-4o:** Use for complex reasoning (production reschedule generation)
- **GPT-4o-mini:** Use for simpler tasks (development, explanations)
- **Function calling:** Use structured outputs for JSON responses
- **Embeddings:** Use `text-embedding-3-small` for similarity search
- **Context window:** Stay within 128k token limit

#### Prompt Engineering
- **System prompt:** Define role, constraints, and output format
- **User prompt:** Provide clear, specific instructions
- **Context:** Include relevant data (training level, weather, availability)
- **Examples:** Show examples of desired outputs
- **JSON mode:** Use JSON mode for structured outputs

#### Cost Optimization
- **Token management:** Minimize prompt length without losing context
- **Model caching:** Cache responses for repeated queries
- **Batch requests:** Group similar requests when possible
- **Cheaper models:** Use GPT-4o-mini for development and testing
- **Response limits:** Set `max_tokens` to control costs

#### Security
- **API key protection:** Store in environment variables, never in code
- **Rate limiting:** Implement application-level rate limiting
- **Input sanitization:** Sanitize user inputs before sending to API
- **Output validation:** Validate AI outputs before using
- **Logging:** Log requests without exposing sensitive data

### Limitations

- **Cost:** Expensive at scale ($5/1M input tokens for GPT-4o)
- **Latency:** 2-10 second response times
- **Rate limits:** 10,000 requests/day on free tier
- **Unpredictability:** Outputs can vary between calls
- **Context limits:** 128k tokens maximum context window
- **No real-time data:** Model knowledge cutoff date

### Conventions

- **Temperature:** 0.2-0.3 for deterministic outputs, 0.7-0.9 for creative
- **System role:** Always include system message for context
- **Error codes:** Handle specific error codes (rate limit, context length)
- **Retry logic:** Implement exponential backoff for retries
- **Logging:** Log token usage and costs

### Common Pitfalls

- **Exposing API keys:** Hardcoding keys in source code
- **No rate limiting:** Getting rate limited by OpenAI
- **Not handling errors:** Not catching API errors
- **Unbounded costs:** No token limits or monitoring
- **Poor prompts:** Generic prompts producing poor results
- **Not validating:** Using AI output without validation
- **Context overflow:** Exceeding token limits
- **Ignoring async:** Not handling async API calls properly

---

# Authentication

## NextAuth.js (Auth.js)

### Overview
- **Version:** 5.x (Auth.js)
- **Rationale:** De facto authentication standard for Next.js with database sessions

### Best Practices

#### Configuration
- **Database sessions:** Use database sessions for better control
- **Session strategy:** Choose between JWT or database sessions
- **Callbacks:** Use callbacks for custom logic (JWT, session, signIn)
- **Pages:** Customize auth pages for brand consistency
- **Adapters:** Use Prisma adapter for database integration

#### Security
- **HTTPS only:** Always use HTTPS in production
- **CSRF protection:** Built-in CSRF protection enabled
- **Session expiration:** Set appropriate session expiration (30 days)
- **Secret rotation:** Rotate NEXTAUTH_SECRET regularly
- **Secure cookies:** Use secure cookie settings in production

#### Session Management
- **Session hooks:** Use `useSession()` for client-side session access
- **Server-side:** Use `getServerSession()` in Server Components
- **Protected routes:** Use middleware to protect routes
- **Role-based access:** Store and check user roles
- **Session updates:** Update session when user data changes

#### Providers
- **Email provider:** Use email/password for primary auth
- **OAuth providers:** Add Google, GitHub for social login
- **Provider config:** Configure each provider properly
- **Callback URLs:** Set correct callback URLs

### Limitations

- **Limited MFA:** Multi-factor auth requires custom implementation
- **Complex flows:** Advanced auth flows need custom code
- **TypeScript:** Session typing requires augmentation
- **Database dependency:** Database sessions require database connection
- **Migration complexity:** Upgrading between versions can be complex

### Conventions

- **Route location:** Place auth routes in `app/api/auth/[...nextauth]/`
- **Session type:** Augment types in `types/next-auth.d.ts`
- **Callbacks:** Use `callbacks` for extending session/JWT
- **Protected routes:** Use middleware for route protection
- **Error pages:** Customize error pages in `/auth/error`

### Common Pitfalls

- **Missing NEXTAUTH_SECRET:** Not setting secret in production
- **Incorrect NEXTAUTH_URL:** Wrong URL causing redirect issues
- **Not checking roles:** Not implementing authorization checks
- **Session not updating:** Not updating session after user changes
- **Insecure cookies:** Not using secure settings in production
- **CSRF disabled:** Disabling CSRF protection
- **No error handling:** Not handling auth errors gracefully
- **Adapter misconfiguration:** Incorrect Prisma adapter setup

---

# UI & Styling

## Tailwind CSS

### Overview
- **Version:** 3.x
- **Rationale:** Utility-first CSS for rapid development and consistent design

### Best Practices

#### Configuration
- **Custom theme:** Extend theme with brand colors and spacing
- **JIT mode:** Use Just-in-Time mode (default in v3)
- **Dark mode:** Use `class` strategy for dark mode
- **Plugins:** Use official plugins (forms, typography)
- **Content paths:** Configure content paths for purging

#### Class Organization
- **Consistent order:** Layout → spacing → typography → colors
- **Responsive design:** Mobile-first: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **State variants:** Use `hover:`, `focus:`, `active:`, `disabled:`
- **Group modifiers:** Use `group` and `group-hover` for parent-child interactions
- **Peer modifiers:** Use `peer` for sibling element styling

#### Component Patterns
- **Component extraction:** Extract repeated patterns to components
- **@apply directive:** Use sparingly for common patterns
- **CSS variables:** Use CSS variables for dynamic values
- **Arbitrary values:** Use `[]` for one-off values: `w-[123px]`

#### Performance
- **Purging:** Ensure unused styles are purged in production
- **Minimize @apply:** Too many @apply directives reduce benefits
- **Preload fonts:** Preload custom fonts used in Tailwind
- **Optimize builds:** Use `NODE_ENV=production` for smaller builds

### Limitations

- **Learning curve:** Requires learning utility class names
- **HTML verbosity:** Many classes can make HTML harder to read
- **Dynamic classes:** Cannot use dynamic class names (must be static)
- **Specificity:** Sometimes need `!important` for overrides
- **Design system:** Need to enforce design system separately

### Conventions

- **Class order:** Follow consistent ordering (use Prettier plugin)
- **Breakpoints:** Use standard breakpoints consistently
- **Color names:** Use semantic names in theme: `primary`, `secondary`, `danger`
- **Spacing scale:** Use Tailwind's spacing scale (0, 1, 2, 4, 8, 12, 16...)
- **Component files:** Create component files for repeated patterns

### Common Pitfalls

- **Not purging:** Including all Tailwind classes in production
- **String concatenation:** Building class names dynamically
- **Over-using @apply:** Negating benefits of utility-first
- **Inline styles:** Mixing Tailwind with inline styles
- **Ignoring breakpoints:** Not making designs responsive
- **Color inconsistency:** Using arbitrary colors instead of theme
- **Accessibility:** Forgetting focus states and ARIA attributes

---

## shadcn/ui

### Overview
- **Rationale:** Copy-paste components built on Radix UI with Tailwind styling

### Best Practices

#### Component Usage
- **Copy components:** Copy components to `components/ui/` directory
- **Customize freely:** Components are yours to modify
- **Dependencies:** Install required Radix UI packages
- **Theming:** Use CSS variables in `globals.css` for theming
- **Composition:** Build complex components from primitives

#### Customization
- **Theme variables:** Modify CSS variables for colors
- **Variants:** Use `class-variance-authority` for variants
- **Icons:** Use Lucide React for icons
- **Typography:** Extend with custom typography components
- **Animations:** Use Tailwind animations or Framer Motion

#### Accessibility
- **Radix primitives:** Components use accessible Radix UI primitives
- **Keyboard navigation:** Test keyboard navigation
- **Screen readers:** Test with screen readers
- **Focus management:** Ensure proper focus management
- **ARIA labels:** Add ARIA labels where needed

### Limitations

- **No package:** Components copied, not installed via npm
- **Manual updates:** Need to manually update components
- **Radix dependency:** Most components depend on Radix UI
- **Bundle size:** Radix UI adds to bundle size
- **Tailwind required:** Must use Tailwind CSS

### Conventions

- **Location:** Place in `components/ui/` directory
- **Naming:** Use same names as shadcn: `button.tsx`, `dialog.tsx`
- **Variants:** Define variants with `cva()`
- **Exports:** Export component and type interfaces
- **Documentation:** Keep component documentation accessible

### Common Pitfalls

- **Breaking accessibility:** Modifying components incorrectly
- **Not customizing:** Using default styles without brand adjustments
- **Ignoring updates:** Not checking for component updates
- **Over-modification:** Changing so much components are unrecognizable
- **Missing dependencies:** Forgetting to install Radix UI packages
- **Bundle bloat:** Including all components without tree-shaking

---

# Communication

## Resend (Email Service)

### Overview
- **Rationale:** Modern email API with React Email templates and great DX

### Best Practices

#### Email Templates
- **React Email:** Use React Email for template creation
- **Responsive design:** Ensure emails work on mobile
- **Plain text:** Always include plain text version
- **Inline styles:** Use inline styles for email compatibility
- **Testing:** Test in multiple email clients
- **Preview:** Use Resend preview for testing

#### Deliverability
- **Domain verification:** Verify sending domain
- **SPF/DKIM:** Configure properly for deliverability
- **From address:** Use consistent from address
- **Subject lines:** Clear, non-spammy subject lines
- **Unsubscribe:** Include unsubscribe link
- **Bounce handling:** Handle bounces and complaints

#### Performance
- **Batch sending:** Use batch API for multiple emails
- **Rate limiting:** Respect Resend rate limits
- **Retry logic:** Implement retry for failed sends
- **Monitoring:** Monitor delivery rates and bounces
- **Templates:** Cache compiled templates

### Limitations

- **Free tier:** Limited to 3,000 emails/month
- **Cost at scale:** More expensive than SES at high volume
- **Newer service:** Less battle-tested than established providers
- **Feature set:** Fewer features than comprehensive email platforms

### Conventions

- **Template location:** Place in `emails/` directory
- **Template naming:** Descriptive names: `weather-conflict.tsx`
- **Error handling:** Always handle send errors
- **Logging:** Log email sends for debugging
- **Variables:** Type email template props

### Common Pitfalls

- **Not testing:** Not testing emails before sending
- **HTML only:** Forgetting plain text version
- **Missing verification:** Not verifying domain
- **Poor deliverability:** Not configuring SPF/DKIM
- **No error handling:** Not catching send errors
- **Hard-coding:** Hard-coding content instead of using variables
- **No unsubscribe:** Missing unsubscribe functionality

---

# AWS Infrastructure

## Amazon RDS (PostgreSQL)

### Best Practices

#### Configuration
- **Multi-AZ:** Enable for production high availability
- **Instance sizing:** Choose appropriate instance type
- **Storage:** Use gp3 for better performance/cost
- **Automated backups:** Enable with 7-30 day retention
- **Monitoring:** Enable Enhanced Monitoring

#### Security
- **Security groups:** Restrict access to application only
- **Encryption:** Enable encryption at rest
- **SSL/TLS:** Require SSL connections
- **IAM authentication:** Use IAM for database access
- **Secrets Manager:** Store credentials in AWS Secrets Manager

#### Performance
- **Parameter groups:** Create custom parameter groups
- **Connection pooling:** Use connection pooler (PgBouncer)
- **Read replicas:** Use for read scaling
- **Performance Insights:** Enable for query monitoring
- **CloudWatch:** Monitor CPU, memory, connections, storage

### Common Pitfalls

- **Public access:** Making database publicly accessible
- **No backups:** Not enabling automated backups
- **Wrong instance size:** Under or over-provisioning
- **No monitoring:** Not setting up CloudWatch alarms
- **Connection leaks:** Application not managing connections
- **No SSL:** Allowing unencrypted connections

---

## AWS Lambda

### Best Practices

#### Function Configuration
- **Memory allocation:** Set appropriately (more memory = more CPU)
- **Timeout:** Set reasonable timeout (max 15 minutes)
- **Environment variables:** Use for configuration
- **Layers:** Use layers for shared dependencies
- **Concurrency:** Set reserved concurrency if needed

#### Performance
- **Cold starts:** Keep functions warm with CloudWatch Events
- **Package size:** Minimize deployment package size
- **Dependencies:** Only include necessary dependencies
- **Connection pooling:** Reuse database connections
- **Async patterns:** Use async/await properly

#### Monitoring
- **CloudWatch Logs:** Monitor logs for errors
- **CloudWatch Metrics:** Track invocations, errors, duration
- **X-Ray:** Enable for distributed tracing
- **Alarms:** Set up alarms for failures
- **Dead letter queue:** Configure for failed invocations

### Common Pitfalls

- **Cold starts:** Not optimizing for cold starts
- **Timeout errors:** Setting timeout too low
- **Memory issues:** Insufficient memory allocation
- **Connection exhaustion:** Not managing database connections
- **No error handling:** Not catching and logging errors
- **Large packages:** Including unnecessary dependencies

---

## AWS EventBridge

### Best Practices

#### Scheduled Rules
- **Cron expressions:** Use standard cron syntax
- **Rate expressions:** Use for simple intervals
- **Rule naming:** Descriptive names for rules
- **Targets:** Configure targets properly (Lambda, SNS)
- **Retry policy:** Configure retry attempts
- **Dead letter queue:** Set up for failed invocations

#### Monitoring
- **CloudWatch Metrics:** Monitor failed invocations
- **Alarms:** Set up alarms for failures
- **Logging:** Enable logging for debugging
- **Target metrics:** Monitor target execution

### Common Pitfalls

- **Wrong timezone:** Cron expressions use UTC
- **No error handling:** Not handling target failures
- **Missing permissions:** Lambda not having permissions
- **No monitoring:** Not monitoring rule execution

---

## AWS S3

### Best Practices

#### Bucket Configuration
- **Versioning:** Enable for important data
- **Encryption:** Enable default encryption (SSE-S3)
- **Public access:** Block all public access by default
- **CORS:** Configure for client uploads
- **Lifecycle policies:** Archive or delete old files

#### Performance
- **Naming:** Use random prefixes for high throughput
- **Multipart upload:** Use for files >5MB
- **Transfer acceleration:** Enable for global uploads
- **CloudFront:** Use CDN for serving files
- **Compression:** Compress files before upload

#### Security
- **Bucket policies:** Use least privilege
- **IAM roles:** Use roles instead of access keys
- **Presigned URLs:** Use for temporary access
- **Access logging:** Enable for audit trail
- **Object Lock:** Use for compliance requirements

### Common Pitfalls

- **Public buckets:** Accidentally making bucket public
- **No encryption:** Not encrypting sensitive data
- **No lifecycle policies:** Accumulating old files
- **Poor naming:** Using predictable object keys
- **No monitoring:** Not monitoring access patterns
- **CORS errors:** Incorrect CORS configuration

---

## AWS CloudWatch

### Best Practices

#### Logging
- **Log groups:** Organize logs by service
- **Retention:** Set appropriate retention periods
- **Structured logs:** Use JSON for structured logging
- **Log levels:** Use appropriate levels (INFO, WARN, ERROR)
- **Filtering:** Create metric filters for important events

#### Metrics
- **Custom metrics:** Create for business metrics
- **Dimensions:** Use dimensions for filtering
- **Dashboards:** Create dashboards for monitoring
- **Alarms:** Set up alarms for critical metrics
- **Composite alarms:** Use for complex conditions

#### Monitoring
- **Lambda Insights:** Enable for Lambda monitoring
- **RDS Performance Insights:** Enable for database monitoring
- **Application Insights:** Use for application monitoring
- **Anomaly detection:** Use for unusual patterns

### Common Pitfalls

- **No alarms:** Not setting up alerts
- **High costs:** Over-logging causing high costs
- **No retention policy:** Keeping logs indefinitely
- **Missing metrics:** Not tracking important metrics
- **Alert fatigue:** Too many non-actionable alerts

---

# Testing Strategy

## Jest (Unit & Integration Tests)

### Best Practices

#### Test Organization
- **Descriptive names:** Use clear test descriptions
- **AAA pattern:** Arrange, Act, Assert structure
- **Single assertion:** One logical assertion per test
- **Test isolation:** Each test independent
- **Setup/teardown:** Use `beforeEach` and `afterEach`
- **Test data:** Use test builders or factories

#### Mocking
- **Mock external services:** Mock weather API, email service
- **Partial mocking:** Mock only what's necessary
- **Mock data:** Use realistic mock data
- **Spy functions:** Use spies to verify calls
- **Clear mocks:** Clear mocks between tests

#### Coverage
- **Aim for 80%+:** Good coverage without being dogmatic
- **Critical paths:** 100% coverage for critical logic
- **Ignore generated:** Exclude generated files
- **Branch coverage:** Test all code branches
- **Integration tests:** Cover integration points

### Limitations

- **Async complexity:** Async testing can be tricky
- **Snapshot brittleness:** Snapshots can be fragile
- **Slow tests:** Large test suites can be slow
- **Mock complexity:** Complex mocking can be hard

### Conventions

- **File naming:** `.test.ts` or `.spec.ts` suffix
- **Test location:** Co-locate with source or in `__tests__`
- **Describe blocks:** Group related tests
- **It/test:** Use `it` or `test` consistently
- **Assertions:** Use Jest matchers consistently

### Common Pitfalls

- **Not testing edge cases:** Only testing happy path
- **Brittle tests:** Tests that break with minor changes
- **Slow tests:** Not optimizing test performance
- **Testing implementation:** Testing internals instead of behavior
- **Mock overuse:** Mocking too much reduces test value
- **No cleanup:** Not cleaning up after tests

---

## React Testing Library

### Best Practices

#### Query Priority
1. **getByRole:** Most accessible way
2. **getByLabelText:** Good for forms
3. **getByPlaceholderText:** Placeholder text
4. **getByText:** Visible text
5. **getByTestId:** Last resort for non-semantic elements

#### User Interactions
- **userEvent:** Use `@testing-library/user-event` over `fireEvent`
- **Async operations:** Use `findBy` queries for async
- **Wait utilities:** Use `waitFor` for complex async
- **Avoid waitForElementToBeRemoved:** Use negative assertions carefully

#### Best Practices
- **Test behavior:** Test user-visible behavior, not implementation
- **Accessibility:** Tests should verify accessibility
- **Semantic queries:** Use semantic queries when possible
- **Real user actions:** Simulate real user interactions

### Common Pitfalls

- **Using getByTestId:** Over-relying on test IDs
- **Testing internals:** Testing component state/props
- **Not waiting:** Not waiting for async operations
- **Poor queries:** Using querySelector instead of semantic queries
- **Over-mocking:** Mocking too much reduces test value

---

# Development Workflow

## Project Structure

```
skyshift/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── migrations/            # Migration history
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/      # Protected routes
│   │   │   ├── page.tsx      # Main dashboard
│   │   │   ├── flights/
│   │   │   ├── analytics/
│   │   │   └── profile/
│   │   ├── api/
│   │   │   ├── auth/         # NextAuth routes
│   │   │   └── trpc/         # tRPC handler
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── dashboard/
│   │   ├── flights/
│   │   └── weather/
│   ├── lib/
│   │   ├── db.ts             # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── ai.ts             # AI SDK setup
│   │   └── weather.ts        # Weather API client
│   ├── server/
│   │   ├── context.ts        # tRPC context
│   │   ├── trpc.ts           # tRPC setup
│   │   └── routers/          # tRPC routers
│   │       ├── flights.ts
│   │       ├── weather.ts
│   │       ├── reschedule.ts
│   │       └── notifications.ts
│   ├── services/             # Business logic
│   │   ├── weather-monitor.ts
│   │   ├── ai-reschedule.ts
│   │   └── notification.ts
│   ├── stores/               # Zustand stores
│   │   ├── ui-store.ts
│   │   └── filter-store.ts
│   ├── types/                # TypeScript types
│   │   ├── index.ts
│   │   └── next-auth.d.ts
│   └── utils/                # Utility functions
│       ├── validation.ts
│       └── date-helpers.ts
├── lambda/                    # AWS Lambda functions
│   └── weather-check/
│       ├── index.ts
│       └── package.json
├── emails/                    # React Email templates
│   ├── weather-conflict.tsx
│   └── reschedule-confirmed.tsx
├── public/                    # Static assets
├── tests/                     # Test files
│   ├── unit/
│   └── integration/
├── .env.local                 # Local environment variables
├── .env.example               # Template
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skyshift"

# NextAuth
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# Weather APIs
OPENWEATHER_API_KEY="your-key-here"

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# AWS (Production)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="skyshift-files"

# Optional - SMS
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="..."

# Optional - Monitoring
SENTRY_DSN="..."
```

---

## Development Phases

### Phase 1: Foundation (Day 1)
**Goal:** Set up project infrastructure

1. ✅ **Initialize Next.js 14 project**
   ```bash
   pnpm create next-app@latest skyshift --typescript --tailwind --app
   ```

2. ✅ **Set up Tailwind CSS + shadcn/ui**
   ```bash
   pnpm dlx shadcn-ui@latest init
   pnpm dlx shadcn-ui@latest add button card dialog input label
   ```

3. ✅ **Configure Prisma + PostgreSQL**
   ```bash
   pnpm add prisma @prisma/client
   pnpm prisma init
   # Edit schema.prisma
   pnpm prisma migrate dev --name init
   ```

4. ✅ **Create database schema**
   - Users (students, instructors, admins)
   - Bookings (flight schedules)
   - Reschedules (history)
   - Notifications
   - Weather logs
   - Audit log

5. ✅ **Set up NextAuth.js**
   ```bash
   pnpm add next-auth @auth/prisma-adapter
   ```

6. ✅ **Build basic dashboard layout**
   - Navigation
   - Header
   - Sidebar (optional)
   - Main content area

### Phase 2: Core Features (Days 2-3)
**Goal:** Implement main application features

1. ✅ **Flight booking CRUD operations**
   - Create booking form
   - List bookings
   - View booking details
   - Update booking
   - Cancel booking

2. ✅ **Weather API integration**
   - OpenWeatherMap client
   - AviationWeather.gov parser (optional)
   - Weather data caching
   - Error handling

3. ✅ **Weather conflict detection logic**
   - Training level minimums
   - Weather evaluation function
   - Conflict detection service
   - Status updates

4. ✅ **AI rescheduling engine**
   - Vercel AI SDK setup
   - Prompt engineering
   - Function calling for structured output
   - Generate 3 reschedule options

5. ✅ **Notification system**
   - Resend integration
   - React Email templates
   - Email sending service
   - Notification logging

6. ✅ **Dashboard real-time updates**
   - React Query polling
   - Auto-refresh (30 seconds)
   - Loading states
   - Error states

### Phase 3: Polish & Testing (Day 4)
**Goal:** Refine UX and ensure quality

1. ✅ **Reschedule approval workflow**
   - Instructor approval UI
   - Approval notifications
   - Status tracking
   - History view

2. ✅ **Analytics dashboard (admin)**
   - Key metrics
   - Charts (Recharts/Chart.js)
   - Date range filters
   - Export functionality

3. ✅ **Error handling and validation**
   - Input validation (Zod)
   - Error messages
   - Toast notifications
   - Form validation

4. ✅ **UI polish and responsive design**
   - Mobile optimization
   - Loading skeletons
   - Animations
   - Accessibility

5. ✅ **End-to-end testing**
   - Critical path tests
   - Unit tests
   - Integration tests
   - Manual testing

### Phase 4: Deployment & Demo (Day 5)
**Goal:** Deploy and prepare demo

1. ✅ **AWS Lambda weather check job**
   - Package Lambda function
   - EventBridge schedule
   - IAM permissions
   - CloudWatch logs

2. ✅ **Deploy to Vercel/Amplify**
   - Environment variables
   - Database connection
   - Domain configuration
   - SSL certificate

3. ✅ **Seed demo data**
   - Sample users
   - Sample bookings
   - Test scenarios
   - Reset script

4. ✅ **Record demo video**
   - Script preparation
   - Screen recording
   - Voiceover
   - Editing

5. ✅ **Documentation**
   - README.md
   - .env.example
   - Setup instructions
   - API documentation

---

## Installation & Quick Start

### Prerequisites
- Node.js 20.x LTS
- PostgreSQL 15.x
- pnpm (recommended) or npm
- Git
- AWS account (for production)

### Local Development Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd skyshift

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start PostgreSQL (if using Docker)
docker run --name skyshift-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=skyshift -p 5432:5432 -d postgres:15

# 5. Initialize database
pnpm prisma generate
pnpm prisma migrate dev --name init

# 6. Seed database (optional)
pnpm prisma db seed

# 7. Start development server
pnpm dev

# 8. Open http://localhost:3000
```

### VS Code Extensions (Recommended)
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Prisma
- GitLens
- Error Lens
- Better Comments

---

## Key Packages & Dependencies

```json
{
  "dependencies": {
    // Core
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    
    // Backend & API
    "@trpc/server": "^10.45.0",
    "@trpc/client": "^10.45.0",
    "@trpc/react-query": "^10.45.0",
    "@tanstack/react-query": "^5.0.0",
    
    // Database & ORM
    "@prisma/client": "^5.7.0",
    "prisma": "^5.7.0",
    
    // Validation
    "zod": "^3.22.0",
    
    // AI & External APIs
    "ai": "^3.0.0",
    "openai": "^4.20.0",
    "axios": "^1.6.0",
    
    // Authentication
    "next-auth": "^5.0.0",
    "@auth/prisma-adapter": "^1.0.0",
    "bcryptjs": "^2.4.3",
    
    // Email
    "resend": "^3.0.0",
    "react-email": "^2.0.0",
    "@react-email/components": "^0.0.12",
    
    // UI Components
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-toast": "^1.1.5",
    "lucide-react": "^0.300.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    
    // State Management
    "zustand": "^4.4.0",
    
    // Utilities
    "date-fns": "^3.0.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    // Testing
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.5",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    
    // Linting & Formatting
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.9",
    
    // Types
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

---

## Performance Targets

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| **Page Load (Dashboard)** | < 2s | Lighthouse |
| **API Response (Flights List)** | < 200ms | CloudWatch |
| **API Response (Create Booking)** | < 500ms | CloudWatch |
| **AI Generation (3 options)** | < 5s | Custom metric |
| **Weather API Call** | < 1s | CloudWatch |
| **Database Query** | < 100ms | Prisma metrics |
| **Email Send** | < 2s | Resend dashboard |
| **Lambda Cold Start** | < 3s | CloudWatch |

**Optimization Strategies:**
- React Query caching with `staleTime` and `gcTime`
- Database indexing on frequently queried fields
- tRPC batching for multiple queries
- Image optimization with Next.js Image
- Code splitting and lazy loading
- API route caching where appropriate
- Connection pooling for database
- Lambda keep-warm strategy

---

## Security Checklist

### Authentication & Authorization
- ✅ Secure password hashing (bcrypt via NextAuth)
- ✅ HTTP-only cookies for sessions
- ✅ CSRF protection (NextAuth built-in)
- ✅ Role-based access control (STUDENT, INSTRUCTOR, ADMIN)
- ✅ Server-side permission checks in tRPC procedures
- ✅ Protected API routes
- ✅ Session expiration (30 days)

### Data Protection
- ✅ Environment variables for sensitive keys
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Input validation (Zod schemas)
- ✅ XSS prevention (React's built-in escaping)
- ✅ Rate limiting on API routes (future)
- ✅ HTTPS only in production
- ✅ Audit logs for all booking changes

### AWS Security
- ✅ RDS encryption at rest
- ✅ SSL/TLS for database connections
- ✅ Security groups restricting access
- ✅ IAM roles with least privilege
- ✅ S3 bucket not publicly accessible
- ✅ Lambda environment variables encrypted
- ✅ Secrets Manager for sensitive data

### Compliance
- ✅ Data retention policies
- ✅ User data deletion capability
- ✅ Audit trail for all actions
- ✅ Privacy policy (required)
- ✅ Terms of service (required)

---

## Cost Estimates

### Development/Demo (Free Tier)
| Service | Cost |
|---------|------|
| Vercel | Free |
| PostgreSQL (local) | Free |
| OpenAI GPT-4o-mini (~100k tokens) | ~$5 |
| OpenWeatherMap | Free (1k calls/day) |
| Resend | Free (3k emails/month) |
| **Total** | **~$5/month** |

### Production (Low Traffic - 100 users)
| Service | Cost |
|---------|------|
| AWS RDS (db.t3.micro) | $15 |
| AWS Lambda (10k invocations) | ~$5 |
| AWS S3 (10GB storage) | $1 |
| AWS SES (1k emails) | $1 |
| OpenAI GPT-4o (~500k tokens) | $20-50 |
| Domain + SSL | $12/year (~$1/month) |
| **Total** | **~$45-75/month** |

### Scaling (1000 users)
| Service | Cost |
|---------|------|
| AWS RDS (db.t3.small, Multi-AZ) | $60 |
| AWS Lambda (100k invocations) | $15 |
| AWS S3 (100GB storage) | $5 |
| AWS SES (10k emails) | $10 |
| OpenAI GPT-4o (~5M tokens) | $100-200 |
| CloudWatch | $10 |
| **Total** | **~$200-300/month** |

---

## Success Criteria Checklist

Based on Project Overview requirements:

- [ ] **Weather conflicts** automatically detected using student training level
- [ ] **Notifications** sent via email to students and instructors
- [ ] **AI generates 3 valid rescheduling options** with weather forecasts
- [ ] **Database** updates bookings and logs all actions
- [ ] **Dashboard** displays live alerts and flight statuses
- [ ] **AI logic** considers Student Pilot vs. Instrument Rated minimums
- [ ] **Background job** runs hourly weather checks
- [ ] **Demo video** recorded (5-10 minutes)
- [ ] **GitHub repository** with README and .env.example

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Database Connection Issues
```bash
# Problem: Cannot connect to database
# Solution: Check DATABASE_URL and PostgreSQL is running
psql -U postgres -d skyshift  # Test connection
docker ps  # Check if container running
```

#### Prisma Schema Changes
```bash
# Problem: Schema changes not reflected
# Solution: Generate Prisma client after changes
pnpm prisma generate
pnpm prisma migrate dev
```

#### NextAuth Session Issues
```bash
# Problem: Session not working
# Solution: Check NEXTAUTH_SECRET and NEXTAUTH_URL
# Generate new secret:
openssl rand -base64 32
```

#### tRPC Type Errors
```bash
# Problem: Type errors in tRPC
# Solution: Regenerate tRPC types
pnpm dev  # Restart dev server to regenerate types
```

#### Tailwind Classes Not Working
```bash
# Problem: Tailwind classes not applied
# Solution: Check tailwind.config.ts content paths
# Restart dev server
pnpm dev
```

---

## Support & Resources

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod](https://zod.dev)

### Community & Support
- Next.js Discord
- tRPC Discord
- Prisma Discord
- GitHub Discussions
- Stack Overflow

### Useful Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [Thunder Client](https://www.thunderclient.com/) - API testing
- [React DevTools](https://react.dev/learn/react-developer-tools) - React debugging
- [TanStack Query DevTools](https://tanstack.com/query/latest/docs/react/devtools) - Query debugging

---

## Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2025-11-08 | Initial stack finalized with comprehensive documentation | Based on project requirements and best practices |

---

## Summary

This comprehensive tech stack document provides:

✅ **Detailed Best Practices** for each technology  
✅ **Known Limitations** to be aware of  
✅ **Conventions** for consistent code organization  
✅ **Common Pitfalls** to avoid during development  
✅ **Performance Targets** and optimization strategies  
✅ **Security Checklist** for production readiness  
✅ **Cost Estimates** for budgeting  
✅ **Troubleshooting Guide** for common issues  

**Ready to Build! 🚀**

This stack is optimized for rapid development within the 3-5 day timeline while maintaining production-quality standards. All choices are battle-tested, well-documented, and designed to work together seamlessly.

**Next Step:** Follow the Phase 1 setup instructions to get started!
