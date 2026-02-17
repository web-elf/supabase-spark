import { ProjectConfig, DEFAULT_FEATURES, DEFAULT_FRONTEND } from "@/types/project";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  tags: string[];
  config: ProjectConfig;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "saas-crm",
    name: "SaaS CRM",
    description: "Multi-tenant CRM with leads, activities, roles, and rate limiting.",
    icon: "📊",
    tags: ["Multi-Tenant", "RBAC", "Rate Limiting"],
    config: {
      projectName: "saas-crm",
      description: "A multi-tenant SaaS CRM with lead management, activity tracking, and role-based access.",
      features: {
        ...DEFAULT_FEATURES,
        rateLimiting: true,
        multiTenancy: true,
        logging: true,
        backgroundJobs: true,
      },
      tables: [
        {
          id: "t1", name: "leads", columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "name", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c3", name: "email", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
            { id: "c4", name: "status", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, defaultValue: "'new'" },
            { id: "c5", name: "organization_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
          ],
        },
        {
          id: "t2", name: "contacts", columns: [
            { id: "c6", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c7", name: "name", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c8", name: "email", type: "text", isPrimary: false, isRequired: true, isUnique: true, isIndexed: true },
            { id: "c9", name: "phone", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
            { id: "c10", name: "organization_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
          ],
        },
        {
          id: "t3", name: "activities", columns: [
            { id: "c11", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c12", name: "type", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c13", name: "note", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
            { id: "c14", name: "lead_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
            { id: "c15", name: "organization_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
          ],
        },
      ],
      relationships: [
        { id: "r1", from: { table: "leads", column: "id" }, to: { table: "activities", column: "lead_id" }, type: "1:N" },
      ],
      roles: [
        {
          id: "role1", name: "admin", permissions: {
            leads: { select: true, insert: true, update: true, delete: true },
            contacts: { select: true, insert: true, update: true, delete: true },
            activities: { select: true, insert: true, update: true, delete: true },
          },
        },
        {
          id: "role2", name: "sales", permissions: {
            leads: { select: true, insert: true, update: true, delete: false },
            contacts: { select: true, insert: true, update: true, delete: false },
            activities: { select: true, insert: true, update: true, delete: false },
          },
        },
      ],
      apiEndpoints: [
        { table: "leads", crud: true, search: true, filters: true, pagination: true },
        { table: "contacts", crud: true, search: true, filters: true, pagination: true },
        { table: "activities", crud: true, search: true, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Product catalog, orders, customers, and inventory management.",
    icon: "🛒",
    tags: ["Products", "Orders", "Auth"],
    config: {
      projectName: "ecommerce-store",
      description: "An e-commerce backend with products, orders, customers, and inventory tracking.",
      features: {
        ...DEFAULT_FEATURES,
        fileUploads: true,
        logging: true,
        featureFlags: true,
      },
      tables: [
        {
          id: "t1", name: "products", columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "name", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c3", name: "description", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
            { id: "c4", name: "price", type: "float", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c5", name: "stock", type: "int", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false, defaultValue: "0" },
            { id: "c6", name: "category", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: true },
            { id: "c7", name: "image_url", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
          ],
        },
        {
          id: "t2", name: "customers", columns: [
            { id: "c8", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c9", name: "name", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c10", name: "email", type: "text", isPrimary: false, isRequired: true, isUnique: true, isIndexed: true },
            { id: "c11", name: "address", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
          ],
        },
        {
          id: "t3", name: "orders", columns: [
            { id: "c12", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c13", name: "customer_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
            { id: "c14", name: "status", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, defaultValue: "'pending'" },
            { id: "c15", name: "total", type: "float", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
          ],
        },
        {
          id: "t4", name: "order_items", columns: [
            { id: "c16", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c17", name: "order_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
            { id: "c18", name: "product_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
            { id: "c19", name: "quantity", type: "int", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false, defaultValue: "1" },
            { id: "c20", name: "unit_price", type: "float", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
          ],
        },
      ],
      relationships: [
        { id: "r1", from: { table: "customers", column: "id" }, to: { table: "orders", column: "customer_id" }, type: "1:N" },
        { id: "r2", from: { table: "orders", column: "id" }, to: { table: "order_items", column: "order_id" }, type: "1:N" },
        { id: "r3", from: { table: "products", column: "id" }, to: { table: "order_items", column: "product_id" }, type: "1:N" },
      ],
      roles: [
        {
          id: "role1", name: "admin", permissions: {
            products: { select: true, insert: true, update: true, delete: true },
            customers: { select: true, insert: true, update: true, delete: true },
            orders: { select: true, insert: true, update: true, delete: true },
            order_items: { select: true, insert: true, update: true, delete: true },
          },
        },
        {
          id: "role2", name: "user", permissions: {
            products: { select: true, insert: false, update: false, delete: false },
            customers: { select: true, insert: false, update: false, delete: false },
            orders: { select: true, insert: true, update: false, delete: false },
            order_items: { select: true, insert: true, update: false, delete: false },
          },
        },
      ],
      apiEndpoints: [
        { table: "products", crud: true, search: true, filters: true, pagination: true },
        { table: "orders", crud: true, search: true, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },
  {
    id: "blog",
    name: "Blog Platform",
    description: "Posts, categories, comments, and author management.",
    icon: "✍️",
    tags: ["Content", "Comments", "Auth"],
    config: {
      projectName: "blog-platform",
      description: "A blog platform with posts, categories, comments, and author roles.",
      features: {
        ...DEFAULT_FEATURES,
        softDelete: true,
        auditLogs: true,
      },
      tables: [
        {
          id: "t1", name: "posts", columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "title", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c3", name: "slug", type: "text", isPrimary: false, isRequired: true, isUnique: true, isIndexed: true },
            { id: "c4", name: "content", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
            { id: "c5", name: "status", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, defaultValue: "'draft'" },
            { id: "c6", name: "published_at", type: "timestamptz", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
          ],
        },
        {
          id: "t2", name: "categories", columns: [
            { id: "c7", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c8", name: "name", type: "text", isPrimary: false, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c9", name: "slug", type: "text", isPrimary: false, isRequired: true, isUnique: true, isIndexed: true },
          ],
        },
        {
          id: "t3", name: "comments", columns: [
            { id: "c10", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c11", name: "post_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
            { id: "c12", name: "body", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c13", name: "author_name", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
          ],
        },
      ],
      relationships: [
        { id: "r1", from: { table: "posts", column: "id" }, to: { table: "comments", column: "post_id" }, type: "1:N" },
        { id: "r2", from: { table: "categories", column: "id" }, to: { table: "posts", column: "id" }, type: "N:N" },
      ],
      roles: [
        {
          id: "role1", name: "admin", permissions: {
            posts: { select: true, insert: true, update: true, delete: true },
            categories: { select: true, insert: true, update: true, delete: true },
            comments: { select: true, insert: true, update: true, delete: true },
          },
        },
        {
          id: "role2", name: "author", permissions: {
            posts: { select: true, insert: true, update: true, delete: false },
            categories: { select: true, insert: false, update: false, delete: false },
            comments: { select: true, insert: false, update: false, delete: true },
          },
        },
      ],
      apiEndpoints: [
        { table: "posts", crud: true, search: true, filters: true, pagination: true },
        { table: "comments", crud: true, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND, enabled: true },
    },
  },
  {
    id: "project-mgmt",
    name: "Project Management",
    description: "Projects, tasks, teams, and time tracking.",
    icon: "📋",
    tags: ["Tasks", "Teams", "Multi-Tenant"],
    config: {
      projectName: "project-management",
      description: "Project management tool with tasks, team assignment, and time tracking.",
      features: {
        ...DEFAULT_FEATURES,
        multiTenancy: true,
        backgroundJobs: true,
        logging: true,
      },
      tables: [
        {
          id: "t1", name: "projects", columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "name", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c3", name: "description", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
            { id: "c4", name: "status", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, defaultValue: "'active'" },
            { id: "c5", name: "organization_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
          ],
        },
        {
          id: "t2", name: "tasks", columns: [
            { id: "c6", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c7", name: "title", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c8", name: "description", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
            { id: "c9", name: "status", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, defaultValue: "'todo'" },
            { id: "c10", name: "priority", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false, defaultValue: "'medium'" },
            { id: "c11", name: "project_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
            { id: "c12", name: "assignee_id", type: "uuid", isPrimary: false, isRequired: false, isUnique: false, isIndexed: true },
            { id: "c13", name: "due_date", type: "date", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
            { id: "c14", name: "organization_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
          ],
        },
        {
          id: "t3", name: "time_entries", columns: [
            { id: "c15", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c16", name: "task_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
            { id: "c17", name: "duration_minutes", type: "int", isPrimary: false, isRequired: true, isUnique: false, isIndexed: false },
            { id: "c18", name: "note", type: "text", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
            { id: "c19", name: "organization_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true },
          ],
        },
      ],
      relationships: [
        { id: "r1", from: { table: "projects", column: "id" }, to: { table: "tasks", column: "project_id" }, type: "1:N" },
        { id: "r2", from: { table: "tasks", column: "id" }, to: { table: "time_entries", column: "task_id" }, type: "1:N" },
      ],
      roles: [
        {
          id: "role1", name: "admin", permissions: {
            projects: { select: true, insert: true, update: true, delete: true },
            tasks: { select: true, insert: true, update: true, delete: true },
            time_entries: { select: true, insert: true, update: true, delete: true },
          },
        },
        {
          id: "role2", name: "member", permissions: {
            projects: { select: true, insert: false, update: false, delete: false },
            tasks: { select: true, insert: true, update: true, delete: false },
            time_entries: { select: true, insert: true, update: true, delete: true },
          },
        },
      ],
      apiEndpoints: [
        { table: "projects", crud: true, search: true, filters: true, pagination: true },
        { table: "tasks", crud: true, search: true, filters: true, pagination: true },
        { table: "time_entries", crud: true, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },
  {
    id: "saas-starter",
    name: "SaaS Starter",
    description: "Minimal SaaS boilerplate with auth, tenancy, feature flags, and billing-ready schema.",
    icon: "🚀",
    tags: ["Multi-Tenant", "Feature Flags", "Minimal"],
    config: {
      projectName: "saas-starter",
      description: "A minimal SaaS starter kit with multi-tenancy, feature flags, and a billing-ready schema.",
      features: {
        ...DEFAULT_FEATURES,
        multiTenancy: true,
        featureFlags: true,
        rateLimiting: true,
        apiIntegrations: true,
      },
      tables: [
        {
          id: "t1", name: "subscriptions", columns: [
            { id: "c1", name: "id", type: "uuid", isPrimary: true, isRequired: true, isUnique: true, isIndexed: false },
            { id: "c2", name: "plan", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, defaultValue: "'free'" },
            { id: "c3", name: "status", type: "text", isPrimary: false, isRequired: true, isUnique: false, isIndexed: true, defaultValue: "'active'" },
            { id: "c4", name: "organization_id", type: "uuid", isPrimary: false, isRequired: true, isUnique: true, isIndexed: true },
            { id: "c5", name: "expires_at", type: "timestamptz", isPrimary: false, isRequired: false, isUnique: false, isIndexed: false },
          ],
        },
      ],
      relationships: [],
      roles: [
        {
          id: "role1", name: "admin", permissions: {
            subscriptions: { select: true, insert: true, update: true, delete: true },
          },
        },
        {
          id: "role2", name: "user", permissions: {
            subscriptions: { select: true, insert: false, update: false, delete: false },
          },
        },
      ],
      apiEndpoints: [
        { table: "subscriptions", crud: true, search: false, filters: true, pagination: true },
      ],
      frontendOptions: { ...DEFAULT_FRONTEND },
    },
  },
];
