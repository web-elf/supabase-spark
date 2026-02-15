

# Supabase Project Factory

A web-based code generator that takes any project specification and outputs a complete, production-ready Supabase backend with optional React frontend skeleton.

## Core Experience

### 1. Project Wizard (Visual Form + JSON Editor)
- **Step 1 - Project Info**: Name, description, optional features toggle (auth, soft delete, audit logs, timestamps, notifications, file uploads, search/pagination)
- **Step 2 - Tables & Columns**: Visual table builder where you define table names, columns with types (text, int, uuid, boolean, timestamp, etc.), and mark columns as required/unique/indexed
- **Step 3 - Relationships**: Visual relationship builder — select two tables and define 1:1, 1:N, or N:N relationships (auto-generates junction tables for N:N)
- **Step 4 - Roles & Permissions**: Define roles (admin, user, guest, etc.) and assign CRUD permissions per table per role via a matrix/grid UI
- **Step 5 - API & Endpoints**: Select which tables get auto-generated CRUD edge functions, search, filters, pagination
- **Step 6 - Frontend Options**: Toggle frontend skeleton generation — login/signup pages, role-based dashboards, CRUD pages per table
- **Raw JSON/YAML toggle**: Power users can switch to a raw editor view at any point to edit the full project config directly

### 2. Code Generation Engine
The core generator takes the project config and produces:

**Backend (primary focus):**
- SQL migration files: tables, columns, indexes, foreign keys, junction tables
- RLS policies auto-configured per role using the `has_role` security definer pattern
- Role enum and `user_roles` table with helper functions
- Optional triggers: audit logging on data changes, timestamp auto-updates, notification triggers
- Optional soft delete pattern (deleted_at column + filtered views)
- Optional storage bucket setup with RLS
- Seed data script with realistic sample data per table
- Edge function stubs for custom API endpoints

**Frontend (optional):**
- React + Tailwind component skeleton
- Auth pages (login/signup) with Supabase Auth
- Role-based dashboard layout
- Auto-generated CRUD pages per table (list, create, edit, detail views)
- Modular component structure

**Documentation:**
- README with setup instructions, customization guide
- API documentation in Markdown
- Role & permission summary

### 3. Output Viewer & Export
- **Tabbed code viewer**: Browse all generated files organized by category (SQL, Functions, Frontend, Docs) with syntax highlighting
- **Copy individual files**: One-click copy for any file
- **Download ZIP**: Export the entire project as a downloadable ZIP archive
- **Deployment checklist**: Step-by-step instructions for deploying to Supabase CLI

### 4. Input Validation & Smart Features
- Validates table/column names, detects conflicts (duplicate names, circular relationships)
- Warns about missing fields (e.g., table with no primary key, role with no permissions)
- Role & permission visualizer: a simple matrix/diagram showing which roles can do what on which tables

### 5. Saved Projects (Cloud)
- User authentication (login/signup)
- Save, load, duplicate, and edit project configs
- Project list dashboard to manage all your factory configs

## Pages
1. **Landing Page** — Hero explaining the tool, CTA to get started
2. **Dashboard** — List of saved projects, create new
3. **Project Editor** — The multi-step wizard with JSON toggle
4. **Output/Preview** — Generated code viewer with download option
5. **Auth Pages** — Login / Signup

## Backend Requirements (Supabase)
- **Auth**: Email/password signup for saving projects
- **Tables**: `projects` (stores project configs as JSON), `profiles`
- **RLS**: Users can only access their own projects
- **Storage**: Not needed for MVP (generated files are created client-side)

