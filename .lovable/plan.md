

# Enhance Code Generation Engine -- Enterprise Modules

This upgrade transforms the backend generator into a modular, enterprise-grade system by adding 6 new toggleable modules and improving the overall output structure. No changes to pages, routing, dashboard, or wizard step layout.

## What Changes

### 1. Expand the ProjectFeatures type and defaults
Add new boolean flags to `ProjectFeatures` in `src/types/project.ts`:
- `rateLimiting` -- Rate limiting tables and middleware
- `multiTenancy` -- Organizations, tenant isolation via RLS
- `apiIntegrations` -- Integration framework with retry/webhook templates
- `logging` -- Centralized activity logs, error logs, API metrics
- `featureFlags` -- Feature flags table with admin-only management
- `backgroundJobs` -- Job queue table with status tracking and worker stubs

All default to `false` in `DEFAULT_FEATURES`.

### 2. Add feature toggle UI in StepProjectInfo
Add the 6 new features to the `FEATURE_LABELS` array in `src/components/wizard/StepProjectInfo.tsx` so they appear as toggleable switches alongside the existing ones. No layout changes -- they simply appear in the existing Features card.

### 3. Refactor generator into modular architecture
Restructure `src/lib/generator.ts` into a module-based pattern. Each module is a function that returns `GeneratedFile[]` and is called conditionally based on config flags.

The main `generateProject()` function becomes an orchestrator:

```text
generateProject(config)
  +-- generateCoreSchema(config)        --> migrations/001_core.sql
  +-- generateRolesSetup(config)        --> migrations/002_roles.sql  (if roles defined)
  +-- generateRLS(config)               --> migrations/003_rls.sql    (if roles defined)
  +-- generateOptionalModules(config)   --> migrations/004_*.sql      (conditional)
  |     +-- generateAuditLog            (if auditLogs)
  |     +-- generateSoftDelete          (if softDelete)
  |     +-- generateStorage             (if fileUploads)
  |     +-- generateRateLimiting        (if rateLimiting)
  |     +-- generateMultiTenancy        (if multiTenancy)
  |     +-- generateLogging             (if logging)
  |     +-- generateFeatureFlags        (if featureFlags)
  |     +-- generateBackgroundJobs      (if backgroundJobs)
  +-- generateSeed(config)              --> seed.sql
  +-- generateEdgeFunctions(config)     --> functions/*
  +-- generateIntegrationFramework()    --> integrations/* (if apiIntegrations)
  +-- generateFrontendFiles(config)     --> frontend/*  (if enabled, unchanged)
  +-- generateDocs(config)              --> README.md, API.md
```

### 4. New Module: Rate Limiting
Generated SQL (`migrations/004_rate_limiting.sql`):
- `api_rate_limits` table: endpoint, max_requests, window_seconds, role
- `request_logs` table: user_id, endpoint, ip_address, created_at with index
- Cleanup function to purge old request logs
- RLS: admin-only management, users can view own request logs

Generated edge function (`functions/rate-limiter/index.ts`):
- Middleware-style function checking IP-based and user-based limits
- Configurable per-endpoint thresholds
- Returns 429 with retry-after header when exceeded

### 5. New Module: Multi-Tenancy
Generated SQL (`migrations/004_multi_tenancy.sql`):
- `organizations` table: id, name, slug, owner_id, settings (JSONB)
- `organization_members` table: user_id, organization_id, role
- Helper functions: `is_tenant_member(org_id)`, `current_organization()`
- RLS policies enforcing tenant isolation on organizations and members tables
- Adds `organization_id UUID` column to all user-defined tables
- RLS policies updated to include tenant-scoped access

### 6. New Module: API Integration Framework
Generated files (category: `functions`):
- `integrations/base-client.ts` -- Generic HTTP client with timeout, headers, error handling
- `integrations/retry-wrapper.ts` -- Exponential backoff retry logic
- `integrations/webhook-handler.ts` -- Webhook signature verification template (HMAC-SHA256)
- `integrations/example-integration.ts` -- Complete example using the base client

### 7. New Module: Centralized Logging
Generated SQL (`migrations/004_logging.sql`):
- `activity_logs` table: user_id, action, resource_type, resource_id, metadata (JSONB)
- `error_logs` table: error_type, message, stack_trace, context (JSONB), severity
- `api_metrics` table: endpoint, method, status_code, duration_ms, user_id
- RLS: admin-only for error_logs and api_metrics, users see own activity_logs
- Index on created_at for all three tables

Generated edge function (`functions/api-logger/index.ts`):
- Middleware template that logs request duration, status codes, endpoint usage

### 8. New Module: Feature Flags
Generated SQL (`migrations/004_feature_flags.sql`):
- `feature_flags` table: key (unique), description, enabled, metadata (JSONB), created_by
- `is_feature_enabled(flag_key)` security definer function
- RLS: admin-only INSERT/UPDATE/DELETE, authenticated SELECT

### 9. New Module: Background Jobs
Generated SQL (`migrations/004_background_jobs.sql`):
- `jobs` table: id, type, payload (JSONB), status (enum: pending/processing/failed/completed), attempts, max_attempts, scheduled_at, started_at, completed_at, error, created_by
- `claim_job()` function using FOR UPDATE SKIP LOCKED for safe concurrent processing
- Index on status + scheduled_at for efficient queue queries
- RLS: admin can manage all, users can view own jobs

Generated edge function (`functions/job-worker/index.ts`):
- Worker stub that claims a job, processes it, and updates status
- Built-in retry logic with max_attempts tracking

### 10. Security Hardening
- Every generated table gets `ENABLE ROW LEVEL SECURITY` (already done, but now with explicit comments)
- Default deny policy comment added to each table explaining that without explicit policies, no access is granted
- All generated SQL includes security decision comments
- Environment variable template (`.env.example`) generated in docs category

### 11. Documentation Upgrade
The README generator is expanded to include:
- Architecture overview section listing all enabled modules
- Module-by-module explanation of what was generated
- Configuration guide for rate limiting, multi-tenancy, feature flags
- Deployment checklist (step-by-step)
- Security notes section

A new `ARCHITECTURE.md` file is generated documenting the module structure.

## Files Modified
1. **`src/types/project.ts`** -- Add 6 new feature flags to `ProjectFeatures` interface and defaults
2. **`src/components/wizard/StepProjectInfo.tsx`** -- Add 6 new entries to `FEATURE_LABELS` array
3. **`src/lib/generator.ts`** -- Major expansion: add ~8 new generator functions, refactor `generateProject()` orchestrator, expand `generateReadme()`, add `generateArchitectureDocs()`

## Files NOT Modified
- No changes to `Index.tsx`, `Dashboard.tsx`, `Editor.tsx`, `Output.tsx`, `Auth.tsx`, or any wizard step components other than `StepProjectInfo.tsx`
- No changes to routing, layout, or page structure
- No database schema changes (the app's own tables are unchanged)
- Frontend generation logic remains unchanged

