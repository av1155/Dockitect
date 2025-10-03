# Contributing to Dockitect

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 20+ LTS
- pnpm 8+
- Docker (for testing exports)

### Installation

```bash
git clone https://github.com/av1155/Dockitect.git
cd Dockitect
pnpm install
pnpm dev  # Starts Next.js on localhost:3000
```

### Project Structure

```
apps/web/              # Next.js application
packages/schema/       # Blueprint Zod schema
packages/importer/     # Compose → Blueprint parser
packages/exporter/     # Blueprint → Compose generator
templates/appliances/  # Pre-built service templates
docs/                  # Documentation
```

## Making Changes

### 1. Create a Branch

Use trunk-based flow with short-lived branches:

```bash
git checkout -b feat/your-feature  # or fix/, chore/, docs/
```

### 2. Write Code

- Follow TypeScript strict mode
- Use Prettier for formatting (auto-fix on save recommended)
- Write tests for new features/fixes
- Keep changes focused and atomic

### 3. Test Locally

```bash
pnpm typecheck     # TypeScript check
pnpm lint          # ESLint + Prettier
pnpm test          # Vitest unit tests
pnpm e2e           # Playwright e2e tests
pnpm build         # Verify production build
```

### 4. Commit with Conventional Commits

```bash
git commit -m "feat(importer): add support for Compose anchors"
git commit -m "fix(exporter): stable port ordering"
```

**Format:** `<type>(<scope>): <description>`

- **Types:** feat, fix, docs, refactor, test, chore, perf, ci
- **Scope:** importer, exporter, schema, ui, docs, etc.
- **Description:** Short, imperative mood (e.g., "add" not "added")

### 5. Open a Pull Request

- Use the PR template (auto-populated)
- Add screenshots for UI changes
- Link related issues (Fixes #123)
- Request review from CODEOWNERS
- Keep PRs small and focused (<300 lines when possible)

## Code Style

- **TypeScript:** Strict mode, no `any`, prefer `type` over `interface`
- **React:** Functional components, hooks only, appropriate server/client components
- **Imports:** Absolute imports via `@/` aliases
- **Naming:** camelCase for variables/functions, PascalCase for components/types
- **Comments:** Minimal; code should be self-documenting (add only for complex logic)

## Testing Guidelines

### Unit Tests (Vitest)

- Colocate tests: `src/foo.ts` → `src/__tests__/foo.test.ts`
- Test pure functions thoroughly
- Aim for ≥80% coverage
- Use descriptive test names

### E2E Tests (Playwright)

- Place in `apps/web/e2e/`
- Test critical user flows (import, export, conflict detection)
- Use fixtures for test data
- Keep tests deterministic and fast

## Pull Request Process

1. **Draft PR:** Open as draft early to get feedback
2. **CI Checks:** Ensure all checks pass (typecheck, lint, test, build, e2e)
3. **Review:** Address all review comments or explain why not
4. **Merge:** Squash-merge to main (maintainer will handle)
5. **Cleanup:** Delete branch after merge

## Release Process

Releases are automated via semantic-release:

1. PRs merged to `main` trigger CI
2. Conventional Commits determine version bump
    - `feat:` → minor bump
    - `fix:` → patch bump
    - `BREAKING CHANGE:` → major bump
3. Tag creation triggers Docker build & GHCR push
4. CHANGELOG auto-generated

## Questions?

- Check `/docs` for architecture details
- Open a [Discussion](https://github.com/av1155/Dockitect/discussions) for questions
- Report bugs via [issue templates](https://github.com/av1155/Dockitect/issues/new/choose)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

---

Thank you for contributing to Dockitect! 🚀
