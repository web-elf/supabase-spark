import { describe, it, expect } from "vitest";
import { generateProject, GeneratedFile } from "@/lib/generator";
import { ProjectConfig, DEFAULT_FEATURES, DEFAULT_FRONTEND } from "@/types/project";

// ─── Test Helpers ────────────────────────────────────────────────────────────

/** Minimal valid config with one table and default features */
function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    projectName: "test-project",
    description: "A test project",
    features: { ...DEFAULT_FEATURES },
    tables: [
      {
        id: "t1",
        name: "posts",
        columns: [
          { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
          { id: "c2", name: "title", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
          { id: "c3", name: "body", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
        ],
      },
    ],
    relationships: [],
    roles: [],
    apiEndpoints: [],
    frontendOptions: { ...DEFAULT_FRONTEND },
    ...overrides,
  };
}

/** Find a generated file by path substring */
function findFile(files: GeneratedFile[], pathSubstring: string): GeneratedFile | undefined {
  return files.find((f) => f.path.includes(pathSubstring));
}

/** Find all generated files matching a path substring */
function findFiles(files: GeneratedFile[], pathSubstring: string): GeneratedFile[] {
  return files.filter((f) => f.path.includes(pathSubstring));
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

describe("generateProject — orchestrator", () => {
  it("returns at least core.sql, seed.sql, README, API.md, ARCHITECTURE.md, .env.example", () => {
    const files = generateProject(makeConfig());
    expect(findFile(files, "001_core.sql")).toBeDefined();
    expect(findFile(files, "seed.sql")).toBeDefined();
    expect(findFile(files, "README.md")).toBeDefined();
    expect(findFile(files, "API.md")).toBeDefined();
    expect(findFile(files, "ARCHITECTURE.md")).toBeDefined();
    expect(findFile(files, ".env.example")).toBeDefined();
  });

  it("does NOT generate roles migration when no roles are defined, but still generates RLS", () => {
    const files = generateProject(makeConfig({ roles: [] }));
    expect(findFile(files, "002_roles.sql")).toBeUndefined();
    // RLS is always generated (owner-based baseline)
    expect(findFile(files, "002_rls.sql")).toBeDefined();
  });

  it("generates roles + rls migrations when roles are defined", () => {
    const files = generateProject(
      makeConfig({
        roles: [
          {
            id: "r1",
            name: "admin",
            permissions: { posts: { select: true, insert: true, update: true, delete: true } },
          },
        ],
      })
    );
    expect(findFile(files, "002_roles.sql")).toBeDefined();
    expect(findFile(files, "003_rls.sql")).toBeDefined();
  });

  it("generates edge functions for API endpoints with crud enabled", () => {
    const files = generateProject(
      makeConfig({
        apiEndpoints: [
          { table: "posts", crud: true, search: false, filters: false, pagination: false },
        ],
      })
    );
    expect(findFile(files, "functions/posts/index.ts")).toBeDefined();
  });

  it("does NOT generate edge functions when crud is false", () => {
    const files = generateProject(
      makeConfig({
        apiEndpoints: [
          { table: "posts", crud: false, search: true, filters: true, pagination: true },
        ],
      })
    );
    expect(findFile(files, "functions/posts/index.ts")).toBeUndefined();
  });

  it("assigns sequential migration numbers to optional modules", () => {
    const files = generateProject(
      makeConfig({
        features: {
          ...DEFAULT_FEATURES,
          auditLogs: true,
          softDelete: true,
          fileUploads: true,
        },
        roles: [
          {
            id: "r1",
            name: "admin",
            permissions: { posts: { select: true, insert: true, update: true, delete: true } },
          },
        ],
      })
    );

    const sqlFiles = files.filter((f) => f.category === "sql" && f.path.startsWith("migrations/"));
    const paths = sqlFiles.map((f) => f.path);

    expect(paths).toContain("migrations/001_core.sql");
    expect(paths).toContain("migrations/002_roles.sql");
    expect(paths).toContain("migrations/003_rls.sql");
    // auditLogs → 004, softDelete → 005, fileUploads → 006
    expect(paths.some((p) => p.includes("004_"))).toBe(true);
    expect(paths.some((p) => p.includes("005_"))).toBe(true);
    expect(paths.some((p) => p.includes("006_"))).toBe(true);
  });
});

// ─── Core Schema ─────────────────────────────────────────────────────────────

describe("generateProject — core schema (001_core.sql)", () => {
  it("creates a table with correct column types", () => {
    const files = generateProject(makeConfig());
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("CREATE TABLE public.posts");
    expect(core.content).toContain("id UUID PRIMARY KEY DEFAULT gen_random_uuid()");
    expect(core.content).toContain("title TEXT NOT NULL");
  });

  it("enables RLS on every table", () => {
    const files = generateProject(makeConfig());
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;");
  });

  it("includes project name in header comment", () => {
    const files = generateProject(makeConfig({ projectName: "my-app" }));
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("Project: my-app");
  });

  it("adds user_id column when auth feature is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, auth: true } });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("user_id UUID REFERENCES auth.users(id)");
  });

  it("does NOT add user_id column when auth feature is disabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, auth: false } });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).not.toContain("user_id UUID REFERENCES auth.users(id)");
  });

  it("adds timestamp columns when timestamps feature is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, timestamps: true } });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("created_at TIMESTAMPTZ NOT NULL DEFAULT now()");
    expect(core.content).toContain("updated_at TIMESTAMPTZ NOT NULL DEFAULT now()");
    expect(core.content).toContain("update_updated_at_column");
  });

  it("adds deleted_at column when softDelete is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, softDelete: true } });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("deleted_at TIMESTAMPTZ");
  });

  it("creates indexes for indexed columns", () => {
    const config = makeConfig({
      tables: [
        {
          id: "t1",
          name: "users",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "email", type: "text", isPrimary: false, isRequired: true, isUnique: true, isIndexed: true },
          ],
        },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("CREATE INDEX idx_users_email ON public.users(email);");
  });

  it("adds UNIQUE constraint for unique columns", () => {
    const config = makeConfig({
      tables: [
        {
          id: "t1",
          name: "users",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "email", type: "text", isPrimary: false, isRequired: true, isUnique: true, isIndexed: false },
          ],
        },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("email TEXT NOT NULL UNIQUE");
  });

  it("adds DEFAULT value for columns with defaultValue", () => {
    const config = makeConfig({
      tables: [
        {
          id: "t1",
          name: "tasks",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "status", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false, defaultValue: "'pending'" },
          ],
        },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("status TEXT NOT NULL DEFAULT 'pending'");
  });
});

// ─── Foreign Key References ──────────────────────────────────────────────────

describe("generateProject — foreign key references", () => {
  it("generates REFERENCES clause for columns with references property", () => {
    const config = makeConfig({
      tables: [
        {
          id: "t1",
          name: "categories",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "name", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
          ],
        },
        {
          id: "t2",
          name: "products",
          columns: [
            { id: "c3", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c4", name: "category_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, references: { table: "categories", column: "id" } },
          ],
        },
      ],
      relationships: [
        { id: "r1", from: { table: "categories", column: "id" }, to: { table: "products", column: "category_id" }, type: "1:N" },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    // Should have REFERENCES in column definition
    expect(core.content).toContain("REFERENCES categories(id) ON DELETE CASCADE");
  });

  it("does NOT create duplicate FK column via ALTER TABLE when column exists in table definition", () => {
    const config = makeConfig({
      tables: [
        {
          id: "t1",
          name: "categories",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
          ],
        },
        {
          id: "t2",
          name: "products",
          columns: [
            { id: "c3", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c4", name: "category_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, references: { table: "categories", column: "id" } },
          ],
        },
      ],
      relationships: [
        { id: "r1", from: { table: "categories", column: "id" }, to: { table: "products", column: "category_id" }, type: "1:N" },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    // Should NOT have ALTER TABLE ... ADD COLUMN categories_id (duplicate)
    expect(core.content).not.toContain("ADD COLUMN categories_id");
  });

  it("creates ALTER TABLE FK for relationships without matching column definition", () => {
    const config = makeConfig({
      tables: [
        {
          id: "t1",
          name: "authors",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
          ],
        },
        {
          id: "t2",
          name: "books",
          columns: [
            { id: "c3", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c4", name: "title", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
          ],
        },
      ],
      relationships: [
        { id: "r1", from: { table: "authors", column: "id" }, to: { table: "books", column: "author_id" }, type: "1:N" },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    // Should have ALTER TABLE since books has no authors_id or author_id column
    expect(core.content).toContain("ALTER TABLE public.books ADD COLUMN authors_id UUID REFERENCES");
  });

  it("creates junction table for N:N relationships", () => {
    const config = makeConfig({
      tables: [
        {
          id: "t1",
          name: "students",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
          ],
        },
        {
          id: "t2",
          name: "courses",
          columns: [
            { id: "c2", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
          ],
        },
      ],
      relationships: [
        { id: "r1", from: { table: "students", column: "id" }, to: { table: "courses", column: "id" }, type: "N:N" },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    expect(core.content).toContain("CREATE TABLE public.students_courses");
    expect(core.content).toContain("students_id UUID REFERENCES");
    expect(core.content).toContain("courses_id UUID REFERENCES");
    expect(core.content).toContain("UNIQUE(students_id, courses_id)");
    expect(core.content).toContain("ALTER TABLE public.students_courses ENABLE ROW LEVEL SECURITY;");
  });
});

// ─── Roles & RLS ─────────────────────────────────────────────────────────────

describe("generateProject — roles and RLS", () => {
  const configWithRoles = makeConfig({
    roles: [
      {
        id: "r1",
        name: "admin",
        permissions: { posts: { select: true, insert: true, update: true, delete: true } },
      },
      {
        id: "r2",
        name: "viewer",
        permissions: { posts: { select: true, insert: false, update: false, delete: false } },
      },
    ],
  });

  it("creates app_role enum with all role names", () => {
    const files = generateProject(configWithRoles);
    const roles = findFile(files, "002_roles.sql")!;
    expect(roles.content).toContain("CREATE TYPE public.app_role AS ENUM ('admin', 'viewer')");
  });

  it("creates user_roles table", () => {
    const files = generateProject(configWithRoles);
    const roles = findFile(files, "002_roles.sql")!;
    expect(roles.content).toContain("CREATE TABLE public.user_roles");
  });

  it("creates has_role() security definer function", () => {
    const files = generateProject(configWithRoles);
    const roles = findFile(files, "002_roles.sql")!;
    expect(roles.content).toContain("CREATE OR REPLACE FUNCTION public.has_role");
    expect(roles.content).toContain("SECURITY DEFINER");
  });

  it("generates SELECT policy for role with select permission", () => {
    const files = generateProject(configWithRoles);
    const rls = findFile(files, "003_rls.sql")!;
    expect(rls.content).toContain('viewer_select_posts');
    expect(rls.content).toContain("FOR SELECT TO authenticated");
  });

  it("does NOT generate INSERT policy for role without insert permission", () => {
    const files = generateProject(configWithRoles);
    const rls = findFile(files, "003_rls.sql")!;
    expect(rls.content).not.toContain('viewer_insert_posts');
  });

  it("generates all CRUD policies for admin role", () => {
    const files = generateProject(configWithRoles);
    const rls = findFile(files, "003_rls.sql")!;
    expect(rls.content).toContain('admin_select_posts');
    expect(rls.content).toContain('admin_insert_posts');
    expect(rls.content).toContain('admin_update_posts');
    expect(rls.content).toContain('admin_delete_posts');
  });

  it("includes tenant clause in RLS when multiTenancy is enabled", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, multiTenancy: true },
      roles: [
        {
          id: "r1",
          name: "admin",
          permissions: { posts: { select: true, insert: false, update: false, delete: false } },
        },
      ],
    });
    const files = generateProject(config);
    const rls = findFile(files, "003_rls.sql")!;
    expect(rls.content).toContain("is_tenant_member(organization_id)");
  });
});

// ─── Multi-Tenancy Module ────────────────────────────────────────────────────

describe("generateProject — multi-tenancy module", () => {
  it("generates organizations and organization_members tables in core schema", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, multiTenancy: true } });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("CREATE TABLE public.organizations");
    expect(core.content).toContain("CREATE TABLE public.organization_members");
  });

  it("creates is_tenant_member() function", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, multiTenancy: true } });
    const files = generateProject(config);
    const mt = files.find((f) => f.path.includes("multi_tenancy"));
    expect(mt!.content).toContain("CREATE OR REPLACE FUNCTION public.is_tenant_member");
  });

  it("adds organization_id column in core schema when multiTenancy enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, multiTenancy: true } });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;
    expect(core.content).toContain("organization_id UUID NOT NULL");
  });

  it("does NOT duplicate organization_id when column already defined in table", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, multiTenancy: true },
      tables: [
        {
          id: "t1",
          name: "items",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "organization_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, references: { table: "organizations", column: "id" } },
          ],
        },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    // The column definition itself should appear exactly once in the CREATE TABLE block
    // (comments, indexes, etc. may also mention it — we only care about column definitions)
    // In the items CREATE TABLE block, organization_id should appear once as a column def
    // (the organizations table itself also has references to UUID, so we scope to the items table section)
    const itemsSection = core.content.split(/-- ── Table: items/)[1]?.split(/-- ── /)[0] || '';
    const columnDefMatches = itemsSection.match(/organization_id UUID/gm);
    expect(columnDefMatches?.length).toBe(1);
  });

  it("does NOT add duplicate FK constraint when column already references organizations", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, multiTenancy: true },
      tables: [
        {
          id: "t1",
          name: "items",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "organization_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, references: { table: "organizations", column: "id" } },
          ],
        },
      ],
    });
    const files = generateProject(config);
    const mt = files.find((f) => f.path.includes("multi_tenancy"));
    // Should NOT attempt to add FK constraint since the column already has one in the CREATE TABLE
    expect(mt!.content).not.toContain("fk_items_org");
  });
});

