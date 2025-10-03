# Dockitect Implementation Checklist

> **This document is authoritative for Dockitect's execution plan. Update it as phases complete.**

---

## How to Use This Checklist

Each task below includes:

- **Files**: Exact paths to create/modify
- **Commands**: Shell commands to run (pnpm, docker, gh, etc.)
- **Tests**: Unit/e2e coverage requirements and locations
- **Docs**: Documentation files to update
- **Commit**: Conventional Commit message
- **PR**: Title, description bullets, labels, suggested reviewers
- **CI**: Expected GitHub Actions checks to pass

**Status Legend:**

- ⬜ Not started
- 🟦 In progress
- ✅ Complete

---

## P0: Repository & Project Setup

### P0.1: Initialize Next.js Monorepo ✅

**Files:**

- `/apps/web/` (new directory)
- `/packages/` (new directory)
- `/pnpm-workspace.yaml`
- `/package.json`
- `/.npmrc`

**Commands:**

```bash
pnpm create next-app@latest apps/web --typescript --tailwind --app --no-src-dir --import-alias "@/*"
mkdir -p packages/{schema,importer,exporter} templates/appliances docs/{product,tech,adr,how-to,reference}
echo -e "packages:\n  - 'apps/*'\n  - 'packages/*'" > pnpm-workspace.yaml
echo "auto-install-peers=true\nstrict-peer-dependencies=false" > .npmrc
pnpm install
```

**Tests:**

- N/A (scaffolding)

**Docs:**

- Create `/docs/product/mvp.md` (placeholder)
- Create `/docs/tech/architecture.md` (placeholder)

**Commit:**

```
feat(init): bootstrap Next.js monorepo with pnpm workspace
```

**PR:**

- Title: `feat(init): bootstrap Next.js monorepo with pnpm workspace`
- Description:
    - Initialize Next.js App Router project in `/apps/web`
    - Set up pnpm workspace with apps/ and packages/ structure
    - Create initial directory structure for docs and templates
- Labels: `type: feature`, `phase: p0`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `install`, `build`

---

### P0.2: Configure TypeScript & ESLint ✅

**Files:**

- `/tsconfig.json` (workspace root)
- `/apps/web/tsconfig.json`
- `/packages/schema/tsconfig.json`
- `/packages/importer/tsconfig.json`
- `/packages/exporter/tsconfig.json`
- `/.eslintrc.json`
- `/.prettierrc.json`
- `/.editorconfig`

**Commands:**

```bash
# Root tsconfig
cat > tsconfig.json <<'EOF'
{
  "extends": "./apps/web/tsconfig.json",
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "./apps/web" },
    { "path": "./packages/schema" },
    { "path": "./packages/importer" },
    { "path": "./packages/exporter" }
  ]
}
EOF

# Package tsconfigs
for pkg in schema importer exporter; do
  cat > packages/$pkg/tsconfig.json <<'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF
done

# ESLint
pnpm add -D -w eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-unicorn prettier eslint-config-prettier
cat > .eslintrc.json <<'EOF'
{
  "parser": "@typescript-eslint/parser",
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "plugin:unicorn/recommended", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "unicorn/prevent-abbreviations": "off"
  }
}
EOF

# Prettier
cat > .prettierrc.json <<'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# EditorConfig
cat > .editorconfig <<'EOF'
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
EOF

pnpm install
```

**Tests:**

- Run `pnpm typecheck` (add script to root package.json)
- Run `pnpm lint` (add script to root package.json)

**Docs:**

- Update `/docs/tech/architecture.md` with tooling section

**Commit:**

```
chore(tooling): configure TypeScript, ESLint, Prettier
```

**PR:**

- Title: `chore(tooling): configure TypeScript, ESLint, Prettier`
- Description:
    - Set up strict TypeScript with project references
    - Configure ESLint with @typescript-eslint and unicorn plugins
    - Add Prettier and EditorConfig for consistent formatting
- Labels: `type: chore`, `phase: p0`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`

---

### P0.3: Add Vitest & Playwright ✅

**Files:**

- `/vitest.config.ts`
- `/playwright.config.ts`
- `/apps/web/tests/e2e/home.spec.ts` (placeholder test)
- `/packages/schema/src/__tests__/blueprint.test.ts` (placeholder)

**Commands:**

```bash
pnpm add -D -w vitest @vitest/ui @vitest/coverage-v8 playwright @playwright/test
pnpm create playwright # Follow prompts

cat > vitest.config.ts <<'EOF'
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@dockitect/schema': path.resolve(__dirname, './packages/schema/src'),
      '@dockitect/importer': path.resolve(__dirname, './packages/importer/src'),
      '@dockitect/exporter': path.resolve(__dirname, './packages/exporter/src'),
    },
  },
});
EOF

mkdir -p apps/web/tests/e2e
cat > apps/web/tests/e2e/home.spec.ts <<'EOF'
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Dockitect/);
});
EOF

mkdir -p packages/schema/src/__tests__
cat > packages/schema/src/__tests__/blueprint.test.ts <<'EOF'
import { describe, it, expect } from 'vitest';

describe('Blueprint schema placeholder', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
EOF
```

**Tests:**

- Add scripts to root `package.json`: `"test": "vitest"`, `"test:ui": "vitest --ui"`, `"e2e": "playwright test"`, `"test:coverage": "vitest --coverage"`
- Run `pnpm test` (should pass placeholder test)
- Run `pnpm e2e` (should pass home test)

**Docs:**

- Update `/docs/tech/architecture.md` with testing strategy section

**Commit:**

```
test: add Vitest and Playwright with placeholder tests
```

**PR:**

- Title: `test: add Vitest and Playwright with placeholder tests`
- Description:
    - Configure Vitest for unit testing with coverage
    - Set up Playwright for e2e testing
    - Add placeholder tests to verify setup
- Labels: `type: test`, `phase: p0`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `test`, `e2e`

---

### P0.4: GitHub Actions CI Workflow ✅

**Files:**

- `/.github/workflows/ci.yml`
- `/.github/workflows/codeql.yml`
- `/.github/renovate.json`

**Commands:**

```bash
mkdir -p .github/workflows

cat > .github/workflows/ci.yml <<'EOF'
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build-test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm run typecheck

      - name: Lint
        run: pnpm run lint

      - name: Unit tests
        run: pnpm run test -- --coverage

      - name: Build
        run: pnpm run build

      - name: E2E tests
        run: pnpm run e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: always()
        with:
          files: ./coverage/coverage-final.json
EOF

cat > .github/workflows/codeql.yml <<'EOF'
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript,typescript
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3
EOF

cat > .github/renovate.json <<'EOF'
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ],
  "schedule": ["before 3am on Monday"]
}
EOF
```

**Tests:**

- Push to main and verify CI runs
- Create draft PR and verify all checks pass

**Docs:**

- Update `/docs/tech/architecture.md` with CI/CD section

**Commit:**

```
ci: add GitHub Actions workflows for CI and CodeQL
```

**PR:**

- Title: `ci: add GitHub Actions workflows for CI and CodeQL`
- Description:
    - Add CI workflow: typecheck, lint, test, build, e2e
    - Configure CodeQL security scanning (weekly + PR)
    - Enable Renovate for automated dependency updates
- Labels: `type: ci`, `phase: p0`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `build-test`, `analyze`

---

### P0.5: Repository Hygiene Files ⬜

**Files:**

- `/LICENSE`
- `/CONTRIBUTING.md`
- `/CODE_OF_CONDUCT.md`
- `/SECURITY.md`
- `/.github/CODEOWNERS`
- `/.github/PULL_REQUEST_TEMPLATE.md`
- `/.github/ISSUE_TEMPLATE/bug_report.yml`
- `/.github/ISSUE_TEMPLATE/feature_request.yml`
- `/.github/ISSUE_TEMPLATE/config.yml`

**Commands:**

```bash
# MIT License
cat > LICENSE <<'EOF'
MIT License

Copyright (c) 2025 Dockitect Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# SECURITY.md
cat > SECURITY.md <<'EOF'
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, email security@dockitect.dev (or your contact) with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Response timeline:**
- Acknowledgment: within 48 hours
- Initial assessment: within 7 days
- Fix timeline: 90 days (coordinated disclosure)

We appreciate responsible disclosure and will credit reporters in release notes (unless anonymity is requested).
EOF

# CODEOWNERS
mkdir -p .github
cat > .github/CODEOWNERS <<'EOF'
* @yourusername

/apps/web/ @yourusername
/packages/ @yourusername
/docs/ @yourusername
/.github/ @yourusername
EOF

# PR Template
cat > .github/PULL_REQUEST_TEMPLATE.md <<'EOF'
## Description
<!-- Brief summary of changes -->

## Type of Change
- [ ] feat (new feature)
- [ ] fix (bug fix)
- [ ] docs (documentation)
- [ ] refactor (code refactoring)
- [ ] test (test additions/fixes)
- [ ] chore (tooling, deps, etc.)

## Changes
<!-- Detailed list of changes -->
-
-

## Testing
<!-- How was this tested? -->
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots/GIFs
<!-- If UI changes, add visuals -->

## Checklist
- [ ] Title follows Conventional Commits
- [ ] Tests pass locally (`pnpm test && pnpm e2e`)
- [ ] Docs updated (if user-facing)
- [ ] No console errors/warnings
- [ ] Linked issue(s): Fixes #

## Risk Assessment
<!-- Low/Medium/High + rollback plan -->
EOF

# Issue Templates
mkdir -p .github/ISSUE_TEMPLATE

cat > .github/ISSUE_TEMPLATE/bug_report.yml <<'EOF'
name: Bug Report
description: Report a bug in Dockitect
labels: ["type: bug", "status: triage"]
body:
  - type: markdown
    attributes:
      value: Thanks for taking the time to report a bug!

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Clear description of the bug
    validations:
      required: true

  - type: textarea
    id: reproduce
    attributes:
      label: Steps to Reproduce
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
    validations:
      required: true

  - type: input
    id: version
    attributes:
      label: Dockitect Version
      placeholder: v1.0.0
    validations:
      required: true

  - type: input
    id: browser
    attributes:
      label: Browser/Environment
      placeholder: Chrome 120, Docker 24.x
EOF

