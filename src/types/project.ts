export type ColumnType =
  | "uuid"
  | "text"
  | "varchar"
  | "int"
  | "bigint"
  | "float"
  | "boolean"
  | "timestamp"
  | "timestamptz"
  | "date"
  | "jsonb"
  | "json"
  | "serial"
  | "bigserial";

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  isPrimary: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isIndexed: boolean;
  defaultValue?: string;
  references?: { table: string; column: string };
}

export interface TableDef {
  id: string;
  name: string;
  columns: Column[];
}

export type RelationshipType = "1:1" | "1:N" | "N:N";

export interface Relationship {
  id: string;
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: RelationshipType;
  junctionTable?: string;
}

export interface RolePermissions {
  select: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: Record<string, RolePermissions>; // table name -> perms
}

export interface ApiEndpoint {
  table: string;
  crud: boolean;
  search: boolean;
  filters: boolean;
  pagination: boolean;
}

export interface ProjectFeatures {
  auth: boolean;
  softDelete: boolean;
  auditLogs: boolean;
  timestamps: boolean;
  notifications: boolean;
  fileUploads: boolean;
  searchPagination: boolean;
}

export interface FrontendOptions {
  enabled: boolean;
  loginSignup: boolean;
  roleDashboards: boolean;
  crudPages: boolean;
}

export interface ProjectConfig {
  projectName: string;
  description: string;
  features: ProjectFeatures;
  tables: TableDef[];
  relationships: Relationship[];
  roles: Role[];
  apiEndpoints: ApiEndpoint[];
  frontendOptions: FrontendOptions;
}

export const DEFAULT_FEATURES: ProjectFeatures = {
  auth: true,
  softDelete: false,
  auditLogs: false,
  timestamps: true,
  notifications: false,
  fileUploads: false,
  searchPagination: true,
};

export const DEFAULT_FRONTEND: FrontendOptions = {
  enabled: false,
  loginSignup: true,
  roleDashboards: true,
  crudPages: true,
};

export const DEFAULT_CONFIG: ProjectConfig = {
  projectName: "",
  description: "",
  features: { ...DEFAULT_FEATURES },
  tables: [],
  relationships: [],
  roles: [],
  apiEndpoints: [],
  frontendOptions: { ...DEFAULT_FRONTEND },
};

export const COLUMN_TYPES: ColumnType[] = [
  "uuid", "text", "varchar", "int", "bigint", "float",
  "boolean", "timestamp", "timestamptz", "date", "jsonb", "json",
  "serial", "bigserial",
];
