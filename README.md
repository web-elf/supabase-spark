<div align="center">

# ⚡ Supabase Factory

**A visual project generator for Supabase backends.**

Design your schema, roles, and features in a wizard UI — export production-ready SQL migrations, Edge Functions, and a React frontend skeleton as a downloadable ZIP.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e.svg)](https://supabase.com/)

</div>

---

## What It Does

Supabase Factory is a browser-based tool that helps you scaffold a full Supabase project in minutes instead of hours. You configure everything visually — tables, columns, relationships, roles, RLS policies, and optional modules — then generate and download a complete project.

### Generated Output

| Category | Files |
|---|---|
| **SQL Migrations** | Core schema, RBAC roles, RLS policies, + optional modules (audit logs, soft delete, storage, rate limiting, multi-tenancy, logging, feature flags, background jobs) |
| **Edge Functions** | CRUD endpoints per table with auth, validation, search & pagination |
| **Frontend Skeleton** | React + Tailwind pages: auth, role dashboards, CRUD views |
| **Documentation** | README, API docs, architecture guide, `.env.example` |

### Feature Modules (Toggle On/Off)

- **Authentication** — Email/password auth with Supabase Auth
- **Timestamps** — Auto `created_at` & `updated_at` columns
- **Soft Delete** — `deleted_at` column + filtered views
- **Audit Logs** — Trigger-based change tracking on all tables
- **File Uploads** — Storage bucket setup with RLS
- **Rate Limiting** — Per-endpoint limits with IP & user tracking
- **Multi-Tenancy** — Organization-based tenant isolation via RLS
- **Feature Flags** — Toggleable flags with admin management
- **Background Jobs** — Job queue with retry logic & workers
- **Centralized Logging** — Activity logs, error logs, API metrics
- **API Integrations** — HTTP client, retry logic, webhook templates

### Pre-Built Templates

Start from scratch or pick a template:
- **SaaS CRM** — Multi-tenant CRM with deals, activities, notes
- **E-Commerce** — Products, inventory, orders, payments
- **Blog/CMS** — Posts, comments, tags, media
- **Project Management** — Workspaces, boards, tasks
- **Learning Management** — Courses, lessons, enrollments, progress

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (or [Bun](https://bun.sh/))
- A [Supabase](https://supabase.com/) project (free tier works fine)

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/supabase-factory.git
cd supabase-factory

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase project URL and anon key

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (from Settings → API) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |

> **Note:** Auth and project saving require a Supabase backend. You can still use the generator without one — just skip sign-in and use the wizard directly.

---

## Project Structure

```
src/
├── components/
│   ├── wizard/          # Wizard step components
│   │   ├── StepProjectInfo.tsx   # Project name, features toggles
│   │   ├── StepTables.tsx        # Table & column editor
│   │   ├── StepRelationships.tsx # Foreign key relationships
│   │   ├── StepRoles.tsx         # RBAC role permissions
│   │   ├── StepApi.tsx           # API endpoint config
│   │   ├── StepFrontend.tsx      # Frontend skeleton options
│   │   ├── TemplatePicker.tsx    # Pre-built template selection
│   │   └── JsonEditor.tsx        # Raw JSON config editor
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── generator.ts     # Core: generates all output files
│   └── templates.ts     # Pre-built project templates
├── types/
│   └── project.ts       # TypeScript types for ProjectConfig
├── pages/
│   ├── Index.tsx         # Landing page
│   ├── Editor.tsx        # Wizard / JSON editor
│   ├── Output.tsx        # File viewer & ZIP download
│   ├── Dashboard.tsx     # Saved projects (requires auth)
│   └── Auth.tsx          # Sign in / Sign up
├── contexts/
│   └── AuthContext.tsx   # Supabase auth state
└── test/                 # Vitest test files
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 8080 |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run preview` | Preview production build locally |

---

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Backend:** Supabase (Auth + Postgres + Storage)
- **Testing:** Vitest + Testing Library
- **Animations:** Framer Motion
- **ZIP Export:** JSZip + FileSaver

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

### Quick Ways to Contribute

- **Add a template** — Add a new pre-built project config to `src/lib/templates.ts`
- **Fix SQL generation** — Improve the output of `src/lib/generator.ts`
- **Add tests** — Help increase test coverage of the generator
- **Report bugs** — Open an issue with steps to reproduce

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

**Important:** This license applies only to the Supabase Factory tool itself (the source code in this repository). The code, SQL files, and projects **generated** by this tool (the ZIP files you download) are **NOT** covered by the GPL and are **NOT** derivative works. You may use the generated output under any license you choose, including proprietary/commercial licenses, without any GPL obligations.

**TL;DR:** The factory is GPL, but the products it makes are yours to license however you want.