cat > .github/ISSUE_TEMPLATE/feature_request.yml <<'EOF'
name: Feature Request
description: Suggest a new feature
labels: ["type: feature", "status: triage"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem does this solve?
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: How should this work?
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered

  - type: textarea
    id: context
    attributes:
      label: Additional Context
EOF

cat > .github/ISSUE_TEMPLATE/config.yml <<'EOF'
blank_issues_enabled: false
contact_links:
  - name: Discussions (Q&A, Ideas)
    url: https://github.com/yourusername/dockitect/discussions
    about: For questions and general discussion
  - name: Documentation
    url: https://dockitect.dev/docs
    about: Check the docs first
EOF
```

**Tests:**

- N/A (documentation)

**Docs:**

- Create `/CONTRIBUTING.md` with setup guide (detailed in next task)
- Create `/CODE_OF_CONDUCT.md` (use Contributor Covenant template)

**Commit:**

```
docs: add repository hygiene files (LICENSE, SECURITY, templates)
```

**PR:**

- Title: `docs: add repository hygiene files (LICENSE, SECURITY, templates)`
- Description:
    - Add MIT LICENSE
    - Create SECURITY.md with 90-day disclosure policy
    - Add CODEOWNERS, PR template, issue templates
    - Enable structured issue reporting
- Labels: `type: docs`, `phase: p0`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `build` (validate templates parse)

---

### P0.6: Create CONTRIBUTING.md & CODE_OF_CONDUCT.md ⬜

**Files:**

- `/CONTRIBUTING.md`
- `/CODE_OF_CONDUCT.md`

**Commands:**

````bash
cat > CONTRIBUTING.md <<'EOF'
# Contributing to Dockitect

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites
- Node.js 20+ LTS
- pnpm 9+
- Docker (for testing exports)

### Installation
```bash
git clone https://github.com/yourusername/dockitect.git
cd dockitect
pnpm install
pnpm dev  # Starts Next.js on localhost:3000
````

### Project Structure

```
apps/web/              # Next.js application
packages/schema/       # Blueprint Zod schema
packages/importer/     # Compose → Blueprint parser
packages/exporter/     # Blueprint → Compose generator
templates/appliances/  # Pre-built service templates
docs/                  # Documentation (Docusaurus)
```

## Making Changes

### 1. Create a Branch

Use trunk-based flow with short-lived branches:

```bash
git checkout -b feat/your-feature  # or fix/, chore/, docs/
```

### 2. Write Code

- Follow TypeScript strict mode
- Use Prettier for formatting (auto-fix on save)
- Write tests for new features/fixes

### 3. Test Locally

```bash
pnpm typecheck     # TypeScript check
pnpm lint          # ESLint
pnpm test          # Vitest unit tests
pnpm e2e           # Playwright e2e tests
pnpm build         # Verify build succeeds
```

### 4. Commit with Conventional Commits

```bash
git commit -m "feat(importer): add support for Compose anchors"
git commit -m "fix(exporter): stable port ordering"
```

**Format:** `<type>(<scope>): <description>`

- **Types:** feat, fix, docs, refactor, test, chore, perf, ci
- **Scope:** importer, exporter, schema, ui, docs, etc.

### 5. Open a Pull Request

- Use the PR template
- Add screenshots for UI changes
- Link related issues (Fixes #123)
- Request review from CODEOWNERS

## Code Style

- **TypeScript:** Strict mode, no `any`, prefer types over interfaces
- **React:** Functional components, hooks, server/client components appropriately
- **Imports:** Absolute imports via `@/` aliases
- **Naming:** camelCase for variables/functions, PascalCase for components/types

## Testing Guidelines

### Unit Tests (Vitest)

- Colocate tests: `src/foo.ts` → `src/__tests__/foo.test.ts`
- Test pure functions thoroughly
- Aim for ≥80% coverage

### E2E Tests (Playwright)

- Place in `apps/web/tests/e2e/`
- Test critical user flows (import, export, conflict detection)
- Use fixtures for test data

## Release Process

Releases are automated via semantic-release:

1. PRs merged to `main` trigger CI
2. Conventional Commits determine version bump
3. Tag creation triggers Docker build & GHCR push
4. CHANGELOG auto-generated

## Questions?

- Check `/docs` for architecture details
- Open a Discussion for general questions
- Report bugs via issue templates
  EOF

# Contributor Covenant v2.1

cat > CODE_OF_CONDUCT.md <<'EOF'

# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, caste, color, religion, or sexual
identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment:

- Being respectful of differing opinions, viewpoints, and experiences
- Giving and gracefully accepting constructive feedback
- Accepting responsibility and apologizing to those affected by our mistakes
- Focusing on what is best for the overall community

Examples of unacceptable behavior:

- The use of sexualized language or imagery, and sexual attention or advances
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

## Scope

This Code of Conduct applies within all community spaces, and also applies when
an individual is officially representing the community in public spaces.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the community leaders responsible for enforcement at
[conduct@dockitect.dev]. All complaints will be reviewed and investigated
promptly and fairly.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 2.1, available at
[https://www.contributor-covenant.org/version/2/1/code_of_conduct.html][v2.1].

[homepage]: https://www.contributor-covenant.org
[v2.1]: https://www.contributor-covenant.org/version/2/1/code_of_conduct.html

EOF

```

**Tests:**
- Validate markdown rendering (preview in GitHub)

**Docs:**
- Reference CONTRIBUTING.md from README

**Commit:**
```

docs: add CONTRIBUTING and CODE_OF_CONDUCT guides

````

**PR:**
- Title: `docs: add CONTRIBUTING and CODE_OF_CONDUCT guides`
- Description:
  - Add comprehensive contribution guide with setup, style, testing
  - Include Contributor Covenant v2.1 Code of Conduct
  - Document commit conventions and PR process
- Labels: `type: docs`, `phase: p0`, `priority: medium`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P0.7: Architecture & ADR Documentation ✅

**Files:**
- `/docs/tech/architecture.md`
- `/docs/product/mvp.md`
- `/docs/adr/0001-blueprint-schema.md`
- `/docs/adr/README.md`

**Commands:**
```bash
# Create placeholder architecture doc (expand later with diagrams)
cat > docs/tech/architecture.md <<'EOF'
# Dockitect Architecture

## Overview
Dockitect is a self-hosted web application for designing homelab topologies and exporting deterministic docker-compose.yml files.

## High-Level Architecture (C4 Context)
````

[User] → [Dockitect Web App] → [SQLite DB]
↓
[Importer/Exporter Packages]
↓
[docker-compose.yml files]

````

## Tech Stack
- **Frontend:** Next.js 14+ (App Router), React 18, TypeScript 5.x
- **UI:** Tailwind CSS, shadcn/ui (Radix primitives), React Flow
- **State:** Zustand for global state, React Flow internal state
- **Schema:** Zod for runtime validation, JSON Schema for API
- **Database:** Prisma + SQLite (file-based, /data volume)
- **Packaging:** Docker multi-stage, multi-arch (amd64, arm64)
- **Testing:** Vitest (unit), Playwright (e2e)
- **CI/CD:** GitHub Actions (CI, CodeQL, semantic-release)

## Monorepo Structure
- `/apps/web`: Next.js application (UI, API routes, server actions)
- `/packages/schema`: Blueprint v0 schema (Zod, JSON Schema export)
- `/packages/importer`: Compose v2.x → Blueprint parser
- `/packages/exporter`: Blueprint → Compose v2.x generator
- `/templates/appliances`: Pre-built templates (Jellyfin, etc.)
- `/docs`: Docusaurus documentation site

## Data Flow
1. **Import:** User uploads compose.yml → Importer parses → Blueprint JSON → React Flow nodes
2. **Edit:** User modifies canvas → Blueprint updates → Validation runs
3. **Export:** User clicks export → Exporter generates stable YAML → Download

## Security
- No Docker socket access (file-based only)
- No telemetry by default (opt-in flag)
- CSP headers, HTTPS-only in production
- Regular dependency scanning (CodeQL, Renovate)

_See ADRs in /docs/adr/ for design decisions._
EOF

cat > docs/product/mvp.md <<'EOF'
# Dockitect MVP Specification

## Vision
Visual design tool for homelab compose stacks with conflict detection and deterministic export.

## MVP Scope (v0.1)

### In Scope
- Import single docker-compose.yml (v2.x)
- Render nodes: Host, Network, Service
- Export deterministic compose with stable ordering
- Conflict detection: port collisions, duplicate names, volume conflicts
- 5 appliance templates: Jellyfin, Uptime-Kuma, Immich, Nextcloud, Paperless-ngx
- SQLite persistence for blueprints
- Light/dark theme

### Out of Scope (Post-MVP)
- Multi-host orchestration
- Kubernetes export
- Live Docker API integration (inspect running containers)
- IPAM/DCIM features
- User authentication (single-user mode)

## User Stories

### US-1: Import Compose
As a homelab admin, I want to upload my existing docker-compose.yml so I can visualize my stack as a graph.

**Acceptance:**
- Upload button accepts .yml/.yaml
- Parser handles services, networks, volumes
- Canvas shows service nodes with labels
- Error messages for unsupported features

### US-2: Export Compose
As a user, I want to download a docker-compose.yml from my canvas so I can deploy it.

**Acceptance:**
- Export button downloads valid compose
- YAML keys sorted alphabetically
- Multiple exports produce identical diffs
- `docker compose config` validates output

### US-3: Detect Conflicts
As a user, I want to see port collisions before deploying so I avoid runtime errors.

**Acceptance:**
- Conflict panel shows errors/warnings
- Canvas nodes show badges for conflicts
- Auto-fix suggests port increments

## Success Metrics
- Import/export round-trip accuracy: 100% for MVP features
- Conflict detection accuracy: ≥95%
- Performance: <2s for 20-service compose
- Zero Docker socket dependencies
EOF

cat > docs/adr/README.md <<'EOF'
# Architecture Decision Records (ADRs)

This directory contains ADRs documenting significant architectural decisions in Dockitect.

## Format
Each ADR follows this structure:
- **Status:** Proposed, Accepted, Deprecated, Superseded
- **Context:** Background and problem statement
- **Decision:** What was decided
- **Consequences:** Positive, negative, and neutral outcomes
- **Alternatives Considered:** Other options and why they were rejected

## Index
- [ADR-0001: Blueprint Schema Design](./0001-blueprint-schema.md)
EOF

cat > docs/adr/0001-blueprint-schema.md <<'EOF'
# ADR-0001: Blueprint Schema Design

**Status:** Accepted
**Date:** 2025-10-02
**Authors:** @yourusername

## Context

Dockitect needs an internal representation (Blueprint) to bridge canvas UI and docker-compose.yml. Requirements:
- Support compose v2.x features (services, networks, volumes, ports, env)
- Enable multi-host future extension
- Validate at runtime (catch errors early)
- Export to JSON Schema for API docs
- Versioned for migrations (v0 → v1)

## Decision

Use **Zod** for Blueprint schema with JSON Schema export.

**Blueprint v0 structure:**
```typescript
type Blueprint = {
  version: 'v0';
  meta: { id: string; name: string; createdAt: string; updatedAt: string };
  hosts: Host[];
  networks: Net[];
  services: Service[];
};
````

**Key design choices:**

1. **Versioning:** Explicit `version` field for future migrations
2. **Hosts:** First-class entities (even if single-host in MVP) for multi-host later
3. **Flat arrays:** Avoid nested structures; use references (IDs) for relationships
4. **Zod refinements:** Custom validation for conflicts (duplicate ports, etc.)

## Consequences

**Positive:**

- Runtime validation prevents invalid states
- JSON Schema auto-generated for API docs
- TypeScript types derived from Zod (single source of truth)
- Easy to extend (add `deploy`, `secrets` in v1)

**Negative:**

- Zod bundle size (~15KB) added to frontend
- Schema changes require migration code

**Neutral:**

- Must keep Zod schema in sync with compose spec (mitigated by tests)

## Alternatives Considered

### 1. Direct Compose JSON (no intermediate schema)

**Rejected:** Loses multi-host capability, harder to validate, tightly coupled to compose spec changes.

### 2. GraphQL schema

**Rejected:** Overkill for MVP, adds complexity, no need for GraphQL API yet.

### 3. JSON Schema only (no Zod)

**Rejected:** No runtime validation, loses TypeScript integration, manual type definitions.

## References

- [Zod documentation](https://zod.dev)
- [Docker Compose spec](https://github.com/compose-spec/compose-spec)
  EOF

```

**Tests:**
- N/A (documentation)

**Docs:**
- Link architecture.md from README

**Commit:**
```

docs(adr): add architecture docs and ADR-0001 (Blueprint schema)

````

**PR:**
- Title: `docs(adr): add architecture docs and ADR-0001 (Blueprint schema)`
- Description:
  - Create architecture.md with tech stack, data flow, security
  - Add mvp.md with scope, user stories, success metrics
  - Document Blueprint schema design rationale in ADR-0001
- Labels: `type: docs`, `phase: p0`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P0.8: Initialize React Flow Canvas ⬜

**Files:**
- `/apps/web/app/page.tsx` (home page with canvas)
- `/apps/web/components/Canvas.tsx`
- `/apps/web/components/CanvasNode.tsx`
- `/apps/web/lib/store.ts` (Zustand store for canvas state)

**Commands:**
```bash
cd apps/web
pnpm add @xyflow/react zustand
pnpm add -D @types/react @types/react-dom

mkdir -p components lib
````

**Tests:**

- E2E test: load page, verify React Flow canvas renders
- Unit test: Zustand store actions

**Docs:**

- Update architecture.md with state management section

**Commit:**

```
feat(ui): initialize React Flow canvas with Zustand state
```

**PR:**

- Title: `feat(ui): initialize React Flow canvas with Zustand state`
- Description:
    - Add React Flow for canvas rendering
    - Set up Zustand for global canvas state
    - Create placeholder canvas component on homepage
    - E2E test verifies canvas mounts
- Labels: `type: feature`, `phase: p0`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P0.9: Create Initial README ⬜

**Files:**

- `/README.md`

**Commands:**

````bash
cat > README.md <<'EOF'
# Dockitect — Design your homelab. Export the stack.

[![CI](https://github.com/yourusername/dockitect/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/dockitect/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/github/v/release/yourusername/dockitect)](https://github.com/yourusername/dockitect/releases)

Draw your topology on a canvas, then export **deterministic `docker-compose.yml`** you can run anywhere. Import existing Compose to visualize and fix conflicts. Self-hosted, beautiful, and fast.

![Dockitect Demo](docs/media/demo.gif)
_Coming soon: Animated demo_

---

## ✨ Why Dockitect?

Homelabs grow messy: scattered `docker-compose.yml` files, port collisions, no single source of truth. **Dockitect** bridges **design ↔ code**:

- **Visual canvas** for hosts, networks, and services (React Flow)
- **Import Compose** → see your lab as a graph
- **Export deterministic YAML** (clean diffs, perfect for Git)
- **Catch conflicts** before `docker compose up -d`
- **Appliance templates** (Jellyfin, Uptime Kuma, Immich, etc.)

---

## 🎯 Key Features (MVP Roadmap)

- [x] Canvas editor with Host / Network / Service nodes
- [ ] Import Compose v2.x → Blueprint graph
- [ ] Export Blueprint → stable docker-compose.yml
- [ ] Port/volume/name conflict detection
- [ ] 5+ appliance templates (drag-and-drop)
- [ ] SQLite persistence for blueprints
- [ ] Light/dark theme

_See [roadmap.md](docs/product/roadmap.md) for full plan._

---

## 🚀 Quickstart

### Docker (Production)
```bash
docker run -d -p 3000:3000 \
  -v $(pwd)/dockitect-data:/data \
  ghcr.io/yourusername/dockitect:latest
````

Visit `http://localhost:3000`

### Development

```bash
git clone https://github.com/yourusername/dockitect.git
cd dockitect
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

---

## 📁 Project Structure

```
apps/web/              # Next.js app (UI, API)
packages/
  schema/              # Blueprint Zod schema
  importer/            # Compose → Blueprint parser
  exporter/            # Blueprint → Compose generator
templates/appliances/  # Pre-built service templates
docs/                  # Documentation (Docusaurus)
```

---

## 🧪 Testing

```bash
pnpm test              # Vitest unit tests
pnpm test:coverage     # With coverage report
pnpm e2e               # Playwright e2e tests
```

---

## 🧰 Tech Stack

**Frontend:** Next.js (App Router) • TypeScript • Tailwind • shadcn/ui • React Flow
**Backend:** Prisma + SQLite • Zod validation
**Testing:** Vitest • Playwright
**CI/CD:** GitHub Actions • semantic-release • Docker buildx

---

## 🔒 Security

- **No Docker socket** required (file-based import/export only)
- **No telemetry** by default (opt-in flag)
- **Coordinated disclosure:** See [SECURITY.md](SECURITY.md)

---

## 📝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, style guide, and PR process.

**Quick start:**

1. Fork & clone
2. `pnpm install && pnpm dev`
3. Create branch: `feat/your-feature`
4. Commit with [Conventional Commits](https://www.conventionalcommits.org/)
5. Open PR with tests + screenshots

---

## 📄 License

[MIT](LICENSE) © 2025 Dockitect Contributors

---

## 🗺️ Roadmap

See [docs/product/roadmap.md](docs/product/roadmap.md) for phased plan (P0 → P7).

**Next up:**

- P1: MVP Importer (Compose → Blueprint)
- P2: MVP Exporter (Blueprint → Compose)
- P3: Conflict Lint & Auto-fix

---

## 🙏 Acknowledgments

Built with [Next.js](https://nextjs.org), [React Flow](https://reactflow.dev), [shadcn/ui](https://ui.shadcn.com), [Prisma](https://prisma.io), and [Zod](https://zod.dev).

Inspired by the homelab community on [r/selfhosted](https://reddit.com/r/selfhosted) and [r/homelab](https://reddit.com/r/homelab).
EOF

```

**Tests:**
- Render README locally (GitHub markdown preview)

**Docs:**
- N/A (README is the entry point)

**Commit:**
```

docs: create initial README with quickstart and roadmap

````

**PR:**
- Title: `docs: create initial README with quickstart and roadmap`
- Description:
  - Add comprehensive README with badges, features, quickstart
  - Include project structure, tech stack, contributing links
  - Reference roadmap and security policy
- Labels: `type: docs`, `phase: p0`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `build`

---

## P1: MVP Importer (Compose v2.x → Blueprint)

### P1.1: Define Blueprint v0 Schema (Zod) ⬜

**Files:**
- `/packages/schema/package.json`
- `/packages/schema/src/index.ts`
- `/packages/schema/src/blueprint.ts`
- `/packages/schema/src/__tests__/blueprint.test.ts`

**Commands:**
```bash
cd packages/schema
pnpm init
pnpm add zod zod-to-json-schema
pnpm add -D typescript vitest
````

**Tests:**

- Unit tests: validate valid/invalid Blueprint instances
- Test: export JSON Schema from Zod
- Coverage: ≥90%

**Docs:**

- Update architecture.md with Blueprint schema details
- Update ADR-0001 with final schema

**Commit:**

```
feat(schema): define Blueprint v0 with Zod validation
```

**PR:**

- Title: `feat(schema): define Blueprint v0 with Zod validation`
- Description:
    - Implement Blueprint v0 schema with Host, Network, Service types
    - Add Zod validation with strict typing
    - Export JSON Schema for API documentation
    - 90% test coverage with valid/invalid fixtures
- Labels: `type: feature`, `phase: p1`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`

---

### P1.2: Implement Compose → Blueprint Parser ⬜

**Files:**

- `/packages/importer/package.json`
- `/packages/importer/src/index.ts`
- `/packages/importer/src/parser.ts`
- `/packages/importer/src/__fixtures__/*.yml` (5+ test fixtures)
- `/packages/importer/src/__tests__/parser.test.ts`

**Commands:**

```bash
cd packages/importer
pnpm init
pnpm add yaml @dockitect/schema
pnpm add -D typescript vitest
```

**Tests:**

- Fixtures: simple.yml, multi-service.yml, networks.yml, volumes.yml, ports.yml
- Round-trip test: parse → export → parse (semantic equality)
- Edge cases: empty compose, missing services, invalid YAML
- Coverage: ≥80%

**Docs:**

- Update architecture.md with importer data flow
- Create `/docs/how-to/import-compose.md`

**Commit:**

```
feat(importer): implement Compose v2.x to Blueprint parser
```

**PR:**

- Title: `feat(importer): implement Compose v2.x to Blueprint parser`
- Description:
    - Parse docker-compose.yml (v2.x) into Blueprint v0
    - Handle services, networks, volumes, ports, env vars
    - 5 test fixtures covering common patterns
    - Error handling for invalid/unsupported features
- Labels: `type: feature`, `phase: p1`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`

---

### P1.3: File Upload UI Component ⬜

**Files:**

- `/apps/web/components/UploadButton.tsx`
- `/apps/web/app/api/upload/route.ts` (Next.js API route)
- `/apps/web/tests/e2e/upload.spec.ts`

**Commands:**

```bash
cd apps/web
pnpm add @dockitect/importer @dockitect/schema
```

**Tests:**

- E2E: upload valid compose → verify success message
- E2E: upload invalid file → verify error message
- Unit: test API route with mocked files

**Docs:**

- Update how-to/import-compose.md with UI instructions

**Commit:**

```
feat(ui): add file upload component for compose import
```

**PR:**

- Title: `feat(ui): add file upload component for compose import`
- Description:
    - File input with .yml/.yaml filter
    - API route calls importer package
    - Display success/error feedback
    - E2E test verifies upload flow
- Labels: `type: feature`, `phase: p1`, `priority: high`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P1.4: Render Service Nodes on Canvas ⬜

**Files:**

- `/apps/web/components/nodes/ServiceNode.tsx`
- `/apps/web/components/nodes/NetworkNode.tsx`
- `/apps/web/lib/blueprintToNodes.ts` (convert Blueprint → React Flow nodes)
- `/apps/web/tests/e2e/canvas-render.spec.ts`

**Commands:**

```bash
cd apps/web
# No new deps (React Flow already added)
```

**Tests:**

- Unit: blueprintToNodes converts Blueprint to React Flow node format
- E2E: upload jellyfin.yml → verify 1 service node rendered with correct label

**Docs:**

- Update architecture.md with canvas rendering details

**Commit:**

```
feat(canvas): render Service and Network nodes from Blueprint
```

**PR:**

- Title: `feat(canvas): render Service and Network nodes from Blueprint`
- Description:
    - Convert Blueprint to React Flow node/edge format
    - ServiceNode component displays name, image, ports
    - NetworkNode shows network name and driver
    - E2E test: upload → verify nodes rendered
- Labels: `type: feature`, `phase: p1`, `priority: critical`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P1.5: Connect Services to Networks (Edges) ⬜

**Files:**

- `/apps/web/lib/blueprintToEdges.ts`
- `/apps/web/components/Canvas.tsx` (update to render edges)
- `/apps/web/tests/e2e/canvas-edges.spec.ts`

**Commands:**

```bash
cd apps/web
# No new deps
```

**Tests:**

- Unit: blueprintToEdges creates correct edge connections
- E2E: upload compose with 2 services on same network → verify edge exists

**Docs:**

- Update architecture.md with edge rendering logic

**Commit:**

```
feat(canvas): render edges connecting services to networks
```

**PR:**

- Title: `feat(canvas): render edges connecting services to networks`
- Description:
    - Generate React Flow edges from service.networks
    - Visual connections between ServiceNode and NetworkNode
    - E2E test validates edge rendering
- Labels: `type: feature`, `phase: p1`, `priority: high`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P1.6: Add Importer Test Fixtures ⬜

**Files:**

- `/packages/importer/__fixtures__/simple.yml`
- `/packages/importer/__fixtures__/multi-service.yml`
- `/packages/importer/__fixtures__/networks.yml`
- `/packages/importer/__fixtures__/volumes.yml`
- `/packages/importer/__fixtures__/ports.yml`
- `/packages/importer/__fixtures__/jellyfin.yml`

**Commands:**

```bash
# Create fixtures manually or copy from real compose files
```

**Tests:**

- Each fixture has corresponding test in parser.test.ts
- Validate all fixtures parse without errors

**Docs:**

- Document fixture format in /docs/tech/testing.md

**Commit:**

```
test(importer): add 6 compose fixtures for parser validation
```

**PR:**

- Title: `test(importer): add 6 compose fixtures for parser validation`
- Description:
    - Add realistic docker-compose.yml fixtures
    - Cover: simple service, multi-service, networks, volumes, ports
    - Include Jellyfin template for e2e testing
- Labels: `type: test`, `phase: p1`, `priority: medium`
- Reviewers: @maintainer
- CI Checks: `test`

---

### P1.7: Create Animated GIF: "Upload Compose → See Topology" ⬜

**Files:**

- `/docs/media/demo-import.gif`
- Update `/README.md` to embed GIF

**Commands:**

```bash
# Use tools like asciinema, LICEcap, or ScreenToGif
# Record: homepage → upload jellyfin.yml → canvas renders nodes
mkdir -p docs/media
# Save GIF to docs/media/demo-import.gif
```

**Tests:**

- Visual inspection: GIF plays smoothly, shows full flow

**Docs:**

- Update README with GIF

**Commit:**

```
docs: add demo GIF for import flow (upload → canvas)
```

**PR:**

- Title: `docs: add demo GIF for import flow (upload → canvas)`
- Description:
    - Record import workflow: upload compose → canvas renders
    - Embed in README for visual appeal
    - GIF <2MB, optimized for web
- Labels: `type: docs`, `phase: p1`, `priority: low`
- Reviewers: @maintainer
- CI Checks: `build`

---

## P2: MVP Exporter (Blueprint → Compose v2.x)

### P2.1: Implement Blueprint → Compose Generator ⬜

**Files:**

- `/packages/exporter/package.json`
- `/packages/exporter/src/index.ts`
- `/packages/exporter/src/generator.ts`
- `/packages/exporter/src/__tests__/generator.test.ts`

**Commands:**

```bash
cd packages/exporter
pnpm init
pnpm add yaml fast-json-stable-stringify @dockitect/schema
pnpm add -D typescript vitest
```

**Tests:**

- Unit: Blueprint → YAML with stable key order
- Snapshot tests: multiple exports produce identical output
- Validate with `docker compose config` (requires Docker CLI)
- Coverage: ≥80%

**Docs:**

- Create `/docs/adr/0003-export-determinism.md`
- Update architecture.md with exporter details

**Commit:**

```
feat(exporter): implement deterministic Blueprint to Compose generator
```

**PR:**

- Title: `feat(exporter): implement deterministic Blueprint to Compose generator`
- Description:
    - Generate docker-compose.yml from Blueprint v0
    - Stable alphabetical key ordering (services, networks, volumes)
    - Use fast-json-stable-stringify for object stability
    - Snapshot tests ensure determinism
- Labels: `type: feature`, `phase: p2`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`

---

### P2.2: Export Button UI ⬜

**Files:**

- `/apps/web/components/ExportButton.tsx`
- `/apps/web/app/api/export/route.ts`
- `/apps/web/tests/e2e/export.spec.ts`

**Commands:**

```bash
cd apps/web
pnpm add @dockitect/exporter
```

**Tests:**

- E2E: draw 2 services → export → download file
- E2E: verify downloaded file is valid YAML

**Docs:**

- Create `/docs/how-to/export-compose.md`

**Commit:**

```
feat(ui): add export button to download compose from canvas
```

**PR:**

- Title: `feat(ui): add export button to download compose from canvas`
- Description:
    - Export button triggers API route
    - Download docker-compose.yml with correct MIME type
    - E2E test verifies file download
- Labels: `type: feature`, `phase: p2`, `priority: high`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P2.3: Round-Trip Tests (Import → Export → Import) ⬜

**Files:**

- `/packages/importer/src/__tests__/roundtrip.test.ts`

**Commands:**

```bash
cd packages/importer
pnpm add -D @dockitect/exporter
```

**Tests:**

- For each fixture: import → export → re-import → compare Blueprints
- Assert semantic equivalence (ignoring metadata differences)

**Docs:**

- Document round-trip testing in /docs/tech/testing.md

**Commit:**

```
test(importer): add round-trip tests (import → export → import)
```

**PR:**

- Title: `test(importer): add round-trip tests (import → export → import)`
- Description:
    - Validate import/export parity with round-trip tests
    - Assert semantic equivalence of Blueprints
    - Cover all importer fixtures
- Labels: `type: test`, `phase: p2`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `test`

---

### P2.4: Validate Exported Compose with Docker CLI ⬜

**Files:**

- `/scripts/validate-compose.sh`
- `/.github/workflows/ci.yml` (add compose validation step)

**Commands:**

```bash
mkdir -p scripts
cat > scripts/validate-compose.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${1:-docker-compose.yml}"

if ! command -v docker &> /dev/null; then
  echo "Docker not found, skipping validation"
  exit 0
fi

echo "Validating $COMPOSE_FILE with docker compose config..."
docker compose -f "$COMPOSE_FILE" config --quiet
echo "✓ Compose file is valid"
EOF
chmod +x scripts/validate-compose.sh
```

**Tests:**

- CI runs validation on exported fixtures
- Local test: `./scripts/validate-compose.sh fixtures/exported.yml`

**Docs:**

- Document validation script in CONTRIBUTING.md

**Commit:**

```
ci: add Docker compose validation script
```

**PR:**

- Title: `ci: add Docker compose validation script`
- Description:
    - Script validates exported compose with `docker compose config`
    - Integrated into CI workflow
    - Skips if Docker not available
- Labels: `type: ci`, `phase: p2`, `priority: medium`
- Reviewers: @maintainer
- CI Checks: `build-test`, `validate-compose`

---

### P2.5: ADR-0003: Export Determinism ⬜

**Files:**

- `/docs/adr/0003-export-determinism.md`

**Commands:**

```bash
cat > docs/adr/0003-export-determinism.md <<'EOF'
# ADR-0003: Export Determinism Strategy

**Status:** Accepted
**Date:** 2025-10-02
**Authors:** @yourusername

## Context

Deterministic compose export is critical for:
- Clean Git diffs (version control for infrastructure)
- Reproducible builds
- User trust (same input → same output)

## Decision

**Strategy:**
1. **Alphabetical key ordering:** Sort all top-level keys (services, networks, volumes)
2. **Service-level sorting:** Sort service keys alphabetically
3. **Array stability:** Preserve insertion order for arrays (ports, volumes, env)
4. **Object stability:** Use `fast-json-stable-stringify` for nested objects

**Implementation:**
- Custom YAML serializer with key sort comparator
- Snapshot tests to detect regressions

## Consequences

**Positive:**
- Diffable exports (Git-friendly)
- Predictable output (same Blueprint → identical YAML)

**Negative:**
- Slight performance cost (sorting overhead)
- Custom YAML serialization logic (maintenance)

**Neutral:**
- Keys appear alphabetically (may differ from user's original order)

## Alternatives Considered

### 1. Preserve original order
**Rejected:** Loses determinism (insertion order varies), breaks diffs.

### 2. Canonical JSON + YAML conversion
**Rejected:** JSON doesn't support YAML features (anchors, multi-line), loses fidelity.

## References
- [fast-json-stable-stringify](https://github.com/epoberezkin/fast-json-stable-stringify)
- [YAML 1.2 spec](https://yaml.org/spec/1.2/spec.html)
EOF
```

**Tests:**

- N/A (documentation)

**Docs:**

- Link from architecture.md

**Commit:**

```
docs(adr): add ADR-0003 on export determinism strategy
```

**PR:**

- Title: `docs(adr): add ADR-0003 on export determinism strategy`
- Description:
    - Document approach for stable YAML exports
    - Explain alphabetical sorting and array preservation
    - List alternatives considered
- Labels: `type: docs`, `phase: p2`, `priority: medium`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P2.6: Create Animated GIF: "Draw Topology → Export Compose" ⬜

**Files:**

- `/docs/media/demo-export.gif`
- Update `/README.md`

**Commands:**

```bash
# Record: draw 2 services on canvas → click export → download
# Save to docs/media/demo-export.gif
```

**Tests:**

- Visual inspection

**Docs:**

- Update README with export GIF

**Commit:**

```
docs: add demo GIF for export flow (draw → export)
```

**PR:**

- Title: `docs: add demo GIF for export flow (draw → export)`
- Description:
    - Record export workflow: canvas → export button → download
    - Embed in README
    - GIF <2MB, optimized
- Labels: `type: docs`, `phase: p2`, `priority: low`
- Reviewers: @maintainer
- CI Checks: `build`

---

## P3: Conflict Lint & Validation

### P3.1: Implement Validation Engine (Zod Refinements) ⬜

**Files:**

- `/packages/schema/src/validators.ts`
- `/packages/schema/src/__tests__/validators.test.ts`

**Commands:**

```bash
cd packages/schema
# No new deps (use Zod refinements)
```

**Tests:**

- Unit test each rule: duplicate ports, names, volume conflicts, missing env
- Positive/negative cases
- Coverage: ≥90%

**Docs:**

- Create `/docs/reference/lint-rules.md`

**Commit:**

```
feat(schema): add conflict validation rules (ports, names, volumes, env)
```

**PR:**

- Title: `feat(schema): add conflict validation rules (ports, names, volumes, env)`
- Description:
    - Zod refinements for 4 lint rules
    - Duplicate port detection (same host/network)
    - Duplicate service name detection
    - Volume target conflict detection (RW vs RO)
    - Missing env var detection
    - 90% test coverage
- Labels: `type: feature`, `phase: p3`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`

---

### P3.2: Conflict Panel UI Component ⬜

**Files:**

- `/apps/web/components/ConflictPanel.tsx`
- `/apps/web/lib/useValidation.ts` (hook to run validation)
- `/apps/web/tests/e2e/conflict-panel.spec.ts`

**Commands:**

```bash
cd apps/web
pnpm add @dockitect/schema
```

**Tests:**

- E2E: upload conflicting-ports.yml → verify panel shows 2 errors
- E2E: click node with conflict → panel highlights it

**Docs:**

- Update how-to/import-compose.md with conflict detection section

**Commit:**

```
feat(ui): add conflict panel to display validation errors/warnings
```

**PR:**

- Title: `feat(ui): add conflict panel to display validation errors/warnings`
- Description:
    - Sidebar panel lists all conflicts with severity (error/warning)
    - Click conflict → highlight affected node on canvas
    - Debounced validation (500ms) on canvas changes
    - E2E test verifies panel functionality
- Labels: `type: feature`, `phase: p3`, `priority: high`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P3.3: Canvas Node Badges for Conflicts ⬜

**Files:**

- `/apps/web/components/nodes/ServiceNode.tsx` (add badge)
- `/apps/web/components/nodes/ConflictBadge.tsx`

**Commands:**

```bash
cd apps/web
# No new deps (use Tailwind for styling)
```

**Tests:**

- E2E: upload conflicting compose → verify red badge on service node
- Unit: ConflictBadge renders error/warning states

**Docs:**

- Update UI screenshots in README (after implementation)

**Commit:**

```
feat(ui): add visual badges to canvas nodes for conflicts
```

**PR:**

- Title: `feat(ui): add visual badges to canvas nodes for conflicts`
- Description:
    - Red badge for errors, yellow for warnings
    - Badge shows conflict count
    - Hover shows tooltip with conflict details
    - E2E test validates badge rendering
- Labels: `type: feature`, `phase: p3`, `priority: medium`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P3.4: Auto-Fix Suggestions (Port Increment, Service Rename) ⬜

**Files:**

- `/packages/schema/src/autofix.ts`
- `/apps/web/components/ConflictPanel.tsx` (add fix button)
- `/packages/schema/src/__tests__/autofix.test.ts`

**Commands:**

```bash
cd packages/schema
# No new deps
```

**Tests:**

- Unit: auto-fix increments duplicate port
- Unit: auto-fix appends suffix to duplicate service name
- E2E: click fix → verify conflict resolved

**Docs:**

- Document auto-fix logic in /docs/reference/lint-rules.md

**Commit:**

```
feat(schema): add auto-fix for port collisions and duplicate names
```

**PR:**

- Title: `feat(schema): add auto-fix for port collisions and duplicate names`
- Description:
    - Auto-increment duplicate ports (8080 → 8081)
    - Auto-rename duplicate services (app → app-2)
    - "Fix" button in conflict panel applies suggestions
    - E2E test: fix conflict → export valid compose
- Labels: `type: feature`, `phase: p3`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P3.5: Add Conflicting Compose Fixtures ⬜

**Files:**

- `/packages/importer/__fixtures__/conflicting-ports.yml`
- `/packages/importer/__fixtures__/duplicate-names.yml`
- `/packages/importer/__fixtures__/volume-conflicts.yml`

**Commands:**

```bash
# Create fixtures with intentional conflicts
```

**Tests:**

- Validation tests catch expected errors/warnings

**Docs:**

- Add to /docs/tech/testing.md

**Commit:**

```
test: add fixtures for conflict detection (ports, names, volumes)
```

**PR:**

- Title: `test: add fixtures for conflict detection (ports, names, volumes)`
- Description:
    - Fixtures with intentional conflicts for testing
    - Cover port collisions, duplicate names, volume RW/RO conflicts
    - Used in validation and auto-fix tests
- Labels: `type: test`, `phase: p3`, `priority: medium`
- Reviewers: @maintainer
- CI Checks: `test`

---

### P3.6: Create Animated GIF: "Detect Port Conflict → Auto-Fix" ⬜

**Files:**

- `/docs/media/demo-conflict.gif`
- Update `/README.md`

**Commands:**

```bash
# Record: upload conflicting-ports.yml → panel shows error → click fix → badge clears
```

**Tests:**

- Visual inspection

**Docs:**

- Update README with conflict GIF

**Commit:**

```
docs: add demo GIF for conflict detection and auto-fix
```

**PR:**

- Title: `docs: add demo GIF for conflict detection and auto-fix`
- Description:
    - Record conflict workflow: upload → detect → fix
    - Embed in README
    - GIF <2MB
- Labels: `type: docs`, `phase: p3`, `priority: low`
- Reviewers: @maintainer
- CI Checks: `build`

---

## P4: Templates & DX Improvements

### P4.1: Create 5 Appliance Templates ⬜

**Files:**

- `/templates/appliances/jellyfin.json`
- `/templates/appliances/uptime-kuma.json`
- `/templates/appliances/immich.json`
- `/templates/appliances/nextcloud.json`
- `/templates/appliances/paperless-ngx.json`
- `/templates/appliances/index.ts` (export list)

**Commands:**

```bash
cd templates/appliances
# Create JSON files conforming to Blueprint service schema
```

**Tests:**

- CI validates all templates against Blueprint schema
- Unit test: load and parse each template

**Docs:**

- Create `/docs/reference/templates.md` with descriptions

**Commit:**

```
feat(templates): add 5 appliance templates (Jellyfin, Uptime-Kuma, Immich, Nextcloud, Paperless-ngx)
```

**PR:**

- Title: `feat(templates): add 5 appliance templates (Jellyfin, Uptime-Kuma, Immich, Nextcloud, Paperless-ngx)`
- Description:
    - Pre-configured service templates with default ports, volumes, env
    - Validated against Blueprint schema
    - Includes metadata: name, description, icon
    - CI test ensures templates remain valid
- Labels: `type: feature`, `phase: p4`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `test`

---

### P4.2: Template Gallery UI ⬜

**Files:**

- `/apps/web/components/TemplateGallery.tsx`
- `/apps/web/components/TemplateCard.tsx`
- `/apps/web/tests/e2e/templates.spec.ts`

**Commands:**

```bash
cd apps/web
# No new deps (templates are JSON)
```

**Tests:**

- E2E: open gallery → see 5 templates → drag to canvas → verify node created

**Docs:**

- Create `/docs/how-to/use-templates.md`

**Commit:**

```
feat(ui): add template gallery sidebar with drag-and-drop
```

**PR:**

- Title: `feat(ui): add template gallery sidebar with drag-and-drop`
- Description:
    - Sidebar panel lists appliance templates
    - Drag template onto canvas creates pre-configured service
    - Cards show icon, name, description
    - E2E test validates drag-and-drop flow
- Labels: `type: feature`, `phase: p4`, `priority: high`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P4.3: Canvas Minimap & Zoom Controls ⬜

**Files:**

- `/apps/web/components/Canvas.tsx` (add React Flow minimap & controls)

**Commands:**

```bash
cd apps/web
pnpm add @xyflow/react # Already added, use built-in components
```

**Tests:**

- E2E: verify minimap visible, zoom buttons work

**Docs:**

- Update architecture.md with UX features

**Commit:**

```
feat(canvas): add minimap and zoom controls
```

**PR:**

- Title: `feat(canvas): add minimap and zoom controls`
- Description:
    - Enable React Flow minimap for navigation
    - Add zoom in/out/fit controls
    - Improve canvas UX for large graphs
    - E2E test verifies controls render
- Labels: `type: feature`, `phase: p4`, `priority: medium`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P4.4: Implement Undo/Redo ⬜

**Files:**

- `/apps/web/lib/store.ts` (add undo/redo to Zustand)
- `/apps/web/components/UndoRedo.tsx` (buttons)

**Commands:**

```bash
cd apps/web
pnpm add zustand # Already added
```

**Tests:**

- E2E: add node → delete → undo → verify node restored
- Unit: test undo/redo state transitions

**Docs:**

- Update how-to docs with keyboard shortcuts

**Commit:**

```
feat(canvas): add undo/redo with Ctrl+Z/Ctrl+Y support
```

**PR:**

- Title: `feat(canvas): add undo/redo with Ctrl+Z/Ctrl+Y support`
- Description:
    - Undo/redo buttons in toolbar
    - Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)
    - Maintains 50-step history
    - E2E test validates undo/redo flow
- Labels: `type: feature`, `phase: p4`, `priority: medium`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P4.5: Better Import Error Messages ⬜

**Files:**

- `/packages/importer/src/errors.ts`
- `/apps/web/components/ImportError.tsx`

**Commands:**

```bash
cd packages/importer
# No new deps
```

**Tests:**

- Unit: test error formatting with line numbers
- E2E: upload invalid YAML → verify error shows line number

**Docs:**

- Update how-to/import-compose.md with troubleshooting section

**Commit:**

```
feat(importer): improve error messages with line numbers and context
```

**PR:**

- Title: `feat(importer): improve error messages with line numbers and context`
- Description:
    - Parse errors show YAML line numbers
    - Validation errors highlight problematic fields
    - User-friendly error messages (not raw stack traces)
    - E2E test verifies error display
- Labels: `type: feature`, `phase: p4`, `priority: medium`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P4.6: Create Animated GIF: "Drag Template → Customize → Export" ⬜

**Files:**

- `/docs/media/demo-templates.gif`
- Update `/README.md`

**Commands:**

```bash
# Record: open gallery → drag Jellyfin → edit ports → export
```

**Tests:**

- Visual inspection

**Docs:**

- Update README with templates GIF

**Commit:**

```
docs: add demo GIF for template usage
```

**PR:**

- Title: `docs: add demo GIF for template usage`
- Description:
    - Record template workflow: drag → customize → export
    - Embed in README
    - GIF <2MB
- Labels: `type: docs`, `phase: p4`, `priority: low`
- Reviewers: @maintainer
- CI Checks: `build`

---

## P5: Persistence & Settings

### P5.1: Set Up Prisma + SQLite ⬜

**Files:**

- `/apps/web/prisma/schema.prisma`
- `/apps/web/prisma/migrations/` (auto-generated)
- `/apps/web/lib/db.ts` (Prisma client)

**Commands:**

```bash
cd apps/web
pnpm add prisma @prisma/client
pnpm exec prisma init --datasource-provider sqlite

cat > prisma/schema.prisma <<'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Project {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  blueprints Blueprint[]
}

model Blueprint {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  version   String   @default("v0")
  data      String   // JSON Blueprint
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
EOF

echo "DATABASE_URL=file:./dev.db" > .env
pnpm exec prisma migrate dev --name init
pnpm exec prisma generate
```

**Tests:**

- Unit: CRUD operations on Project and Blueprint models
- E2E: create project → verify in DB

**Docs:**

- Create `/docs/adr/0002-persistence.md`

**Commit:**

```
feat(db): set up Prisma with SQLite for blueprint persistence
```

**PR:**

- Title: `feat(db): set up Prisma with SQLite for blueprint persistence`
- Description:
    - Add Prisma with SQLite datasource
    - Define Project and Blueprint models
    - Initial migration
    - Prisma client setup
- Labels: `type: feature`, `phase: p5`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `build`

---

### P5.2: CRUD API Routes for Projects ⬜

**Files:**

- `/apps/web/app/api/projects/route.ts` (list, create)
- `/apps/web/app/api/projects/[id]/route.ts` (get, update, delete)
- `/apps/web/lib/repositories/projectRepository.ts`

**Commands:**

```bash
cd apps/web
# No new deps
```

**Tests:**

- Unit: test repository methods
- E2E: API calls create/read/update/delete projects

**Docs:**

- Create `/docs/reference/api.md`

**Commit:**

```
feat(api): add CRUD endpoints for project management
```

**PR:**

- Title: `feat(api): add CRUD endpoints for project management`
- Description:
    - POST /api/projects (create)
    - GET /api/projects (list)
    - GET /api/projects/:id (read)
    - PATCH /api/projects/:id (update)
    - DELETE /api/projects/:id (delete)
    - Repository pattern for DB access
- Labels: `type: feature`, `phase: p5`, `priority: high`, `area: api`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `build`

---

### P5.3: Save/Load Blueprint UI ⬜

**Files:**

- `/apps/web/components/SaveButton.tsx`
- `/apps/web/components/ProjectSwitcher.tsx`
- `/apps/web/app/projects/page.tsx` (projects list)

**Commands:**

```bash
cd apps/web
# No new deps
```

**Tests:**

- E2E: create project → add services → save → reload page → verify blueprint loaded
- E2E: switch projects → verify canvas updates

**Docs:**

- Update how-to docs with save/load instructions

**Commit:**

```
feat(ui): add save/load buttons and project switcher
```

**PR:**

- Title: `feat(ui): add save/load buttons and project switcher`
- Description:
    - Save button persists current blueprint to DB
    - Projects list page shows all saved blueprints
    - Project switcher in toolbar
    - E2E test validates save/load flow
- Labels: `type: feature`, `phase: p5`, `priority: high`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P5.4: Auto-Save (Debounced 2s) ⬜

**Files:**

- `/apps/web/lib/useAutoSave.ts` (hook)
- `/apps/web/components/AutoSaveIndicator.tsx`

**Commands:**

```bash
cd apps/web
# No new deps
```

**Tests:**

- E2E: edit canvas → wait 2s → verify "saved" indicator

**Docs:**

- Update architecture.md with auto-save logic

**Commit:**

```
feat(ui): add auto-save with 2s debounce and indicator
```

**PR:**

- Title: `feat(ui): add auto-save with 2s debounce and indicator`
- Description:
    - Auto-save triggers 2s after last canvas change
    - Indicator shows "saving..." / "saved" / "error"
    - Debounced to avoid excessive DB writes
    - E2E test verifies auto-save behavior
- Labels: `type: feature`, `phase: p5`, `priority: medium`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P5.5: Settings Panel (Theme, Export Prefs, Telemetry) ⬜

**Files:**

- `/apps/web/components/SettingsModal.tsx`
- `/apps/web/lib/settings.ts` (localStorage wrapper)

**Commands:**

```bash
cd apps/web
pnpm add next-themes # For theme toggle
```

**Tests:**

- E2E: toggle theme → verify dark mode applied
- Unit: test settings persistence to localStorage

**Docs:**

- Update how-to docs with settings instructions

**Commit:**

```
feat(ui): add settings panel with theme and export preferences
```

**PR:**

- Title: `feat(ui): add settings panel with theme and export preferences`
- Description:
    - Theme toggle (light/dark)
    - Export format preferences (indent size, comments)
    - Telemetry opt-in (default off)
    - Settings persist in localStorage
    - E2E test verifies settings panel
- Labels: `type: feature`, `phase: p5`, `priority: medium`, `area: ui`
- Reviewers: @maintainer
- CI Checks: `typecheck`, `lint`, `test`, `e2e`, `build`

---

### P5.6: ADR-0002: Persistence Strategy ⬜

**Files:**

- `/docs/adr/0002-persistence.md`

**Commands:**

```bash
cat > docs/adr/0002-persistence.md <<'EOF'
# ADR-0002: Persistence Strategy

**Status:** Accepted
**Date:** 2025-10-02
**Authors:** @yourusername

## Context

Dockitect needs to:
- Save blueprints across sessions
- Support multiple projects
- Work in Docker (single container)
- Avoid external dependencies (Postgres, Redis)

## Decision

Use **Prisma + SQLite** with file-based database.

**Schema:**
- `Project`: id, name, createdAt, updatedAt
- `Blueprint`: id, projectId, version, data (JSON), createdAt, updatedAt

**Storage:**
- Docker: `/data/db.sqlite` volume mount
- Dev: `./prisma/dev.db` local file

**Access:**
- Next.js API routes (server-side only)
- Repository pattern for DB operations

## Consequences

**Positive:**
- Zero-config for users (no DB setup)
- File-based backups (copy /data folder)
- Prisma type safety and migrations
- Works offline

**Negative:**
- Single-user (no concurrent writes at scale)
- SQLite locking on high concurrency (mitigated by WAL mode)

**Neutral:**
- Migration scripts required for schema changes

## Alternatives Considered

### 1. PostgreSQL
**Rejected:** Requires separate container, overkill for single-user app.

### 2. localStorage only
**Rejected:** No server-side access, limited storage (5-10MB), no backups.

### 3. JSON files
**Rejected:** No query capability, manual locking, harder migrations.

## References
- [Prisma docs](https://prisma.io)
- [SQLite WAL mode](https://sqlite.org/wal.html)
EOF
```

**Tests:**

- N/A (documentation)

**Docs:**

- Link from architecture.md

**Commit:**

```
docs(adr): add ADR-0002 on persistence strategy (Prisma + SQLite)
```

**PR:**

- Title: `docs(adr): add ADR-0002 on persistence strategy (Prisma + SQLite)`
- Description:
    - Document decision to use Prisma with SQLite
    - Explain schema, storage, and access patterns
    - List alternatives considered
- Labels: `type: docs`, `phase: p5`, `priority: medium`
- Reviewers: @maintainer
- CI Checks: `build`

---

## P6: Documentation & Release Preparation

### P6.1: Set Up Docusaurus Site ⬜

**Files:**

- `/docs/docusaurus.config.js`
- `/docs/package.json`
- `/docs/src/pages/index.md`
- `/docs/docs/` (copy existing docs)

**Commands:**

```bash
cd docs
pnpm create docusaurus@latest . classic --typescript
pnpm install
pnpm start # Verify site runs
```

**Tests:**

- Build: `pnpm build` succeeds
- Serve: `pnpm serve` renders site

**Docs:**

- Migrate existing .md files to Docusaurus structure

**Commit:**

```
docs: set up Docusaurus site for documentation
```

**PR:**

- Title: `docs: set up Docusaurus site for documentation`
- Description:
    - Initialize Docusaurus with classic theme
    - Migrate existing docs to /docs structure
    - Configure navigation and sidebar
    - Deploy preview on PR
- Labels: `type: docs`, `phase: p6`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `build` (docs build)

---

### P6.2: Write Getting Started Guide ⬜

**Files:**

- `/docs/docs/getting-started/installation.md`
- `/docs/docs/getting-started/quickstart.md`
- `/docs/docs/getting-started/first-blueprint.md`

**Commands:**

```bash
mkdir -p docs/docs/getting-started
# Write guides (see content below)
```

**Tests:**

- Manually test all commands in guides

**Docs:**

- Link from Docusaurus homepage

**Commit:**

```
docs: add Getting Started guide (installation, quickstart, first blueprint)
```

**PR:**

- Title: `docs: add Getting Started guide (installation, quickstart, first blueprint)`
- Description:
    - Installation guide: Docker, pnpm, requirements
    - Quickstart: run app, upload compose, export
    - First blueprint tutorial: step-by-step canvas usage
- Labels: `type: docs`, `phase: p6`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P6.3: API Reference Documentation ⬜

**Files:**

- `/docs/docs/reference/api.md`
- `/docs/docs/reference/blueprint-schema.md` (JSON Schema export)

**Commands:**

```bash
mkdir -p docs/docs/reference
# Generate JSON Schema from Zod, include in docs
```

**Tests:**

- Validate JSON Schema renders correctly

**Docs:**

- Link API reference from sidebar

**Commit:**

```
docs: add API reference and Blueprint JSON Schema
```

**PR:**

- Title: `docs: add API reference and Blueprint JSON Schema`
- Description:
    - Document all API endpoints (projects, blueprints)
    - Include request/response examples
    - Export Blueprint JSON Schema for reference
- Labels: `type: docs`, `phase: p6`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P6.4: Create Video Demo (2-3 min) ⬜

**Files:**

- `/docs/static/video/demo.mp4` or YouTube link

**Commands:**

```bash
# Record full workflow:
# 1. Docker run
# 2. Upload compose
# 3. Edit canvas (add template, fix conflict)
# 4. Export compose
# 5. Run exported compose
```

**Tests:**

- Visual inspection, clarity, audio

**Docs:**

- Embed in README and Docusaurus homepage

**Commit:**

```
docs: add video demo walkthrough (2min)
```

**PR:**

- Title: `docs: add video demo walkthrough (2min)`
- Description:
    - Full workflow demonstration
    - Voiceover explaining features
    - Embed in README and docs site
- Labels: `type: docs`, `phase: p6`, `priority: medium`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P6.5: Polish README with Screenshots & Architecture Diagram ⬜

**Files:**

- `/README.md` (update)
- `/docs/media/architecture.png` (C4 diagram)
- `/docs/media/screenshot-*.png` (3+ screenshots)

**Commands:**

```bash
# Take screenshots: canvas, conflict panel, template gallery
# Create C4 diagram using Mermaid or draw.io
```

**Tests:**

- Visual inspection

**Docs:**

- Update README with visuals

**Commit:**

```
docs: polish README with screenshots and architecture diagram
```

**PR:**

- Title: `docs: polish README with screenshots and architecture diagram`
- Description:
    - Add 3+ screenshots showing key features
    - Include C4 architecture diagram
    - Update badges (CI, version, license)
    - Improve quickstart section
- Labels: `type: docs`, `phase: p6`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P6.6: Security Audit (CodeQL, Dependencies) ⬜

**Files:**

- Update `/.github/workflows/codeql.yml` (ensure running)
- Review CodeQL results

**Commands:**

```bash
# Enable CodeQL on GitHub repo settings
# Review security alerts
pnpm audit
pnpm outdated
```

**Tests:**

- CodeQL scan passes with no high/critical issues
- No vulnerable dependencies

**Docs:**

- Update SECURITY.md with audit results

**Commit:**

```
chore(security): audit dependencies and CodeQL scan
```

**PR:**

- Title: `chore(security): audit dependencies and CodeQL scan`
- Description:
    - Review and resolve CodeQL alerts
    - Update vulnerable dependencies
    - Document security posture in SECURITY.md
- Labels: `type: chore`, `phase: p6`, `priority: high`, `area: security`
- Reviewers: @maintainer
- CI Checks: `codeql`, `build-test`

---

### P6.7: Add License Headers to Source Files ⬜

**Files:**

- All `.ts`, `.tsx`, `.js`, `.jsx` files

**Commands:**

```bash
# Use script or tool to prepend MIT license header
cat > scripts/add-license-headers.sh <<'EOF'
#!/usr/bin/env bash
HEADER="// Copyright (c) 2025 Dockitect Contributors. Licensed under MIT."
find . -name "*.ts" -o -name "*.tsx" | while read file; do
  if ! grep -q "Copyright" "$file"; then
    echo "$HEADER" | cat - "$file" > temp && mv temp "$file"
  fi
done
EOF
chmod +x scripts/add-license-headers.sh
./scripts/add-license-headers.sh
```

**Tests:**

- Verify headers added to all source files

**Docs:**

- N/A

**Commit:**

```
chore: add MIT license headers to all source files
```

**PR:**

- Title: `chore: add MIT license headers to all source files`
- Description:
    - Prepend copyright notice to all TS/TSX files
    - Ensure license compliance
    - Automated via script
- Labels: `type: chore`, `phase: p6`, `priority: low`
- Reviewers: @maintainer
- CI Checks: `build`

---

## P7: GA Release & Distribution

### P7.1: Docker Multi-Arch Build Workflow ⬜

**Files:**

- `/.github/workflows/docker.yml`
- `/Dockerfile`

**Commands:**

```bash
cat > .github/workflows/docker.yml <<'EOF'
name: Docker Build & Push

on:
  push:
    tags: ["v*.*.*"]

jobs:
  docker:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-qemu-action@v3

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          platforms: linux/amd64,linux/arm64
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.ref_name }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
EOF

cat > Dockerfile <<'EOF'
# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps ./apps
COPY packages ./packages
COPY templates ./templates

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build application
RUN pnpm -w build

# Production stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/data/db.sqlite

# Copy standalone build
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

# Create data directory
RUN mkdir -p /data && chown -R node:node /data
VOLUME ["/data"]

USER node
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
EOF
```

**Tests:**

- Local build: `docker build -t dockitect:test .`
- Run: `docker run -p 3000:3000 -v ./data:/data dockitect:test`
- Test on both amd64 and arm64 (via QEMU)

**Docs:**

- Update README with Docker installation instructions

**Commit:**

```
ci: add multi-arch Docker build workflow (amd64, arm64)
```

**PR:**

- Title: `ci: add multi-arch Docker build workflow (amd64, arm64)`
- Description:
    - GitHub Actions workflow for Docker builds on tags
    - Multi-stage Dockerfile with Next.js standalone
    - Push to GHCR with version tags
    - Layer caching for faster builds
- Labels: `type: ci`, `phase: p7`, `priority: critical`
- Reviewers: @maintainer
- CI Checks: `docker` (on tag push)

---

### P7.2: Semantic Release Configuration ⬜

**Files:**

- `/.releaserc.json`
- Update `/.github/workflows/release.yml`

**Commands:**

```bash
pnpm add -D -w semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github

cat > .releaserc.json <<'EOF'
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json", "pnpm-lock.yaml"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }]
  ]
}
EOF

cat > .github/workflows/release.yml <<'EOF'
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - run: pnpm run build

      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
EOF
```

**Tests:**

- Dry-run: `npx semantic-release --dry-run`

**Docs:**

- Update CONTRIBUTING.md with release process

**Commit:**

```
ci: configure semantic-release for automated versioning
```

**PR:**

- Title: `ci: configure semantic-release for automated versioning`
- Description:
    - Auto-generate CHANGELOG from commits
    - Create GitHub releases with notes
    - Bump version in package.json
    - Tag releases (vX.Y.Z)
- Labels: `type: ci`, `phase: p7`, `priority: high`
- Reviewers: @maintainer
- CI Checks: `release`

---

### P7.3: GitHub Release Notes Template ⬜

**Files:**

- `/.github/release.yml`

**Commands:**

```bash
cat > .github/release.yml <<'EOF'
changelog:
  categories:
    - title: 🚀 Features
      labels:
        - type: feature
    - title: 🐛 Bug Fixes
      labels:
        - type: fix
    - title: 📝 Documentation
      labels:
        - type: docs
    - title: 🔧 Maintenance
      labels:
        - type: chore
        - type: ci
    - title: ⚡ Performance
      labels:
        - type: perf
  exclude:
    labels:
      - skip-changelog
EOF
```

**Tests:**

- Create sample release notes with GitHub CLI

**Docs:**

- N/A

**Commit:**

```
chore: add GitHub release notes template
```

**PR:**

- Title: `chore: add GitHub release notes template`
- Description:
    - Categorize release notes by type (features, fixes, docs, etc.)
    - Improve changelog readability
    - Exclude skip-changelog labeled PRs
- Labels: `type: chore`, `phase: p7`, `priority: low`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P7.4: Tag v1.0.0 & Publish Release ⬜

**Files:**

- N/A (git operations)

**Commands:**

```bash
# Ensure main branch is ready
git checkout main
git pull origin main

# semantic-release will create tag automatically on merge to main
# Manually verify:
git tag v1.0.0
git push origin v1.0.0

# Or let semantic-release handle it after merging final PR
```

**Tests:**

- Verify Docker images pushed to GHCR
- Verify GitHub Release created with notes
- Test `docker run ghcr.io/<org>/dockitect:v1.0.0`

**Docs:**

- Release notes auto-generated

**Commit:**

```
# N/A (automated by semantic-release)
```

**PR:**

- N/A (tag triggers workflows)

---

### P7.5: Announcement Posts (Reddit, HN, Lobsters) ⬜

**Files:**

- `/docs/marketing/announcement-template.md`

**Commands:**

````bash
mkdir -p docs/marketing
cat > docs/marketing/announcement-template.md <<'EOF'
# Dockitect v1.0 — Visual Homelab Designer

I built **Dockitect**, an open-source web app to design homelab topologies on a canvas and export deterministic `docker-compose.yml` files.

**Key features:**
- 🎨 Visual canvas (drag services, networks, hosts)
- 📦 Import existing Compose → visualize graph
- 💾 Export deterministic YAML (Git-friendly diffs)
- 🔍 Conflict detection (ports, volumes, names)
- 🛠️ 5+ appliance templates (Jellyfin, Immich, Nextcloud, etc.)

**Tech stack:** Next.js, React Flow, Prisma + SQLite, TypeScript, Tailwind

**Try it:**
```bash
docker run -p 3000:3000 ghcr.io/<org>/dockitect:v1.0.0
````

**Links:**

- GitHub: <https://github.com/><org>/dockitect
- Docs: <https://dockitect.dev/docs>
- Demo: [GIF or YouTube]

Built for the r/selfhosted and r/homelab communities. Feedback welcome!
EOF

```

**Tests:**
- N/A (marketing content)

**Docs:**
- Post to Reddit (r/selfhosted, r/homelab), Hacker News, Lobsters, Twitter/X

**Commit:**
```

docs: add announcement template for v1.0 launch

````

**PR:**
- Title: `docs: add announcement template for v1.0 launch`
- Description:
  - Draft announcement post for community platforms
  - Includes feature highlights, quickstart, links
  - Ready to post on launch day
- Labels: `type: docs`, `phase: p7`, `priority: low`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P7.6: Enable GitHub Discussions & Issue Templates ⬜

**Files:**
- `.github/ISSUE_TEMPLATE/` (already created in P0)
- Enable Discussions via GitHub settings

**Commands:**
```bash
# Enable Discussions:
# GitHub repo → Settings → Features → Discussions (check)

# Create welcome post in Discussions:
# Title: Welcome to Dockitect Discussions!
# Body: Use Q&A for questions, Show & Tell for your setups, Feature Requests for ideas.
````

**Tests:**

- Create test issue with template
- Create test discussion post

**Docs:**

- Link Discussions from README

**Commit:**

```
chore: enable GitHub Discussions and update issue templates
```

**PR:**

- Title: `chore: enable GitHub Discussions and update issue templates`
- Description:
    - Enable Discussions for Q&A, feature requests, show & tell
    - Update README with Discussions link
    - Create welcome post
- Labels: `type: chore`, `phase: p7`, `priority: medium`
- Reviewers: @maintainer
- CI Checks: `build`

---

### P7.7: Post-Launch Monitoring & Triage Plan ⬜

**Files:**

- `/docs/product/support-plan.md`

**Commands:**

```bash
cat > docs/product/support-plan.md <<'EOF'
# Post-Launch Support Plan

## Response SLAs (Best Effort)
- **Critical bugs** (app broken): 24 hours
- **High-priority bugs** (major feature broken): 48 hours
- **Feature requests**: 1 week (triage)
- **Questions**: 48 hours (or community answers)

## Triage Process
1. **Daily:** Check GitHub notifications, Discussions, issues
2. **Label issues:** `type: bug`, `type: feature`, `priority: high/medium/low`, `status: triage`
3. **Close duplicates:** Link to original issue
4. **Thank contributors:** Acknowledge PRs and detailed bug reports

## Weekly Review (30 min)
- Review open issues by priority
- Plan next sprint (v1.1 features)
- Update roadmap.md with progress

## Emergency Hotfix Process
1. Create `hotfix/v1.0.1-<issue>` branch
2. Fix, test, commit
3. Tag `v1.0.1`, trigger release
4. Update CHANGELOG
5. Notify affected users via GitHub issue/discussion
EOF
```

**Tests:**

- N/A (process documentation)

**Docs:**

- Reference in CONTRIBUTING.md

**Commit:**

```
docs: add post-launch support and triage plan
```

**PR:**

- Title: `docs: add post-launch support and triage plan`
- Description:
    - Define SLAs for issue responses
    - Document triage process and weekly review
    - Emergency hotfix procedure
- Labels: `type: docs`, `phase: p7`, `priority: low`
- Reviewers: @maintainer
- CI Checks: `build`

---

## Milestones & Issues Mapping

| Phase | GitHub Milestone | Issues (approx) | Estimated Completion |
| ----- | ---------------- | --------------- | -------------------- |
| P0    | Repository Setup | 9 tasks         | Week 1               |
| P1    | MVP Importer     | 7 tasks         | Week 2-3             |
| P2    | MVP Exporter     | 6 tasks         | Week 3-4             |
| P3    | Conflict Lint    | 6 tasks         | Week 5               |
| P4    | Templates & DX   | 6 tasks         | Week 6               |
| P5    | Persistence      | 6 tasks         | Week 7               |
| P6    | Documentation    | 7 tasks         | Week 8-9             |
| P7    | GA Release       | 7 tasks         | Week 10              |

---

## GitHub CLI Commands (Ready to Run)

### Create Milestones

```bash
gh api repos/:owner/:repo/milestones -f title="P0: Repository Setup" -f description="Bootstrap monorepo, CI, tooling, docs" -f due_on="2025-10-09T23:59:59Z"
gh api repos/:owner/:repo/milestones -f title="P1: MVP Importer" -f description="Compose → Blueprint parser and canvas rendering" -f due_on="2025-10-23T23:59:59Z"
gh api repos/:owner/:repo/milestones -f title="P2: MVP Exporter" -f description="Blueprint → Compose generator with determinism" -f due_on="2025-10-30T23:59:59Z"
gh api repos/:owner/:repo/milestones -f title="P3: Conflict Lint" -f description="Validation engine and auto-fix UI" -f due_on="2025-11-06T23:59:59Z"
gh api repos/:owner/:repo/milestones -f title="P4: Templates & DX" -f description="Appliance templates and UX improvements" -f due_on="2025-11-13T23:59:59Z"
gh api repos/:owner/:repo/milestones -f title="P5: Persistence" -f description="SQLite DB, CRUD APIs, save/load UI" -f due_on="2025-11-20T23:59:59Z"
gh api repos/:owner/:repo/milestones -f title="P6: Documentation" -f description="Docusaurus site, guides, video demo" -f due_on="2025-12-04T23:59:59Z"
gh api repos/:owner/:repo/milestones -f title="P7: GA Release" -f description="Docker build, release automation, launch" -f due_on="2025-12-11T23:59:59Z"
```

### Create Issues (Sample)

```bash
# P0 Issues
gh issue create --title "P0.1: Initialize Next.js Monorepo" --body "Bootstrap monorepo with pnpm workspace. See checklist.md for details." --label "type: feature,phase: p0,priority: critical" --milestone "P0: Repository Setup"

gh issue create --title "P0.2: Configure TypeScript & ESLint" --body "Set up strict TS, ESLint, Prettier. See checklist.md." --label "type: chore,phase: p0,priority: high" --milestone "P0: Repository Setup"

# P1 Issues
gh issue create --title "P1.1: Define Blueprint v0 Schema (Zod)" --body "Implement Blueprint schema with Zod. See checklist.md." --label "type: feature,phase: p1,priority: critical" --milestone "P1: MVP Importer"

# ... (repeat for all 54 tasks, or generate programmatically)
```

### Create Labels

```bash
gh label create "type: feature" --color "0052CC" --description "New feature"
gh label create "type: fix" --color "D73A4A" --description "Bug fix"
gh label create "type: docs" --color "0075CA" --description "Documentation"
gh label create "type: test" --color "FBCA04" --description "Testing"
gh label create "type: chore" --color "FEF2C0" --description "Maintenance"
gh label create "type: ci" --color "BFD4F2" --description "CI/CD"
gh label create "phase: p0" --color "C5DEF5"
gh label create "phase: p1" --color "C5DEF5"
gh label create "phase: p2" --color "C5DEF5"
gh label create "phase: p3" --color "C5DEF5"
gh label create "phase: p4" --color "C5DEF5"
gh label create "phase: p5" --color "C5DEF5"
gh label create "phase: p6" --color "C5DEF5"
gh label create "phase: p7" --color "C5DEF5"
gh label create "priority: critical" --color "B60205"
gh label create "priority: high" --color "D93F0B"
gh label create "priority: medium" --color "FBCA04"
gh label create "priority: low" --color "0E8A16"
gh label create "area: ui" --color "D4C5F9"
gh label create "area: api" --color "D4C5F9"
gh label create "area: security" --color "D4C5F9"
```

---

## Repo Bootstrap Commands

### Initial Setup (Run in Order)

```bash
# 1. Create GitHub repository (if not exists)
gh repo create dockitect --public --description "Design your homelab. Export the stack." --homepage "https://dockitect.dev"

# 2. Clone and enter
git clone https://github.com/<your-username>/dockitect.git
cd dockitect

# 3. Initialize Next.js and pnpm workspace
pnpm create next-app@latest apps/web --typescript --tailwind --app --no-src-dir --import-alias "@/*"
mkdir -p packages/{schema,importer,exporter} templates/appliances docs/{product,tech,adr,how-to,reference}
echo -e "packages:\n  - 'apps/*'\n  - 'packages/*'" > pnpm-workspace.yaml
echo "auto-install-peers=true\nstrict-peer-dependencies=false" > .npmrc
pnpm install

# 4. Copy/create initial files (LICENSE, README, etc.)
# See P0 tasks for file contents

# 5. Install tooling
pnpm add -D -w eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-unicorn prettier eslint-config-prettier vitest @vitest/ui @vitest/coverage-v8 playwright @playwright/test

# 6. Initialize Git
git init
git add .
git commit -m "feat(init): bootstrap Dockitect monorepo"
git branch -M main
git remote add origin https://github.com/<your-username>/dockitect.git
git push -u origin main

# 7. Create labels and milestones
# Run gh label create commands from above
# Run gh api milestones commands from above

# 8. Enable branch protection
gh api repos/:owner/:repo/branches/main/protection -X PUT -f required_status_checks[strict]=true -f required_status_checks[contexts][]=build-test -f required_pull_request_reviews[required_approving_review_count]=1 -f enforce_admins=true -f required_linear_history=true

# 9. Start development
pnpm dev
```

---

## Next Steps After Checklist

1. **Start with P0:** Complete all P0 tasks to establish solid foundation
2. **Create GitHub Project Board:** Track progress visually
3. **Set up CI/CD early:** Catch issues fast
4. **Iterate in small PRs:** Each task = 1 PR (or combine 2-3 tiny tasks)
5. **Demo after each phase:** Record GIFs, share progress
6. **Engage community early:** Open Discussions, invite feedback on MVP

---

_Last updated: 2025-10-02 | 54 total tasks across 7 phases_
