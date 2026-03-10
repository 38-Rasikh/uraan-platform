# Uraan Web Platform

Student-volunteer web platform for **Rahbar**, a Project of **Uraan Society** of UET Lahore. It serves three audiences:

- **Public visitors / donors** — browse a filterable directory of Lahore orphanages, read about outreach projects, meet the team, connect as a volunteer, and verify organisations before donating.
- **Partner NGOs** — access publicly documented visit records and orphanage profiles.
- **Internal admins** — full CRUD management of orphanages, visits, projects, and team members via a password-protected admin panel.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS 3 · shadcn/ui · Supabase (PostgreSQL + Auth + RLS) · Recharts · Leaflet · ExcelJS

---

## Prerequisites

| Tool             | Minimum version | Notes                                                                                |
| ---------------- | --------------- | ------------------------------------------------------------------------------------ |
| Node.js          | **18.18**       | Required by Next.js 16. Use [nvm](https://github.com/nvm-sh/nvm) to switch versions. |
| npm              | **9**           | Comes with Node 18+. `pnpm` / `yarn` also work.                                      |
| Supabase account | —               | Free tier is sufficient. Create a project at [supabase.com](https://supabase.com).   |

> **No Docker required.** The database is hosted on Supabase.

---

## Quick Start

### 1. Clone and install

```bash
gh repo clone 38-Rasikh/uraan-platform
cd uraan-platform
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env.local
```

Fill in the three required values from **Supabase Dashboard → Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-side only — never expose publicly
```

### 3. Apply the database schema

In the Supabase Dashboard, open the **SQL Editor** and run the migration files in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/901_mock_data.sql        # optional — loads dev sample data
```

### 4. Create an admin user

In the Supabase Dashboard go to **Authentication → Users → Invite user** (or Add user) and create an account. That email/password that would be used to log in at `/admin/login`.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the public site.  
Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Other Commands

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `npm run build`      | Production build                      |
| `npm run start`      | Start production server (after build) |
| `npm run lint`       | ESLint                                |
| `npm run format`     | Prettier write                        |
| `npm test`           | Vitest unit tests                     |
| `npm run test:watch` | Vitest in watch mode                  |

---

## Updating an Existing Local Copy

If you already have the project cloned and running, pull the latest changes and restart:

```bash
git pull origin main
npm install        # picks up any new or updated dependencies
npm run dev
```

> If the database schema has changed, re-run any new migration files from `supabase/migrations/` in the Supabase SQL Editor after pulling.
