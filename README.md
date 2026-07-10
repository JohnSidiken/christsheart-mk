# Christ's Heart Makerere Church Site
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)

Public site + Admin dashboard for Christ's Heart Makerere.
Built with React + Vite + Supabase. No backend server needed.

**Goal**: Sunday Service Page + Announcements that non-technical staff can update.
**Live Demo**: [https://christsheart-mk.vercel.app]

## What’s in it
1. **Public /**: Header with church Logo and name, location + a prayer request form, rendered in the `/admin`
2. **Announcements**: Live data from Supabase table. Updates after refresh
3. **Events**: Upcoming events from Supabase table
4. **Admin /admin**: Password protected → Add/Edit/Delete announcements, Upcoming events
5. Member form, saves to Supabase, list of members on small phones and table on large screens

## Tech Stack
- **Frontend**: React 18 + Vite + React Router DOM
- **Database/API**: Supabase [Postgres + Auto REST API]
- **Styling**: Plain CSS, Mobile-first
- **Deploy**: Vercel
- **CLI**: `gh` CLI for repo + push from Termux/CLI.

## 1. Supabase Setup [Do this first]

1. Go to supabase.com → Create free project
2. **SQL Editor** → Run this to create tables:
<details>
<summary>Tap to view tables' schema</summary>

```sql
-- Announcements table

create table public.announcements (
  id bigint generated always as identity not null,
  content text not null,
  created_at timestamp with time zone null default now(),
  constraint announcements_pkey primary key (id)
) TABLESPACE pg_default;

-- Events table

create table public.events (
  id uuid not null default gen_random_uuid(),
  title text not null,
  description text null,
  event_date timestamp with time zone null,
  photo_url text null,
  created_at timestamp with time zone null default now(),
  created_by uuid null,
  photo_path text null,
  constraint events_pkey primary key (id),
  constraint events_created_by_fkey foreign KEY (created_by) references auth.users (id)
) TABLESPACE pg_default;

-- Members table

create table members (
  id bigint generated always as identity primary key,
  name text not null,
  phone text null,
  member_group text not null default 'Ordinary Member',
  created_at timestamptz not null default now()
);
```

</details>

## Project setup
<details>
<summary>Tap to view Project setup</summary>

```
.
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   ├── AuthContext.jsx
│   ├── Layout.jsx
│   ├── assets/
│   ├── lib/
│   │   └── supabase.js
│   └── pages/
│       ├── PublicPage.jsx
│       ├── AdminPanel.jsx # Password + CRUD form
│       ├── ProtectPage.jsx
│       └── LoginPage.jsx
├── index.html
├── .env # NOT committed to Git
├── .env.example # Template for new devs
├── .gitignore
└── README.md
```
</details>

## Local setup
```bash
pnpm install
pnpm dev
```
Then open in browser to preview