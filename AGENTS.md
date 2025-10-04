# Agent Guide — Dockitect

## Build/Test Commands
- `pnpm install` — Install dependencies
- `pnpm dev` — Start Next.js dev server (localhost:3000)
- `pnpm typecheck` — TypeScript validation
- `pnpm lint` — ESLint + Prettier check
- `pnpm format` — Prettier write (auto-fix formatting)
- `pnpm test` — Run all Vitest unit tests
- `pnpm test -- <file>` — Run single test file (e.g., `pnpm test -- blueprint.test.ts`)
- `pnpm --filter @dockitect/schema test` — Run tests in specific package
- `cd apps/web && pnpm test:e2e` — Run all Playwright e2e tests
- `cd apps/web && pnpm test:e2e -- <file>` — Run single e2e test (e.g., `-- canvas.spec.ts`)
- `pnpm build` — Production build (turbo builds all packages)

## Code Style
- **TypeScript:** Strict mode, no `any`, prefer `type` over `interface`, explicit return types
- **Imports:** Absolute via `@/` (web) or `@dockitect/<pkg>` (packages); organize: external, internal, types
- **Naming:** camelCase (vars/fns), PascalCase (components/types), UPPER_CASE (constants)
- **Formatting:** Prettier (2 spaces, semicolons, double quotes, 80-char soft limit)
- **React:** Functional components, hooks only, mark `"use client"` when needed, prefer server components
- **Error handling:** Zod for validation, explicit error types, no silent failures, use `Result<T, E>` pattern
- **Comments:** Minimal; code should be self-documenting (add only for complex logic or "why" not "what")
- **Testing:** Vitest for packages (globals enabled), Playwright for e2e, descriptive test names

## Project Context
- **Monorepo:** Turborepo with pnpm workspaces; `/apps/web` (Next.js 15), `/packages/{schema,importer,exporter}`
- **Blueprint v0:** Versioned JSON schema (Zod) with Host/Network/Service entities
- **Deterministic exports:** Stable YAML key ordering (alphabetical), use `fast-json-stable-stringify`
- **Security:** No Docker socket access; file-based import/export only; no telemetry by default
- **Node:** ≥18.0.0, pnpm ≥8.0.0 required

## Git Workflow
- **Branch Protection:** Never push directly to `main` unless strictly necessary
- **Pull Requests:** All changes must come from PRs with passing tests
- **Branch Naming:** Use `feat/`, `fix/`, `chore/`, `docs/` prefixes (e.g., `feat/p1.3-file-upload-ui`)
- **Commits:** Follow Conventional Commits format
