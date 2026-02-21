

# Add Navigation, Fix Feature Toggles, and Expand Templates

## Changes Overview

### 1. Add Editor Link to Navigation
The Editor page exists at `/editor` but is not linked from the landing page nav or dashboard nav. We will:
- Add an "Editor" link in the landing page navbar (between Sign In and Get Started)
- Add an "Editor" link in the Dashboard navbar (next to Sign Out)

**Files modified:** `src/pages/Index.tsx`, `src/pages/Dashboard.tsx`

### 2. Verify Feature Toggles
The `StepProjectInfo.tsx` already has all 13 feature toggle entries mapped to the correct `ProjectFeatures` keys. The `Switch` component binds `checked` to `config.features[f.key]` and `onCheckedChange` updates the config. The types in `project.ts` already include all flags (`rateLimiting`, `multiTenancy`, `apiIntegrations`, `logging`, `featureFlags`, `backgroundJobs`). No changes needed here -- toggles are already functional.

### 3. Replace E-Commerce Template
Replace the current basic e-commerce template with a production-ready headless e-commerce backend:
- **Features enabled:** `rateLimiting`, `logging`, `backgroundJobs`, `apiIntegrations`, `auditLogs`, `softDelete`
- **Tables:** `products`, `categories`, `inventory`, `orders`, `order_items`, `payments`
- **Roles:** `admin` (full access), `user` (read products/categories, create orders)
- **Relationships:** categories->products, orders->order_items, products->order_items, orders->payments
- **API endpoints:** products, orders, payments (with search, filters, pagination)

### 4. Replace SaaS CRM Template
Replace with a multi-tenant CRM backend:
- **Features enabled:** `multiTenancy`, `auditLogs`, `logging`, `featureFlags`, `rateLimiting`, `softDelete`, `fileUploads`
- **Tables:** `customers`, `deals`, `activities`, `notes`, `attachments`
- **Roles:** `owner` (full access), `sales_manager` (full except delete), `sales_rep` (read/insert/update, no delete)
- **All tables scoped to `organization_id`**

### 5. Replace SaaS Starter Template
Replace with a full multi-tenant SaaS starter using all enterprise modules:
- **Features enabled:** `multiTenancy`, `rateLimiting`, `logging`, `featureFlags`, `backgroundJobs`, `auditLogs`, `softDelete`, `timestamps`
- **Tables:** `projects` (org-scoped), `tasks` (project-scoped), `subscriptions` (org-level billing), `organization_members` (with role column)
- **Roles:** `owner` (full access), `admin` (full access), `member` (limited)
- **Seed data for 2 organizations with different roles**

### 6. Add POS & Inventory Management Template (NEW)
Add a comprehensive multi-tenant POS template:
- **Features enabled:** `multiTenancy`, `rateLimiting`, `logging`, `backgroundJobs`, `auditLogs`, `softDelete`, `featureFlags`
- **Tables (17):** `branches`, `employees`, `customers`, `suppliers`, `products`, `product_categories`, `inventory_batches`, `stock_movements`, `sales`, `sale_items`, `purchases`, `purchase_items`, `expenses`, `payments`, `tax_rates`
- **Roles:** `owner` (full), `manager` (full except delete on financials), `cashier` (sales only), `accountant` (read financials)
- **Relationships:** branches->employees, products->sale_items, sales->sale_items, products->purchase_items, purchases->purchase_items, etc.
- **Tags:** Multi-Tenant, POS, Inventory, Billing

### 7. Add API Platform Template (NEW)
Add an API key authentication platform template:
- **Features enabled:** `rateLimiting`, `logging`, `auditLogs`
- **Tables:** `api_keys` (key_hash, name, role, active), `api_usage_limits` (key_id, max_requests, window_seconds)
- **Roles:** `admin` (full access to all), `api_user` (read own keys and logs)
- **Tags:** API Keys, Rate Limiting, Analytics

## Technical Details

### Files Modified
1. **`src/pages/Index.tsx`** -- Add "Editor" nav link
2. **`src/pages/Dashboard.tsx`** -- Add "Editor" nav link  
3. **`src/lib/templates.ts`** -- Replace 3 existing templates (e-commerce, CRM, SaaS starter) and add 2 new templates (POS, API Platform). Total: 7 templates (Blog and Project Management remain unchanged)

### Files NOT Modified
- No changes to `generator.ts`, `project.ts`, `StepProjectInfo.tsx`, `Editor.tsx`, `Output.tsx`, `Auth.tsx`
- No database schema changes
- No routing changes

