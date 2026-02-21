# Contributing to Supabase Factory

Thanks for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [How to Contribute](#how-to-contribute)
  - [Adding a Template](#adding-a-template)
  - [Improving the Generator](#improving-the-generator)
  - [Writing Tests](#writing-tests)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

---

## Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/supabase-factory.git
cd supabase-factory

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your Supabase project URL and anon key

# 4. Start dev server
npm run dev

# 5. Run tests
npm run test
```

> **Without Supabase credentials:** The wizard and generator work fully offline. Auth and project saving are the only features that need a Supabase backend.

---

## Project Architecture

```
src/
├── lib/
│   ├── generator.ts       # THE core file — generates all output files
│   └── templates.ts       # Pre-built project configurations
├── types/
│   └── project.ts         # ProjectConfig types (the central data model)
├── components/wizard/     # Wizard step UI components
├── pages/                 # Route-level page components
├── contexts/              # React contexts (auth)
└── test/                  # Test files
```

### Data Flow

```
User (Wizard UI) → ProjectConfig → generator.ts → GeneratedFile[] → ZIP Download
```

1. **Wizard steps** build a `ProjectConfig` object (defined in `types/project.ts`)
2. `generateProject()` in `generator.ts` takes that config and produces an array of `GeneratedFile` objects
3. The Output page renders files and offers ZIP download

### Key Types

- **`ProjectConfig`** — The central config: project name, features, tables, columns, relationships, roles, API endpoints, frontend options
- **`GeneratedFile`** — Output file with `path`, `content`, and `category` (`sql` | `functions` | `frontend` | `docs`)

---

## How to Contribute

### Adding a Template

Templates are the easiest way to contribute. Each template is a pre-configured `ProjectConfig` in `src/lib/templates.ts`.

1. Open `src/lib/templates.ts`
2. Add a new entry to the `PROJECT_TEMPLATES` array:

```typescript
{
  id: "my-template",
  name: "My Template",
  description: "One-line description of what this template sets up.",
  icon: "🎯",
  tags: ["Tag1", "Tag2"],
  config: {
    projectName: "my-template",
    description: "...",
    features: { ...DEFAULT_FEATURES, /* enable what you need */ },
    tables: [ /* define tables with pk(), fk(), txt(), optTxt(), col() helpers */ ],
    relationships: [ /* define relationships */ ],
    roles: [ /* define roles with permissions */ ],
    apiEndpoints: [ /* configure API endpoints */ ],
    frontendOptions: { ...DEFAULT_FRONTEND },
  },
}
```

3. **Test it:** Run the app, select your template, click Generate, and verify the SQL output is valid
4. Submit a PR with a description of the use case

### Improving the Generator

The generator (`src/lib/generator.ts`) is the most critical file. Changes here affect every generated project.

**Before changing the generator:**
1. Write a test that demonstrates the current behavior or bug
2. Make your change
3. Verify the test passes
4. Test with at least 2 templates (e.g., SaaS CRM + E-Commerce)

**Common generator improvements:**
- Fix SQL syntax issues in generated output
- Add support for new column types
- Improve RLS policy generation
- Add new optional modules

### Writing Tests

Tests live in `src/test/` and use [Vitest](https://vitest.dev/).

```bash
npm run test          # Run all tests once
npm run test:watch    # Watch mode
```

**What to test:**
- Generator functions: Does `generateProject(config)` produce valid SQL for a given config?
- Edge cases: Empty tables, no roles, all features enabled, no features enabled
- Regression tests: When we fix a bug, add a test so it doesn't come back

**Test file naming:** `src/test/generator.test.ts`, `src/test/templates.test.ts`, etc.

---

## Pull Request Process

1. **Fork** the repo and create a branch from `main`
2. Make your changes with clear, focused commits
3. Add or update tests for your changes
4. Run `npm run lint` and `npm run test` — both must pass
5. Open a PR with:
   - A clear title describing the change
   - What the change does and why
   - Screenshots (if UI changes)
   - Steps to test

### PR Checklist

- [ ] Tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] New features have tests
- [ ] Generated SQL tested against a Supabase instance (for generator changes)

---

## Code Style

- **TypeScript** — All new code must be in TypeScript
- **Formatting** — Follow the existing code style
- **Naming** — Use `camelCase` for variables/functions, `PascalCase` for components/types
- **Comments** — Comment *why*, not *what*. The generator file has good examples of section dividers

---

## Reporting Bugs

When reporting a bug, please include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. The generated SQL (if applicable) — copy from the Output page
5. Template used (or custom config as JSON)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.
