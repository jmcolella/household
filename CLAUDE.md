# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Household is a Next.js 16 task tracking app for folks who live together. The app uses PostgreSQL (via Supabase) for persistence, Supabase Auth for user authentication, React Query for data synchronization, and Shadcn for the UI.

## Technology Stack

- **Framework**: Next.js 16 with React 19
- **Database**: PostgreSQL with Drizzle ORM (hosted on Supabase)
- **Authentication**: Supabase Auth
- **Data Fetching**: TanStack React Query (v5)
- **Type Safety**: TypeScript 5 with strict mode

## Common Development Commands

### Running the Application
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint across the codebase
- `npm run env-dev` / `npm run env-prod` - Load environment configuration and regenerate Prisma client

## Architecture & Patterns

### Key Architectural Patterns

**API Response Wrapper**
All API routes return an `ApiResponse<T>` wrapper:
```typescript
interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

**React Query for Data Fetching**
- Custom hooks in `app/client/hooks/` wrap all API calls with React Query
- Cache invalidation happens via `useQuery` mutations
- Default stale time: 60 seconds, no refetch on window focus

**Client vs Server Components**
- Pages and most components use `"use client"` since they fetch user-specific data
- Server components are rare but exist in the layout structure
- Always check auth state client-side with `useGetUser()` hook

**CRITICAL RULE: Never Use Supabase Client in Client Components**

This is a **hard requirement** - violating this rule creates security vulnerabilities and breaks the architecture.

❌ **FORBIDDEN - Never do this:**
```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export default function MyComponent() {
  const supabase = createClient(); // ❌ SECURITY RISK
  const handleClick = async () => {
    await supabase.from('users').select(); // ❌ FORBIDDEN
  };
}
```

✅ **CORRECT - Always do this instead:**
```typescript
'use client';

export default function MyComponent() {
  const handleClick = async () => {
    // Use API routes or server actions
    await fetch('/api/my-endpoint'); // ✅ Correct
  };
}
```

**Why this matters:**
- Supabase client in client components exposes credentials to browser
- Bypasses API layer and breaks authentication/authorization
- Makes it impossible to audit data access
- Violates principle of least privilege

**How to handle common scenarios:**
- **Authentication**: Use API routes (`POST /api/auth/login`, etc.)
- **User data**: Fetch from `GET /api/auth/user`
- **Database queries**: Always go through API routes in `/api` folder
- **Real-time subscriptions**: Use server-sent events from API routes (if needed later)

**Backend Domain Structure: API → Reader/Writer → Database**
The backend follows a strict layered architecture to maintain separation of concerns:
- **API Routes** (`app/api/**/route.ts`): Handle HTTP requests only, never interact with Prisma directly
- **Reader/Writer Classes**: Abstract database access behind domain-specific classes
  - `Reader` class: Read-only database queries
  - `Writer` class: Write operations
  - Each table should have corresponding Reader/Writer classes
  - Classes must be located in `app/api/{domain}/`
- **Data Classes**: Reader/Writer must return data class abstractions, never raw Supabase models
  - Create domain-specific data classes (DTOs) that wrap Prisma models
  - Data classes provide a stable interface independent of database schema changes
- **No Direct Drizzle in API Routes**: API routes must never call Drizzle APIs directly
  - This keeps database logic isolated and testable
  - Changes to queries only require updating Reader/Writer classes

**Import Convention**
- **Enforce absolute imports** using `@/` alias (e.g., `@/app/components/Button`)
- ESLint rule prevents relative imports in the `app/` directory
- This applies everywhere in the codebase

**UI Component Library - STRICT RULES**

**ALWAYS use Shadcn components. NEVER use any other component library.**

✅ **ALLOWED:**
- Shadcn components from `@/components/ui/*`
- Radix UI primitives (via shadcn) from `@radix-ui/*`
- Lucide icons from `lucide-react`

❌ **FORBIDDEN - Never install or use:**
- `@base-ui/react` - NO. Use Radix UI via shadcn
- `sonner` - NO. Use shadcn toast
- `react-hot-toast` - NO. Use shadcn toast
- `@headlessui/react` - NO. Use shadcn/Radix
- `@mui/material` - NO. Use shadcn
- `antd` - NO. Use shadcn
- `chakra-ui` - NO. Use shadcn
- Any other component library - NO. Use shadcn

**Required utility packages (DO NOT remove):**
- `clsx` - Used by shadcn's `cn()` utility
- `tailwind-merge` - Used by shadcn's `cn()` utility
- `class-variance-authority` - Used by shadcn for variants

**When you need a component:**
1. Check if shadcn has it: https://ui.shadcn.com/docs/components
2. Install via: `npm exec shadcn@latest add [component-name]`
3. NEVER install from npm directly
4. NEVER use @base-ui - always use Radix UI (default shadcn)

**Frontend Patterns**
- **Abstract React Query Behind Custom Hooks**: All React Query usage must be wrapped in custom hooks (located in `app/client/hooks/`). Components should never call `useQuery` or `useMutation` directly.
- **Avoid useEffect**: Never use `useEffect` unless there is truly no other option. In the vast majority of cases, data fetching and state changes should be driven by user interactions (button clicks, form submissions) or be encapsulated in custom hooks. Direct effect-based logic is often a code smell.
- **Limit useCallback**: Only use `useCallback` for functions passed down as props to child components that are performance-sensitive. Even then, make a judgment call on whether the performance benefit is worth the added complexity. Don't use it defensively.
- **Avoid useMemo**: Never use `useMemo`. The codebase rarely involves computationally expensive operations that would justify memoization. If performance is a concern, refactor the code first before reaching for memoization.
- **Use `interface` for Props**: Define component props using TypeScript `interface`, not `type`. This is the idiomatic pattern for React component definitions.
- **Object Arguments for Multiple Parameters**: Functions and hooks with 3 or more arguments should accept a single object parameter with named key/value pairs instead. This improves readability and makes adding future parameters easier.
  ```typescript
  // ❌ Avoid
  function useData(bookId: string, includeEvents: boolean, sortBy: 'date' | 'page') {}

  // ✅ Prefer
  interface UseDataOptions {
    bookId: string;
    includeEvents?: boolean;
    sortBy?: 'date' | 'page';
  }
  function useData(options: UseDataOptions) {}
  ```
- **Avoid Type Casting**: Never use `as` type assertions or casting. Instead, create explicit types or use type discrimination. Type casting hides potential type safety issues and makes code harder to refactor.
  ```typescript
  // ❌ Avoid type casting
  const formValues = { name: "", goalType: undefined } as Values;

  // ✅ Prefer explicit interface with proper defaults
  interface Values {
    name: string;
    goalType: GoalType | undefined;
    targetValue: string;
    dateRange: [Dayjs, Dayjs] | undefined;
  }

  const defaultFormValues: Values = {
    name: "",
    goalType: undefined,
    targetValue: "",
    dateRange: undefined,
  };
  ```

## Important Implementation Notes

### TypeScript Strict Mode
- Strict mode enabled; all code must be properly typed
- Prisma generates types automatically
- Database types can be regenerated via Supabase schema types script

## ESLint Configuration

The project enforces:
- Next.js core web vitals rules
- TypeScript-specific rules
- **Absolute imports only** within the `app/` directory (no relative paths)
- `react/no-children-prop` configured to allow functions as children (React 19 pattern)