// ─── Optional Feature Modules ────────────────────────────────────────────────

describe("generateProject — optional modules", () => {
  it("generates audit log migration and trigger when auditLogs is enabled", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, auditLogs: true },
      roles: [{ id: "r1", name: "admin", permissions: { posts: { select: true, insert: true, update: true, delete: true } } }],
    });
    const files = generateProject(config);
    const audit = files.find((f) => f.path.includes("audit"));
    expect(audit).toBeDefined();
    expect(audit!.content).toContain("CREATE TABLE public.audit_logs");
    expect(audit!.content).toContain("audit_trigger_fn");
    expect(audit!.content).toContain("audit_posts");
  });

  it("generates soft delete views when softDelete is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, softDelete: true } });
    const files = generateProject(config);
    const sd = files.find((f) => f.path.includes("soft_delete"));
    expect(sd).toBeDefined();
    expect(sd!.content).toContain("CREATE VIEW public.posts_active");
    expect(sd!.content).toContain("WHERE deleted_at IS NULL");
  });

  it("generates storage bucket and policies when fileUploads is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, fileUploads: true } });
    const files = generateProject(config);
    const storage = files.find((f) => f.path.includes("storage"));
    expect(storage).toBeDefined();
    expect(storage!.content).toContain("INSERT INTO storage.buckets");
    expect(storage!.content).toContain("Users can upload files");
  });

  it("generates rate limiting tables and edge function when rateLimiting is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, rateLimiting: true } });
    const files = generateProject(config);
    const rl = files.find((f) => f.path.includes("rate_limiting"));
    expect(rl).toBeDefined();
    expect(rl!.content).toContain("CREATE TABLE public.api_rate_limits");
    expect(rl!.content).toContain("CREATE TABLE public.request_logs");

    const fn = findFile(files, "functions/rate-limiter");
    expect(fn).toBeDefined();
  });

  it("generates logging tables and edge function when logging is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, logging: true } });
    const files = generateProject(config);
    const log = files.find((f) => f.path.includes("logging"));
    expect(log).toBeDefined();
    expect(log!.content).toContain("CREATE TABLE public.activity_logs");
    expect(log!.content).toContain("CREATE TABLE public.error_logs");
    expect(log!.content).toContain("CREATE TABLE public.api_metrics");

    const fn = findFile(files, "functions/api-logger");
    expect(fn).toBeDefined();
  });

  it("generates feature flags table and helper function when featureFlags is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, featureFlags: true } });
    const files = generateProject(config);
    const ff = files.find((f) => f.path.includes("feature_flags"));
    expect(ff).toBeDefined();
    expect(ff!.content).toContain("CREATE TABLE public.feature_flags");
    expect(ff!.content).toContain("is_feature_enabled");
  });

  it("generates jobs table and worker function when backgroundJobs is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, backgroundJobs: true } });
    const files = generateProject(config);
    const jobs = files.find((f) => f.path.includes("background_jobs"));
    expect(jobs).toBeDefined();
    expect(jobs!.content).toContain("CREATE TABLE public.jobs");
    expect(jobs!.content).toContain("claim_job");

    const fn = findFile(files, "functions/job-worker");
    expect(fn).toBeDefined();
  });

  it("generates integration framework when apiIntegrations is enabled", () => {
    const config = makeConfig({ features: { ...DEFAULT_FEATURES, apiIntegrations: true } });
    const files = generateProject(config);
    const client = findFile(files, "base-client");
    expect(client).toBeDefined();
  });

  it("does NOT generate any optional module files when all features are off", () => {
    const config = makeConfig({
      features: {
        auth: false,
        softDelete: false,
        auditLogs: false,
        timestamps: false,
        notifications: false,
        fileUploads: false,
        searchPagination: false,
        rateLimiting: false,
        multiTenancy: false,
        apiIntegrations: false,
        logging: false,
        featureFlags: false,
        backgroundJobs: false,
      },
    });
    const files = generateProject(config);
    const sqlPaths = files.filter((f) => f.category === "sql").map((f) => f.path);

    // Should have core + rls + seed
    expect(sqlPaths).toContain("migrations/001_core.sql");
    expect(sqlPaths).toContain("migrations/002_rls.sql");
    expect(sqlPaths).toContain("seed.sql");
    expect(sqlPaths.length).toBe(3);
  });
});

