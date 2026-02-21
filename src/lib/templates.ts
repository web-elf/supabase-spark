import { ProjectConfig, DEFAULT_FEATURES, DEFAULT_FRONTEND } from "@/types/project";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  config: ProjectConfig;
}

const col = (id: string, name: string, type: any, opts: any = {}) => ({
  id, name, type,
  isPrimary: opts.pk ?? false,
  isRequired: opts.req ?? true,
  isUnique: opts.uniq ?? false,
  isIndexed: opts.idx ?? false,
  ...(opts.def !== undefined ? { defaultValue: opts.def } : {}),
  ...(opts.ref ? { references: opts.ref } : {}),
});

const pk = (id: string, name = "id") => col(id, name, "uuid", { pk: true, req: true, uniq: true });
const fk = (id: string, name: string, table: string, column = "id") => col(id, name, "uuid", { req: true, idx: true, ref: { table, column } });
const txt = (id: string, name: string, opts: any = {}) => col(id, name, "text", { req: true, ...opts });
const optTxt = (id: string, name: string, opts: any = {}) => col(id, name, "text", { req: false, ...opts });

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // ─── SaaS CRM (Multi-Tenant) ───
  {
    id: "saas-crm",
    name: "SaaS CRM",
    description: "Multi-tenant CRM with customers, deals, activities, notes, and attachments. All tables scoped to organization_id.",
    icon: "📊",
    tags: ["Multi-Tenant", "CRM", "RBAC", "Audit Logs"],
    config: {
      projectName: "saas-crm",
      description: "A multi-tenant CRM backend with customers, deals, activities, notes, and file attachments. All data is scoped to organization_id with strict RLS.",
      features: {
        ...DEFAULT_FEATURES,
        multiTenancy: true,
        auditLogs: true,
        logging: true,
        featureFlags: true,
        rateLimiting: true,
        softDelete: true,
        fileUploads: true,
      },
      tables: [
        { id: "t1", name: "customers", columns: [
          pk("c1"), txt("c2", "name"), txt("c3", "email", { uniq: true, idx: true }),
          optTxt("c4", "phone"), optTxt("c5", "company"),
          fk("c6", "organization_id", "organizations"),
        ]},
        { id: "t2", name: "deals", columns: [
          pk("c10"), txt("c11", "title"), txt("c12", "stage", { def: "'prospecting'" }),
          col("c13", "value", "float", { req: false }),
          fk("c14", "customer_id", "customers"), fk("c15", "organization_id", "organizations"),
          fk("c16", "assigned_to", "auth.users"),
        ]},
        { id: "t3", name: "activities", columns: [
          pk("c20"), txt("c21", "type"), optTxt("c22", "note"),
          fk("c23", "deal_id", "deals"), fk("c24", "organization_id", "organizations"),
          fk("c25", "created_by", "auth.users"),
        ]},
        { id: "t4", name: "notes", columns: [
          pk("c30"), txt("c31", "body"),
          fk("c32", "deal_id", "deals"), fk("c33", "organization_id", "organizations"),
          fk("c34", "created_by", "auth.users"),
        ]},
        { id: "t5", name: "attachments", columns: [
          pk("c40"), txt("c41", "file_name"), txt("c42", "file_url"),
          optTxt("c43", "mime_type"),
          fk("c44", "deal_id", "deals"), fk("c45", "organization_id", "organizations"),
          fk("c46", "uploaded_by", "auth.users"),
        ]},
      ],
      relationships: [
        { id: "r1", from: { table: "customers", column: "id" }, to: { table: "deals", column: "customer_id" }, type: "1:N" },
        { id: "r2", from: { table: "deals", column: "id" }, to: { table: "activities", column: "deal_id" }, type: "1:N" },
        { id: "r3", from: { table: "deals", column: "id" }, to: { table: "notes", column: "deal_id" }, type: "1:N" },
        { id: "r4", from: { table: "deals", column: "id" }, to: { table: "attachments", column: "deal_id" }, type: "1:N" },
      ],
      roles: [
        { id: "role1", name: "owner", permissions: {
          customers: { select: true, insert: true, update: true, delete: true },
          deals: { select: true, insert: true, update: true, delete: true },
          activities: { select: true, insert: true, update: true, delete: true },
          notes: { select: true, insert: true, update: true, delete: true },
          attachments: { select: true, insert: true, update: true, delete: true },
        }},
        { id: "role2", name: "sales_manager", permissions: {
          customers: { select: true, insert: true, update: true, delete: false },
          deals: { select: true, insert: true, update: true, delete: false },
          activities: { select: true, insert: true, update: true, delete: false },
          notes: { select: true, insert: true, update: true, delete: false },
          attachments: { select: true, insert: true, update: true, delete: false },
        }},
        { id: "role3", name: "sales_rep", permissions: {
          customers: { select: true, insert: true, update: true, delete: false },
          deals: { select: true, insert: true, update: true, delete: false },
          activities: { select: true, insert: true, update: true, delete: false },
          notes: { select: true, insert: true, update: true, delete: false },
          attachments: { select: true, insert: true, update: false, delete: false },
        }},
      ],
      apiEndpoints: [
        { table: "customers", crud: true, search: true, filters: true, pagination: true },
        { table: "deals", crud: true, search: true, filters: true, pagination: true },
        { table: "activities", crud: true, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },

  // ─── Headless E-Commerce ───
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Production-ready headless e-commerce backend with products, categories, inventory, orders, and payments.",
    icon: "🛒",
    tags: ["Headless", "Inventory", "Payments", "Webhooks"],
    config: {
      projectName: "ecommerce-backend",
      description: "A headless e-commerce backend with product catalog, inventory tracking, order management, and payment processing. Includes webhook handler and fulfillment job.",
      features: {
        ...DEFAULT_FEATURES,
        rateLimiting: true,
        logging: true,
        backgroundJobs: true,
        apiIntegrations: true,
        auditLogs: true,
        softDelete: true,
      },
      tables: [
        { id: "t1", name: "categories", columns: [
          pk("c1"), txt("c2", "name", { uniq: true }), txt("c3", "slug", { uniq: true, idx: true }),
          optTxt("c4", "description"),
        ]},
        { id: "t2", name: "products", columns: [
          pk("c10"), txt("c11", "name"), txt("c12", "slug", { uniq: true, idx: true }),
          optTxt("c13", "description"),
          col("c14", "price", "float", { req: true }),
          col("c15", "compare_at_price", "float", { req: false }),
          txt("c16", "status", { def: "'draft'", idx: true }),
          fk("c17", "category_id", "categories"),
          optTxt("c18", "image_url"),
        ]},
        { id: "t3", name: "inventory", columns: [
          pk("c20"),
          fk("c21", "product_id", "products"),
          col("c22", "quantity", "int", { req: true, def: "0" }),
          col("c23", "reserved", "int", { req: true, def: "0" }),
          txt("c24", "warehouse", { def: "'default'" }),
        ]},
        { id: "t4", name: "orders", columns: [
          pk("c30"),
          fk("c31", "user_id", "auth.users"),
          txt("c32", "status", { def: "'pending'", idx: true }),
          col("c33", "total", "float", { req: true }),
          optTxt("c34", "shipping_address"),
          optTxt("c35", "notes"),
        ]},
        { id: "t5", name: "order_items", columns: [
          pk("c40"),
          fk("c41", "order_id", "orders"),
          fk("c42", "product_id", "products"),
          col("c43", "quantity", "int", { req: true, def: "1" }),
          col("c44", "unit_price", "float", { req: true }),
        ]},
        { id: "t6", name: "payments", columns: [
          pk("c50"),
          fk("c51", "order_id", "orders"),
          txt("c52", "provider", { def: "'stripe'" }),
          txt("c53", "status", { def: "'pending'", idx: true }),
          col("c54", "amount", "float", { req: true }),
          optTxt("c55", "provider_ref"),
        ]},
      ],
      relationships: [
        { id: "r1", from: { table: "categories", column: "id" }, to: { table: "products", column: "category_id" }, type: "1:N" },
        { id: "r2", from: { table: "products", column: "id" }, to: { table: "inventory", column: "product_id" }, type: "1:1" },
        { id: "r3", from: { table: "orders", column: "id" }, to: { table: "order_items", column: "order_id" }, type: "1:N" },
        { id: "r4", from: { table: "products", column: "id" }, to: { table: "order_items", column: "product_id" }, type: "1:N" },
        { id: "r5", from: { table: "orders", column: "id" }, to: { table: "payments", column: "order_id" }, type: "1:N" },
      ],
      roles: [
        { id: "role1", name: "admin", permissions: {
          categories: { select: true, insert: true, update: true, delete: true },
          products: { select: true, insert: true, update: true, delete: true },
          inventory: { select: true, insert: true, update: true, delete: true },
          orders: { select: true, insert: true, update: true, delete: true },
          order_items: { select: true, insert: true, update: true, delete: true },
          payments: { select: true, insert: true, update: true, delete: true },
        }},
        { id: "role2", name: "user", permissions: {
          categories: { select: true, insert: false, update: false, delete: false },
          products: { select: true, insert: false, update: false, delete: false },
          inventory: { select: true, insert: false, update: false, delete: false },
          orders: { select: true, insert: true, update: false, delete: false },
          order_items: { select: true, insert: true, update: false, delete: false },
          payments: { select: true, insert: false, update: false, delete: false },
        }},
      ],
      apiEndpoints: [
        { table: "products", crud: true, search: true, filters: true, pagination: true },
        { table: "orders", crud: true, search: true, filters: true, pagination: true },
        { table: "payments", crud: true, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },

  // ─── Blog Platform (unchanged) ───
  {
    id: "blog",
    name: "Blog Platform",
    description: "Posts, categories, comments, and author management.",
    icon: "✍️",
    tags: ["Content", "Comments", "Auth"],
    config: {
      projectName: "blog-platform",
      description: "A blog platform with posts, categories, comments, and author roles.",
      features: { ...DEFAULT_FEATURES, softDelete: true, auditLogs: true },
      tables: [
        { id: "t1", name: "posts", columns: [
          pk("c1"), txt("c2", "title"), txt("c3", "slug", { uniq: true, idx: true }),
          optTxt("c4", "content"), txt("c5", "status", { def: "'draft'", idx: true }),
          col("c6", "published_at", "timestamptz", { req: false }),
        ]},
        { id: "t2", name: "categories", columns: [
          pk("c7"), txt("c8", "name", { uniq: true }), txt("c9", "slug", { uniq: true, idx: true }),
        ]},
        { id: "t3", name: "comments", columns: [
          pk("c10"), fk("c11", "post_id", "posts"), txt("c12", "body"),
          txt("c13", "author_name"),
        ]},
      ],
      relationships: [
        { id: "r1", from: { table: "posts", column: "id" }, to: { table: "comments", column: "post_id" }, type: "1:N" },
        { id: "r2", from: { table: "categories", column: "id" }, to: { table: "posts", column: "id" }, type: "N:N" },
      ],
      roles: [
        { id: "role1", name: "admin", permissions: {
          posts: { select: true, insert: true, update: true, delete: true },
          categories: { select: true, insert: true, update: true, delete: true },
          comments: { select: true, insert: true, update: true, delete: true },
        }},
        { id: "role2", name: "author", permissions: {
          posts: { select: true, insert: true, update: true, delete: false },
          categories: { select: true, insert: false, update: false, delete: false },
          comments: { select: true, insert: false, update: false, delete: true },
        }},
      ],
      apiEndpoints: [
        { table: "posts", crud: true, search: true, filters: true, pagination: true },
        { table: "comments", crud: true, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND, enabled: true },
    },
  },

  // ─── Project Management (unchanged) ───
  {
    id: "project-mgmt",
    name: "Project Management",
    description: "Projects, tasks, teams, and time tracking.",
    icon: "📋",
    tags: ["Tasks", "Teams", "Multi-Tenant"],
    config: {
      projectName: "project-management",
      description: "Project management tool with tasks, team assignment, and time tracking.",
      features: { ...DEFAULT_FEATURES, multiTenancy: true, backgroundJobs: true, logging: true },
      tables: [
        { id: "t1", name: "projects", columns: [
          pk("c1"), txt("c2", "name"), optTxt("c3", "description"),
          txt("c4", "status", { def: "'active'", idx: true }),
          fk("c5", "organization_id", "organizations"),
        ]},
        { id: "t2", name: "tasks", columns: [
          pk("c6"), txt("c7", "title"), optTxt("c8", "description"),
          txt("c9", "status", { def: "'todo'", idx: true }),
          txt("c10", "priority", { def: "'medium'" }),
          fk("c11", "project_id", "projects"),
          col("c12", "assignee_id", "uuid", { req: false, idx: true }),
          col("c13", "due_date", "date", { req: false }),
          fk("c14", "organization_id", "organizations"),
        ]},
        { id: "t3", name: "time_entries", columns: [
          pk("c15"), fk("c16", "task_id", "tasks"),
          col("c17", "duration_minutes", "int", { req: true }),
          optTxt("c18", "note"),
          fk("c19", "organization_id", "organizations"),
        ]},
      ],
      relationships: [
        { id: "r1", from: { table: "projects", column: "id" }, to: { table: "tasks", column: "project_id" }, type: "1:N" },
        { id: "r2", from: { table: "tasks", column: "id" }, to: { table: "time_entries", column: "task_id" }, type: "1:N" },
      ],
      roles: [
        { id: "role1", name: "admin", permissions: {
          projects: { select: true, insert: true, update: true, delete: true },
          tasks: { select: true, insert: true, update: true, delete: true },
          time_entries: { select: true, insert: true, update: true, delete: true },
        }},
        { id: "role2", name: "member", permissions: {
          projects: { select: true, insert: false, update: false, delete: false },
          tasks: { select: true, insert: true, update: true, delete: false },
          time_entries: { select: true, insert: true, update: true, delete: true },
        }},
      ],
      apiEndpoints: [
        { table: "projects", crud: true, search: true, filters: true, pagination: true },
        { table: "tasks", crud: true, search: true, filters: true, pagination: true },
        { table: "time_entries", crud: true, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },

  // ─── SaaS Starter (Enterprise) ───
  {
    id: "saas-starter",
    name: "SaaS Starter",
    description: "Full multi-tenant SaaS starter with organizations, projects, tasks, subscriptions, and all enterprise modules.",
    icon: "🚀",
    tags: ["Multi-Tenant", "Enterprise", "Billing", "Feature Flags"],
    config: {
      projectName: "saas-starter",
      description: "A multi-tenant SaaS starter using all enterprise modules: multi-tenancy, rate limiting, feature flags, background jobs, audit logs, and billing-ready subscriptions.",
      features: {
        ...DEFAULT_FEATURES,
        multiTenancy: true,
        rateLimiting: true,
        logging: true,
        featureFlags: true,
        backgroundJobs: true,
        auditLogs: true,
        softDelete: true,
      },
      tables: [
        { id: "t1", name: "organization_members", columns: [
          pk("c1"),
          fk("c2", "organization_id", "organizations"),
          fk("c3", "user_id", "auth.users"),
          txt("c4", "role", { def: "'member'" }),
        ]},
        { id: "t2", name: "projects", columns: [
          pk("c10"), txt("c11", "name"), optTxt("c12", "description"),
          txt("c13", "status", { def: "'active'", idx: true }),
          fk("c14", "organization_id", "organizations"),
        ]},
        { id: "t3", name: "tasks", columns: [
          pk("c20"), txt("c21", "title"), optTxt("c22", "description"),
          txt("c23", "status", { def: "'todo'", idx: true }),
          txt("c24", "priority", { def: "'medium'" }),
          fk("c25", "project_id", "projects"),
          col("c26", "assignee_id", "uuid", { req: false, idx: true }),
          fk("c27", "organization_id", "organizations"),
        ]},
        { id: "t4", name: "subscriptions", columns: [
          pk("c30"),
          fk("c31", "organization_id", "organizations"),
          txt("c32", "plan", { def: "'free'", idx: true }),
          txt("c33", "status", { def: "'active'", idx: true }),
          col("c34", "expires_at", "timestamptz", { req: false }),
        ]},
      ],
      relationships: [
        { id: "r1", from: { table: "projects", column: "organization_id" }, to: { table: "tasks", column: "organization_id" }, type: "1:N" },
        { id: "r2", from: { table: "projects", column: "id" }, to: { table: "tasks", column: "project_id" }, type: "1:N" },
      ],
      roles: [
        { id: "role1", name: "owner", permissions: {
          organization_members: { select: true, insert: true, update: true, delete: true },
          projects: { select: true, insert: true, update: true, delete: true },
          tasks: { select: true, insert: true, update: true, delete: true },
          subscriptions: { select: true, insert: true, update: true, delete: true },
        }},
        { id: "role2", name: "admin", permissions: {
          organization_members: { select: true, insert: true, update: true, delete: false },
          projects: { select: true, insert: true, update: true, delete: true },
          tasks: { select: true, insert: true, update: true, delete: true },
          subscriptions: { select: true, insert: false, update: false, delete: false },
        }},
        { id: "role3", name: "member", permissions: {
          organization_members: { select: true, insert: false, update: false, delete: false },
          projects: { select: true, insert: false, update: false, delete: false },
          tasks: { select: true, insert: true, update: true, delete: false },
          subscriptions: { select: true, insert: false, update: false, delete: false },
        }},
      ],
      apiEndpoints: [
        { table: "projects", crud: true, search: true, filters: true, pagination: true },
        { table: "tasks", crud: true, search: true, filters: true, pagination: true },
        { table: "subscriptions", crud: true, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },

  // ─── POS & Inventory Management ───
  {
    id: "pos-inventory",
    name: "POS & Inventory",
    description: "Multi-tenant POS and inventory management for retail, restaurants, and service businesses. 17 tables with multi-branch support.",
    icon: "🏪",
    tags: ["Multi-Tenant", "POS", "Inventory", "Billing"],
    config: {
      projectName: "pos-inventory",
      description: "A comprehensive multi-tenant POS and inventory management backend. Supports multi-branch operations, stock movements, sales, purchases, expenses, and tax rates with role-based access for owners, managers, cashiers, and accountants.",
      features: {
        ...DEFAULT_FEATURES,
        multiTenancy: true,
        rateLimiting: true,
        logging: true,
        backgroundJobs: true,
        auditLogs: true,
        softDelete: true,
        featureFlags: true,
      },
      tables: [
        { id: "t1", name: "branches", columns: [
          pk("c1"), txt("c2", "name"), optTxt("c3", "address"), optTxt("c4", "phone"),
          fk("c5", "organization_id", "organizations"),
        ]},
        { id: "t2", name: "employees", columns: [
          pk("c10"), txt("c11", "name"), txt("c12", "email", { uniq: true, idx: true }),
          txt("c13", "role", { def: "'cashier'" }),
          fk("c14", "branch_id", "branches"), fk("c15", "organization_id", "organizations"),
        ]},
        { id: "t3", name: "customers", columns: [
          pk("c20"), txt("c21", "name"), optTxt("c22", "email"), optTxt("c23", "phone"),
          fk("c24", "organization_id", "organizations"),
        ]},
        { id: "t4", name: "suppliers", columns: [
          pk("c30"), txt("c31", "name"), optTxt("c32", "contact_name"),
          optTxt("c33", "email"), optTxt("c34", "phone"),
          fk("c35", "organization_id", "organizations"),
        ]},
        { id: "t5", name: "product_categories", columns: [
          pk("c40"), txt("c41", "name"),
          fk("c42", "organization_id", "organizations"),
        ]},
        { id: "t6", name: "products", columns: [
          pk("c50"), txt("c51", "name"), optTxt("c52", "sku", { uniq: true, idx: true }),
          col("c53", "price", "float", { req: true }),
          col("c54", "cost", "float", { req: false }),
          txt("c55", "unit", { def: "'pcs'" }),
          fk("c56", "category_id", "product_categories"),
          fk("c57", "organization_id", "organizations"),
        ]},
        { id: "t7", name: "inventory_batches", columns: [
          pk("c60"),
          fk("c61", "product_id", "products"), fk("c62", "branch_id", "branches"),
          col("c63", "quantity", "int", { req: true, def: "0" }),
          col("c64", "expiry_date", "date", { req: false }),
          fk("c65", "organization_id", "organizations"),
        ]},
        { id: "t8", name: "stock_movements", columns: [
          pk("c70"),
          fk("c71", "product_id", "products"), fk("c72", "branch_id", "branches"),
          txt("c73", "movement_type"), // 'in', 'out', 'adjustment', 'transfer'
          col("c74", "quantity", "int", { req: true }),
          optTxt("c75", "reason"),
          fk("c76", "organization_id", "organizations"),
        ]},
        { id: "t9", name: "tax_rates", columns: [
          pk("c80"), txt("c81", "name"),
          col("c82", "rate", "float", { req: true }),
          col("c83", "is_active", "boolean", { req: true, def: "true" }),
          fk("c84", "organization_id", "organizations"),
        ]},
        { id: "t10", name: "sales", columns: [
          pk("c90"),
          fk("c91", "branch_id", "branches"), fk("c92", "customer_id", "customers"),
          fk("c93", "employee_id", "employees"),
          txt("c94", "status", { def: "'completed'", idx: true }),
          col("c95", "subtotal", "float", { req: true }),
          col("c96", "tax_amount", "float", { req: true, def: "0" }),
          col("c97", "total", "float", { req: true }),
          fk("c98", "organization_id", "organizations"),
        ]},
        { id: "t11", name: "sale_items", columns: [
          pk("c100"),
          fk("c101", "sale_id", "sales"), fk("c102", "product_id", "products"),
          col("c103", "quantity", "int", { req: true }),
          col("c104", "unit_price", "float", { req: true }),
          col("c105", "discount", "float", { req: false, def: "0" }),
        ]},
        { id: "t12", name: "purchases", columns: [
          pk("c110"),
          fk("c111", "supplier_id", "suppliers"), fk("c112", "branch_id", "branches"),
          txt("c113", "status", { def: "'received'", idx: true }),
          col("c114", "total", "float", { req: true }),
          fk("c115", "organization_id", "organizations"),
        ]},
        { id: "t13", name: "purchase_items", columns: [
          pk("c120"),
          fk("c121", "purchase_id", "purchases"), fk("c122", "product_id", "products"),
          col("c123", "quantity", "int", { req: true }),
          col("c124", "unit_cost", "float", { req: true }),
        ]},
        { id: "t14", name: "expenses", columns: [
          pk("c130"), txt("c131", "category"), optTxt("c132", "description"),
          col("c133", "amount", "float", { req: true }),
          fk("c134", "branch_id", "branches"),
          fk("c135", "organization_id", "organizations"),
        ]},
        { id: "t15", name: "payments", columns: [
          pk("c140"),
          fk("c141", "sale_id", "sales"),
          txt("c142", "method", { def: "'cash'" }),
          col("c143", "amount", "float", { req: true }),
          optTxt("c144", "reference"),
          fk("c145", "organization_id", "organizations"),
        ]},
      ],
      relationships: [
        { id: "r1", from: { table: "branches", column: "id" }, to: { table: "employees", column: "branch_id" }, type: "1:N" },
        { id: "r2", from: { table: "product_categories", column: "id" }, to: { table: "products", column: "category_id" }, type: "1:N" },
        { id: "r3", from: { table: "products", column: "id" }, to: { table: "inventory_batches", column: "product_id" }, type: "1:N" },
        { id: "r4", from: { table: "products", column: "id" }, to: { table: "stock_movements", column: "product_id" }, type: "1:N" },
        { id: "r5", from: { table: "sales", column: "id" }, to: { table: "sale_items", column: "sale_id" }, type: "1:N" },
        { id: "r6", from: { table: "products", column: "id" }, to: { table: "sale_items", column: "product_id" }, type: "1:N" },
        { id: "r7", from: { table: "purchases", column: "id" }, to: { table: "purchase_items", column: "purchase_id" }, type: "1:N" },
        { id: "r8", from: { table: "products", column: "id" }, to: { table: "purchase_items", column: "product_id" }, type: "1:N" },
        { id: "r9", from: { table: "sales", column: "id" }, to: { table: "payments", column: "sale_id" }, type: "1:N" },
        { id: "r10", from: { table: "suppliers", column: "id" }, to: { table: "purchases", column: "supplier_id" }, type: "1:N" },
      ],
      roles: [
        { id: "role1", name: "owner", permissions: {
          branches: { select: true, insert: true, update: true, delete: true },
          employees: { select: true, insert: true, update: true, delete: true },
          customers: { select: true, insert: true, update: true, delete: true },
          suppliers: { select: true, insert: true, update: true, delete: true },
          product_categories: { select: true, insert: true, update: true, delete: true },
          products: { select: true, insert: true, update: true, delete: true },
          inventory_batches: { select: true, insert: true, update: true, delete: true },
          stock_movements: { select: true, insert: true, update: true, delete: true },
          tax_rates: { select: true, insert: true, update: true, delete: true },
          sales: { select: true, insert: true, update: true, delete: true },
          sale_items: { select: true, insert: true, update: true, delete: true },
          purchases: { select: true, insert: true, update: true, delete: true },
          purchase_items: { select: true, insert: true, update: true, delete: true },
          expenses: { select: true, insert: true, update: true, delete: true },
          payments: { select: true, insert: true, update: true, delete: true },
        }},
        { id: "role2", name: "manager", permissions: {
          branches: { select: true, insert: false, update: true, delete: false },
          employees: { select: true, insert: true, update: true, delete: false },
          customers: { select: true, insert: true, update: true, delete: false },
          suppliers: { select: true, insert: true, update: true, delete: false },
          product_categories: { select: true, insert: true, update: true, delete: false },
          products: { select: true, insert: true, update: true, delete: false },
          inventory_batches: { select: true, insert: true, update: true, delete: false },
          stock_movements: { select: true, insert: true, update: true, delete: false },
          tax_rates: { select: true, insert: true, update: true, delete: false },
          sales: { select: true, insert: true, update: true, delete: false },
          sale_items: { select: true, insert: true, update: true, delete: false },
          purchases: { select: true, insert: true, update: true, delete: false },
          purchase_items: { select: true, insert: true, update: true, delete: false },
          expenses: { select: true, insert: true, update: true, delete: false },
          payments: { select: true, insert: true, update: true, delete: false },
        }},
        { id: "role3", name: "cashier", permissions: {
          branches: { select: true, insert: false, update: false, delete: false },
          employees: { select: false, insert: false, update: false, delete: false },
          customers: { select: true, insert: true, update: true, delete: false },
          suppliers: { select: false, insert: false, update: false, delete: false },
          product_categories: { select: true, insert: false, update: false, delete: false },
          products: { select: true, insert: false, update: false, delete: false },
          inventory_batches: { select: true, insert: false, update: false, delete: false },
          stock_movements: { select: false, insert: false, update: false, delete: false },
          tax_rates: { select: true, insert: false, update: false, delete: false },
          sales: { select: true, insert: true, update: true, delete: false },
          sale_items: { select: true, insert: true, update: true, delete: false },
          purchases: { select: false, insert: false, update: false, delete: false },
          purchase_items: { select: false, insert: false, update: false, delete: false },
          expenses: { select: false, insert: false, update: false, delete: false },
          payments: { select: true, insert: true, update: false, delete: false },
        }},
        { id: "role4", name: "accountant", permissions: {
          branches: { select: true, insert: false, update: false, delete: false },
          employees: { select: true, insert: false, update: false, delete: false },
          customers: { select: true, insert: false, update: false, delete: false },
          suppliers: { select: true, insert: false, update: false, delete: false },
          product_categories: { select: true, insert: false, update: false, delete: false },
          products: { select: true, insert: false, update: false, delete: false },
          inventory_batches: { select: true, insert: false, update: false, delete: false },
          stock_movements: { select: true, insert: false, update: false, delete: false },
          tax_rates: { select: true, insert: false, update: false, delete: false },
          sales: { select: true, insert: false, update: false, delete: false },
          sale_items: { select: true, insert: false, update: false, delete: false },
          purchases: { select: true, insert: false, update: false, delete: false },
          purchase_items: { select: true, insert: false, update: false, delete: false },
          expenses: { select: true, insert: false, update: false, delete: false },
          payments: { select: true, insert: false, update: false, delete: false },
        }},
      ],
      apiEndpoints: [
        { table: "products", crud: true, search: true, filters: true, pagination: true },
        { table: "sales", crud: true, search: true, filters: true, pagination: true },
        { table: "purchases", crud: true, search: true, filters: true, pagination: true },
        { table: "inventory_batches", crud: true, search: false, filters: true, pagination: true },
        { table: "stock_movements", crud: true, search: false, filters: true, pagination: true },
        { table: "expenses", crud: true, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },

  // ─── API Platform ───
  {
    id: "api-platform",
    name: "API Platform",
    description: "API key authentication platform with hashed keys, per-key rate limits, usage logging, and admin management.",
    icon: "🔑",
    tags: ["API Keys", "Rate Limiting", "Analytics"],
    config: {
      projectName: "api-platform",
      description: "An API key authentication platform. Stores hashed API keys with per-key rate limits, request logging, and usage metrics. Includes middleware for key validation and 429 responses with retry-after headers.",
      features: {
        ...DEFAULT_FEATURES,
        rateLimiting: true,
        logging: true,
        auditLogs: true,
      },
      tables: [
        { id: "t1", name: "api_keys", columns: [
          pk("c1"), txt("c2", "key_hash", { idx: true }),
          txt("c3", "name"), txt("c4", "role", { def: "'api_user'" }),
          col("c5", "is_active", "boolean", { req: true, def: "true" }),
          fk("c6", "created_by", "auth.users"),
        ]},
        { id: "t2", name: "api_usage_limits", columns: [
          pk("c10"),
          fk("c11", "key_id", "api_keys"),
          col("c12", "max_requests", "int", { req: true, def: "1000" }),
          col("c13", "window_seconds", "int", { req: true, def: "3600" }),
        ]},
        { id: "t3", name: "request_logs", columns: [
          pk("c20"),
          fk("c21", "key_id", "api_keys"),
          txt("c22", "endpoint"), txt("c23", "method"),
          col("c24", "status_code", "int", { req: true }),
          col("c25", "duration_ms", "int", { req: false }),
        ]},
        { id: "t4", name: "api_metrics", columns: [
          pk("c30"),
          fk("c31", "key_id", "api_keys"),
          col("c32", "total_requests", "bigint", { req: true, def: "0" }),
          col("c33", "total_errors", "bigint", { req: true, def: "0" }),
          col("c34", "avg_duration_ms", "float", { req: false }),
          col("c35", "window_start", "timestamptz", { req: true }),
        ]},
      ],
      relationships: [
        { id: "r1", from: { table: "api_keys", column: "id" }, to: { table: "api_usage_limits", column: "key_id" }, type: "1:1" },
        { id: "r2", from: { table: "api_keys", column: "id" }, to: { table: "request_logs", column: "key_id" }, type: "1:N" },
        { id: "r3", from: { table: "api_keys", column: "id" }, to: { table: "api_metrics", column: "key_id" }, type: "1:N" },
      ],
      roles: [
        { id: "role1", name: "admin", permissions: {
          api_keys: { select: true, insert: true, update: true, delete: true },
          api_usage_limits: { select: true, insert: true, update: true, delete: true },
          request_logs: { select: true, insert: true, update: false, delete: true },
          api_metrics: { select: true, insert: true, update: true, delete: true },
        }},
        { id: "role2", name: "api_user", permissions: {
          api_keys: { select: true, insert: false, update: false, delete: false },
          api_usage_limits: { select: true, insert: false, update: false, delete: false },
          request_logs: { select: true, insert: false, update: false, delete: false },
          api_metrics: { select: true, insert: false, update: false, delete: false },
        }},
      ],
      apiEndpoints: [
        { table: "api_keys", crud: true, search: true, filters: true, pagination: true },
        { table: "request_logs", crud: false, search: true, filters: true, pagination: true },
        { table: "api_metrics", crud: false, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },
];
