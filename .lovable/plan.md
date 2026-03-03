

## Plan: Fix Generator for Production-Ready Backend + Admin Frontend

### Problems Found

**1. Organizations table ordering bug (critical)**
When multi-tenancy is enabled, `001_core.sql` adds `organization_id UUID NOT NULL` to every table, but the `organizations` table itself is only created in `004+_multi_tenancy.sql`. The FK constraint fails because the referenced table doesn't exist yet.

**Fix**: In `generateCoreSchema`, when `multiTenancy` is enabled, emit the `organizations` and `organization_members` tables **before** the user-defined tables. Move the table creation + trigger from `generateMultiTenancyModule` into `generateCoreSchema`, and have the multi-tenancy module only emit the helper functions, RLS policies, and FK constraints.

**2. Admin role bootstrap is broken (critical)**
The `user_roles` table has an RLS policy that says "only admins can manage roles" via `has_role()`. But when the database is fresh, no one has any role yet -- so no one can ever assign the first admin. Classic chicken-and-egg.

**Fix**: Add a `seed.sql` instruction block that inserts the first admin role assignment using a comment explaining it must be run with service_role or via SQL editor. Also add a `FOR INSERT` policy on `user_roles` allowing users to self-assign if no admins exist yet (bootstrap policy).

**3. Missing owner-based RLS fallback**
When roles are defined, `003_rls.sql` only creates role-checked policies. A regular authenticated user who owns a record (via `user_id`) gets no access unless explicitly granted by a role. The `ownerClause` in the policy uses `OR auth.uid() = user_id` which is correct, but only within role-based policies -- if a user has NO role, none of these policies apply.

**Fix**: In `generateRLS`, add baseline owner-based policies for all tables (users can SELECT/UPDATE/DELETE their own rows via `user_id`, and INSERT with `auth.uid() = user_id`). These are separate from the role-based policies.

**4. CRUD pages have no Create/Edit UI**
The generated list pages only show a table with a Delete button. No way to add or edit records.

**Fix**: Expand the CRUD page template to include:
- A "New" button that opens an inline form at the top
- An "Edit" button per row that populates the form with existing data
- The form auto-generates input fields based on column types
- Admin-aware: if roles are configured, show a role indicator and admin-only actions

**5. No role-awareness in frontend**
The generated Dashboard and CRUD pages don't check the user's role. An admin sees the same UI as a regular user.

**Fix**: Generate a `useUserRole` hook that queries `user_roles` for the current user. Use it in Dashboard/CRUD pages to conditionally show admin controls (e.g., "Manage Roles" link, bulk operations).

### Changes (all in `src/lib/generator.ts`)

**`generateCoreSchema`** -- When `multiTenancy` is enabled, prepend the `organizations` and `organization_members` table definitions + auto-org trigger BEFORE iterating over user tables. Add the FK reference on `organization_id` columns inline.

**`generateMultiTenancyModule`** -- Remove the `CREATE TABLE organizations/organization_members` and trigger (now in core). Keep only the helper functions (`is_tenant_member`, `current_organization`), RLS policies for org tables, and FK index creation.

**`generateRolesSetup`** -- Add a bootstrap policy: `CREATE POLICY "Bootstrap first admin" ON user_roles FOR INSERT TO authenticated WITH CHECK (NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin'))`. This allows the first user to self-assign admin, then locks down.

**`generateRLS`** -- After role-based policies, add owner-based baseline policies for each table: SELECT/INSERT/UPDATE/DELETE where `auth.uid() = user_id`.

**`generateSeed`** -- Add a commented-out admin bootstrap block: `-- Run with service_role to bootstrap admin: INSERT INTO user_roles (user_id, role) VALUES ('<your-user-id>', 'admin');`

**`generateFrontendFiles`** -- New/updated files:
- `src/hooks/useUserRole.ts` -- queries `user_roles` for current user's role
- Update CRUD list pages to include Create form, Edit button, and role-aware admin controls
- Update Dashboard to show admin section (role management link, system stats) when user has admin role