// ─── Dynamic Admin Role ──────────────────────────────────────────────────────

describe("generateProject — dynamic admin role in module policies", () => {
  it("uses the first role containing 'admin' for has_role policies", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, auditLogs: true },
      roles: [
        { id: "r1", name: "superadmin", permissions: { posts: { select: true, insert: true, update: true, delete: true } } },
        { id: "r2", name: "viewer", permissions: { posts: { select: true, insert: false, update: false, delete: false } } },
      ],
    });
    const files = generateProject(config);
    const audit = files.find((f) => f.path.includes("audit"))!;
    expect(audit.content).toContain("has_role(auth.uid(), 'superadmin')");
    expect(audit.content).not.toContain("has_role(auth.uid(), 'admin')");
  });

  it("uses the first role containing 'owner' when no 'admin' role exists", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, featureFlags: true },
      roles: [
        { id: "r1", name: "owner", permissions: { posts: { select: true, insert: true, update: true, delete: true } } },
        { id: "r2", name: "member", permissions: { posts: { select: true, insert: false, update: false, delete: false } } },
      ],
    });
    const files = generateProject(config);
    const ff = files.find((f) => f.path.includes("feature_flags"))!;
    expect(ff.content).toContain("has_role(auth.uid(), 'owner')");
  });

  it("falls back to the first role when no 'admin' or 'owner' role exists", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, logging: true },
      roles: [
        { id: "r1", name: "manager", permissions: { posts: { select: true, insert: true, update: true, delete: true } } },
      ],
    });
    const files = generateProject(config);
    const log = files.find((f) => f.path.includes("logging"))!;
    expect(log.content).toContain("has_role(auth.uid(), 'manager')");
  });
});

