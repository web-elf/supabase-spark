## Plan: Make Generated ZIP a Complete, Runnable Vite + React Project

The generated frontend ZIP currently only outputs `App.tsx`, `Login.tsx`, and CRUD list pages. It's missing all the scaffolding needed to actually run. Here's what needs to be added to `src/lib/generator.ts` inside the `generateFrontendFiles` function.

### Missing files to generate

The `generateFrontendFiles` function will be expanded to also emit these files inside the `frontend/` directory:

1. `**package.json**` -- includes React, React DOM, React Router, @supabase/supabase-js, Lucide React, Tailwind CSS v4, Vite, @vitejs/plugin-react, TypeScript, and standard `dev`/`build`/`preview` scripts
2. `**index.html**` -- root HTML with `<div id="root">` and `<script type="module" src="/src/main.tsx">`
3. `**src/main.tsx**` -- mounts `<App />` into `#root`, imports `index.css`
4. `**src/lib/supabase.ts**` -- creates and exports Supabase client using `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. `**src/index.css**` -- Tailwind v4 import (`@import "tailwindcss"`)
6. `**vite.config.ts**` -- minimal Vite config with React plugin and `@` path alias
7. `**tsconfig.json**` + `**tsconfig.app.json**` -- standard TypeScript config for Vite + React
8. `**postcss.config.js**` -- (not needed for Tailwind v4, which uses `@import "tailwindcss"` directly)
9. `**.env.example**` -- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders
10. `**src/pages/Signup.tsx**` -- currently imported in App.tsx when `loginSignup` is enabled but never generated
11. `**src/pages/Dashboard.tsx**` -- currently imported in App.tsx when `roleDashboards` is enabled but never generated

### Technical approach

All changes are in **one file**: `src/lib/generator.ts`, specifically the `generateFrontendFiles` function. We will add ~15 new `files.push(...)` calls to emit the scaffolding files listed above. The generated files use Tailwind CSS v4 (simple `@import "tailwindcss"` in CSS, no `tailwind.config` needed).

### Key details

- All generated frontend files go under `frontend/` prefix in the ZIP
- The `supabase.ts` client reads from env vars so the user just fills in `.env`
- Missing page components (`Signup`, `Dashboard`) get functional placeholder implementations
- `package.json` pins stable versions of all dependencies
  ## **Database Trigger for Auto-Organization:**
  - **Action:** Add a PostgreSQL function and trigger to the SQL generation logic.
  - **Logic:** When a new user is created in `auth.users`, automatically `INSERT` a corresponding record into `public.organizations` using the `new.id` as the `owner_id`.
  - **Why:** This ensures every user has a "Home Organization" immediately upon signup, preventing foreign key violations on `organization_id`.
  ## **Global Organization Context & Hook:**
  - **Action:** Generate `src/hooks/useOrganization.ts`.
  - **Logic:** Create a hook that fetches the user's `organization_id` from the `organizations` table on app load and stores it in memory.
  - **Why:** Centralizes the ID so that all pages can access it without redundant database calls.
  ## **Automatic Query Injection:**
  - **Action:** Update the CRUD page templates (`ProductsList`, `SalesList`, etc.).
  - **Logic:** Every `.from().select()` and `.from().insert()` call must automatically include the `organization_id` filter (e.g., `.eq('organization_id', orgId)` or `.insert({ ..., organization_id: orgId })`).
  - **Why:** Guarantees that data is isolated between users and satisfies `NOT NULL` constraints.