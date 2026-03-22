# Household Task Manager

A Next.js 16 task management app for households with recurring reminders and PWA support.

## What's Been Built

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Next.js 16 project initialized with TypeScript and Tailwind CSS
- [x] Core dependencies installed (Drizzle ORM, Supabase, React Query)
- [x] Drizzle configuration with PostgreSQL
- [x] Database schema (6 tables) using VARCHAR enums instead of PostgreSQL enums
- [x] TypeScript enum constants and validators

### ✅ Phase 2: Authentication (COMPLETE)
- [x] Supabase client utilities (browser and server)
- [x] Login page (`/login`)
- [x] Signup page (`/signup`)
- [x] Auth callback route
- [x] Route protection middleware

### ✅ Phase 3: API Layer (COMPLETE)
- [x] Tasks API with Reader/Writer pattern
- [x] Task Executions API with Reader/Writer pattern
- [x] Households API for onboarding
- [x] All APIs follow architectural patterns (no direct Drizzle in routes)

### ✅ Phase 4: UI Foundation (COMPLETE)
- [x] Shadcn UI components installed
- [x] Custom color theme applied (#7B8CDE primary, #C0E6DE secondary, etc.)
- [x] Zain font from Google Fonts
- [x] React Query setup with providers

### ✅ Phase 5: Pages & Components (COMPLETE)
- [x] Dashboard page with today's and overdue tasks
- [x] Tasks list page
- [x] Create task form (one-time and recurring)
- [x] Settings page with sign out
- [x] Onboarding page for household creation
- [x] Reusable components (LoadingSpinner, ErrorMessage, EmptyState, BottomNav, TaskExecutionCard)

### ⏳ Phase 6: PWA Configuration (TODO)
- [ ] Install @ducanh2912/next-pwa
- [ ] Update next.config.ts with PWA config
- [ ] Create public/manifest.json
- [ ] Generate app icons

### ⏳ Phase 7: Deployment (TODO)
- [ ] Set up Vercel project
- [ ] Configure environment variables in Vercel
- [ ] Configure Supabase redirect URLs
- [ ] Deploy to production
- [ ] Test PWA installation on iOS/Android

## Getting Started

### Prerequisites

1. Create a Supabase project at https://app.supabase.com
2. Get your Supabase credentials from project settings

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (use `.env.example` as template):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=your_database_url_with_pooler
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Push database schema to Supabase:
```bash
npm run db:push
```

4. Run development server:
```bash
npm run dev
```

5. Open http://localhost:3000 and sign up!

## Architecture Highlights

### VARCHAR Enums (Not PostgreSQL Enums)
We use TypeScript constants + runtime validation instead of database enums for flexibility.

### Reader/Writer Pattern
All API routes delegate to domain-specific Reader/Writer classes - no direct Drizzle in routes.

### React Query Hooks
All data fetching wrapped in custom hooks - components never call `useQuery` directly.

## Database Schema

- **households** - Household groups
- **users** - Users (linked to Supabase auth + household)
- **tasks** - Task definitions
- **task_executions** - Task instances (OPEN, COMPLETED, CANCELLED)
- **reminders** - Recurring schedules (ACTIVE, PAUSED, DELETED)
- **reminder_schedules** - Cron schedules

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Next Steps

1. Add your Supabase credentials to `.env.local`
2. Run `npm run db:push` to create database tables
3. Test the app locally
4. Configure PWA (Phase 6)
5. Deploy to Vercel (Phase 7)