// ─── Frontend Generation ─────────────────────────────────────────────────────

describe("generateProject — frontend files", () => {
  it("generates frontend files when frontendOptions.enabled is true", () => {
    const config = makeConfig({
      frontendOptions: { enabled: true, loginSignup: true, roleDashboards: true, crudPages: true },
    });
    const files = generateProject(config);
    const frontendFiles = files.filter((f) => f.category === "frontend");
    expect(frontendFiles.length).toBeGreaterThan(0);
  });

  it("does NOT generate frontend files when frontendOptions.enabled is false", () => {
    const config = makeConfig({ frontendOptions: { enabled: false, loginSignup: true, roleDashboards: true, crudPages: true } });
    const files = generateProject(config);
    const frontendFiles = files.filter((f) => f.category === "frontend");
    expect(frontendFiles.length).toBe(0);
  });
});

// ─── Multiple Tables ─────────────────────────────────────────────────────────

describe("generateProject — multiple tables", () => {
  it("creates separate CREATE TABLE statements for each table", () => {
    const config = makeConfig({
      tables: [
        {
          id: "t1",
          name: "users",
          columns: [{ id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false }],
        },
        {
          id: "t2",
          name: "posts",
          columns: [{ id: "c2", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false }],
        },
        {
          id: "t3",
          name: "comments",
          columns: [{ id: "c3", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false }],
        },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    expect(core.content).toContain("CREATE TABLE public.users");
    expect(core.content).toContain("CREATE TABLE public.posts");
    expect(core.content).toContain("CREATE TABLE public.comments");
    expect(core.content).toContain("ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;");
    expect(core.content).toContain("ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;");
    expect(core.content).toContain("ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;");
  });

  it("creates timestamp triggers for each table when timestamps enabled", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, timestamps: true },
      tables: [
        {
          id: "t1",
          name: "users",
          columns: [{ id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false }],
        },
        {
          id: "t2",
          name: "posts",
          columns: [{ id: "c2", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false }],
        },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    expect(core.content).toContain("update_users_updated_at");
    expect(core.content).toContain("update_posts_updated_at");
  });
});

// ─── Edge Cases ──────────────────────────────────────────────────────────────

describe("generateProject — edge cases", () => {
  it("handles empty table name gracefully", () => {
    const config = makeConfig({
      tables: [
        { id: "t1", name: "", columns: [] },
        {
          id: "t2",
          name: "posts",
          columns: [{ id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false }],
        },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    expect(core.content).not.toContain("CREATE TABLE public. (");
    expect(core.content).toContain("CREATE TABLE public.posts");
  });

  it("handles empty column name gracefully", () => {
    const config = makeConfig({
      tables: [
        {
          id: "t1",
          name: "posts",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
          ],
        },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    // Should skip the empty-named column
    expect(core.content).not.toContain("  TEXT NOT NULL");
    expect(core.content).toContain("id UUID");
  });

  it("skips duplicate user_id if table already defines user_id column", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, auth: true },
      tables: [
        {
          id: "t1",
          name: "reviews",
          columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "user_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, references: { table: "auth.users", column: "id" } },
          ],
        },
      ],
    });
    const files = generateProject(config);
    const core = findFile(files, "001_core.sql")!;

    // Should NOT have two user_id column definitions
    const columnDefMatches = core.content.match(/^\s+user_id UUID/gm);
    expect(columnDefMatches?.length).toBe(1);
  });

  it("generates all documentation files with project-specific content", () => {
    const config = makeConfig({ projectName: "my-cool-app" });
    const files = generateProject(config);

    const readme = findFile(files, "README.md")!;
    expect(readme.content).toContain("my-cool-app");

    const api = findFile(files, "API.md")!;
    expect(api.content.length).toBeGreaterThan(0);

    const arch = findFile(files, "ARCHITECTURE.md")!;
    expect(arch.content.length).toBeGreaterThan(0);

    const env = findFile(files, ".env.example")!;
    expect(env.content).toContain("SUPABASE");
  });
});

// ─── SQL Syntax Sanity ───────────────────────────────────────────────────────

describe("generateProject — SQL syntax sanity checks", () => {
  it("every CREATE TABLE has a closing );", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, multiTenancy: true, auditLogs: true, rateLimiting: true, logging: true, featureFlags: true, backgroundJobs: true },
      roles: [{ id: "r1", name: "admin", permissions: { posts: { select: true, insert: true, update: true, delete: true } } }],
    });
    const files = generateProject(config);
    const sqlFiles = files.filter((f) => f.category === "sql");

    for (const file of sqlFiles) {
      const createCount = (file.content.match(/CREATE TABLE/g) || []).length;
      const closeCount = (file.content.match(/^\);$/gm) || []).length;
      // Each CREATE TABLE should have a corresponding );
      // (approximate — some files may have sub-blocks, but should be >= createCount)
      if (createCount > 0) {
        expect(closeCount).toBeGreaterThanOrEqual(createCount);
      }
    }
  });

  it("every ALTER TABLE ... ENABLE ROW LEVEL SECURITY ends with semicolon", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, multiTenancy: true },
      roles: [{ id: "r1", name: "admin", permissions: { posts: { select: true, insert: true, update: true, delete: true } } }],
    });
    const files = generateProject(config);
    const sqlFiles = files.filter((f) => f.category === "sql");

    for (const file of sqlFiles) {
      const rlsLines = file.content.split("\n").filter((l) => l.includes("ENABLE ROW LEVEL SECURITY"));
      for (const line of rlsLines) {
        expect(line.trim().endsWith(";")).toBe(true);
      }
    }
  });

  it("all CREATE POLICY statements end with semicolon", () => {
    const config = makeConfig({
      features: { ...DEFAULT_FEATURES, auditLogs: true, rateLimiting: true, fileUploads: true, logging: true, featureFlags: true, backgroundJobs: true },
      roles: [{ id: "r1", name: "admin", permissions: { posts: { select: true, insert: true, update: true, delete: true } } }],
    });
    const files = generateProject(config);
    const sqlFiles = files.filter((f) => f.category === "sql");

    for (const file of sqlFiles) {
      const lines = file.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith("CREATE POLICY")) {
          // Find the end of this policy (line ending with ;)
          let j = i;
          while (j < lines.length && !lines[j].trim().endsWith(";")) {
            j++;
          }
          expect(j).toBeLessThan(lines.length); // Should find a semicolon
        }
      }
    }
  });
});
