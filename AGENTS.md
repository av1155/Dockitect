# Agent Guide — Dockitect

## Build/Test Commands
- `pnpm install` — Install dependencies
- `pnpm dev` — Start Next.js dev server (localhost:3000)
- `pnpm typecheck` — TypeScript validation
- `pnpm lint` — ESLint + Prettier check
- `pnpm test` — Vitest unit tests
- `pnpm test:coverage` — Unit tests with coverage (≥80% required)
- `pnpm e2e` — Playwright e2e tests
- `pnpm build` — Production build

## Code Style
- **TypeScript:** Strict mode, no `any`, prefer `type` over `interface`
- **Imports:** Absolute via `@/` (web) or `@dockitect/<pkg>` (packages)
- **Naming:** camelCase (vars/fns), PascalCase (components/types)
- **Formatting:** Prettier (2 spaces, semicolons, double quotes)
- **React:** Functional components, hooks only, appropriate server/client components
- **Error handling:** Zod for validation, explicit error types, no silent failures
- **Comments:** Minimal; code should be self-documenting (add only for complex logic)

## Project Context
- **Monorepo:** `/apps/web` (Next.js), `/packages/{schema,importer,exporter}`, `/templates/appliances`
- **Blueprint v0:** Versioned JSON schema (Zod) with Host/Network/Service entities
- **Deterministic exports:** Stable YAML key ordering (alphabetical), use `fast-json-stable-stringify`
- **Security:** No Docker socket access; file-based import/export only; no telemetry by default
