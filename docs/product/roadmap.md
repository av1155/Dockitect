# Dockitect Product Roadmap

> **This document is authoritative for Dockitect's execution plan. Update it as phases complete.**

---

## Overview

This roadmap takes Dockitect from zero to GA (General Availability) through seven phased milestones. Each phase delivers a demoable, independently mergeable artifact with visual evidence (GIF/screenshot). The strategy follows trunk-based development with small, vertical-slice PRs, Conventional Commits, and semantic versioning.

**Planning Principles:**

- Week-sized phases, day-sized tasks
- Three core slices first: Importer v0 → Exporter v0 → Conflict Lint v0
- Every phase ends with a working demo
- Deterministic YAML export non-negotiable
- No docker.sock access; file-based only

---

## P0: Repository & Project Setup

**Goal:** Bootstrap a production-ready monorepo with CI/CD, linting, testing infrastructure, and foundational architecture docs.

**Scope:**

- Next.js App Router project with TypeScript, Tailwind, shadcn/ui
- Monorepo structure: `/apps/web`, `/packages/{schema,importer,exporter}`, `/templates/appliances`, `/docs`
- Development tooling: ESLint, Prettier, Vitest, Playwright, strict TS config
- GitHub Actions CI: typecheck, lint, unit tests, e2e tests, build verification
- Repository hygiene: LICENSE (MIT), CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, .editorconfig, CODEOWNERS
- Initial architecture docs: `/docs/tech/architecture.md`, `/docs/product/mvp.md`
- ADR 0001: Blueprint schema design rationale

**Deliverables:**

- Running `pnpm dev` serves Next.js app on localhost:3000
- `pnpm test` and `pnpm e2e` pass with placeholder tests
- CI workflow passes on main branch
- README with project vision, quickstart, and placeholder architecture diagram
- Empty canvas page renders with React Flow initialized

**Acceptance Criteria:**

- [x] All CI checks green (typecheck, lint, test, build) on main
- [x] `pnpm install && pnpm dev` works on fresh clone
- [x] Playwright can load homepage and take screenshot
- [x] Monorepo structure matches spec (apps/, packages/, docs/, templates/)
- [x] ADR 0001 documents Blueprint v0 schema with alternatives considered
- [x] SECURITY.md defines vulnerability reporting process (90-day disclosure)
- [x] React Flow canvas initialized with Zustand state management

**Risks & Rollback:**

- Risk: Over-engineering initial setup → Mitigation: Use framework defaults, defer optimizations
- Rollback: N/A (foundation phase)

**Dependencies:**

- Tech: Node 20 LTS, pnpm 9.x, GitHub Actions runners, @xyflow/react, zustand
- Sequencing: None (first phase)

**Estimated Effort:** **M** (3-5 days)

**Status:** ✅ **COMPLETE** (Merged to main on 2025-10-03)

**Deliverables Summary:**
- ✅ Monorepo setup with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- ✅ Full CI/CD pipeline (typecheck, lint, test, e2e, build, CodeQL)
- ✅ Repository hygiene (LICENSE, CONTRIBUTING, SECURITY, CODEOWNERS)
- ✅ Architecture docs (ADR 0001, architecture.md, mvp.md)
- ✅ React Flow canvas with Zustand state management
- ✅ All vision alignment verified (Blueprint v0, templates, core principles)

---

## P1: MVP Importer (Compose v2.x → Blueprint)

**Goal:** Parse single docker-compose.yml files into Blueprint v0 JSON and render basic nodes on canvas.

**Scope:**

- `/packages/importer`: YAML parser (Compose v2.x → Blueprint)
- Blueprint v0 schema in `/packages/schema` with Zod validation
- File upload UI component in `/apps/web`
- Canvas rendering: Host (placeholder), Network, Service nodes with basic edges
- Unit tests for importer (5+ fixtures: simple, multi-service, networks, volumes, ports)
- E2E test: upload compose → verify nodes rendered

**Deliverables:**

- Upload button accepts `.yml`/`.yaml` files
- Importer parses services, networks, volumes into Blueprint v0
- Canvas displays Service nodes with labels (name, image)
- Network nodes shown with edges to connected services
- Animated GIF: "Upload Compose → See Topology"
- Test fixtures in `/packages/importer/__fixtures__`

**Acceptance Criteria:**

- [x] **P1.1:** Blueprint v0 schema implemented and validates all entity types
- [x] **P1.2:** Importer handles 6 test fixtures without errors
- [x] **P1.3:** File upload UI component integrated
- [x] **P1.4:** Canvas renders ≥3 service nodes from multi-service compose
- [ ] **P1.5:** Network edges connect services correctly
- [ ] **P1.6:** E2E test uploads jellyfin.yml and asserts 1 service node visible
- [x] Code coverage ≥80% for importer package (23 tests passing)

**Risks & Rollback:**

- Risk: Compose v2.x edge cases (anchors, extends) → Mitigation: Document unsupported features; validate incrementally
- Risk: React Flow performance with large graphs → Mitigation: Start with <20 nodes; optimize in P4
- Rollback: Revert PR; keep upload UI but show "import coming soon" message

**Dependencies:**

- Tech: `yaml` npm package, `@xyflow/react`, Zod
- Sequencing: Requires P0 (repo structure)

**Estimated Effort:** **L** (5-7 days)

**Status:** 🟦 **IN PROGRESS** (P1.1-P1.4 complete; P1.5 and P1.6 next)

**Deliverables Summary (P1.4):**
- ✅ ServiceNode and NetworkNode components implemented
- ✅ blueprintToNodes converter renders services and networks with auto-layout
- ✅ Auto-layout: services grid; networks horizontal row
- ✅ Design tokens applied: border-blue-600 for services; success token for networks
- ✅ 4 new E2E tests added (apps/web/e2e/canvas-render.spec.ts)
- ✅ All tests passing: 58 unit + 11 E2E

---

## P2: MVP Exporter (Blueprint → Compose v2.x)

**Goal:** Export canvas blueprint to deterministic, stable docker-compose.yml files.

**Scope:**

- `/packages/exporter`: Blueprint → Compose YAML generator
- Deterministic key ordering (services, networks, volumes alphabetically)
- Stable env/port/volume ordering within each service (use fast-json-stable-stringify for objects)
- Download button in UI triggers export
- Round-trip test: import → modify → export → re-import → compare
- E2E test: draw 2 services → export → verify valid compose

**Deliverables:**

- "Export Compose" button downloads `docker-compose.yml`
- Exported YAML is valid Compose v2.x (docker compose config validates)
- Keys sorted alphabetically; arrays maintain insertion order
- Round-trip tests pass (import→export→import produces identical Blueprint)
- Animated GIF: "Draw Topology → Export Compose"
- CLI test script: `docker compose -f exported.yml config --quiet` succeeds

**Acceptance Criteria:**

- [ ] Exporter produces valid Compose v2.x (validated by `docker compose config`)
- [ ] Exported YAML has stable key order (multiple exports produce identical diffs)
- [ ] Round-trip test: fixture.yml → Blueprint → export.yml (semantically equivalent)
- [ ] E2E test creates 2 services on canvas, exports, downloads file
- [ ] Code coverage ≥80% for exporter package
- [ ] No external dependencies on Docker daemon (file-based only)

**Risks & Rollback:**

- Risk: Docker Compose spec deviations → Mitigation: Test against official docker/compose-spec examples
- Risk: Non-deterministic output → Mitigation: Snapshot tests for YAML output; use stable stringify
- Rollback: Disable export button; keep import-only functionality

**Dependencies:**

- Tech: `yaml` package with custom ordering, `fast-json-stable-stringify`
- Sequencing: Requires P1 (Blueprint schema & importer)

**Estimated Effort:** **L** (5-7 days)

---

## P3: Conflict Lint & Validation

**Goal:** Detect and highlight port collisions, volume conflicts, missing env vars, and duplicate service names.

**Scope:**

- Validation engine in `/packages/schema` (Zod refinements + custom linters)
- Lint rules v0:
    - Duplicate host ports on same host/network → error
    - Duplicate service names → error
    - Volume target conflicts (RW vs RO) → warning
    - Missing env variables referenced in commands → warning
- UI: Conflict panel showing errors/warnings with node highlighting
- Auto-fix suggestions (e.g., increment port, rename service)
- Unit tests for each lint rule with positive/negative cases

**Deliverables:**

- Conflict panel component in `/apps/web/components/ConflictPanel.tsx`
- Visual indicators on canvas (red badge for errors, yellow for warnings)
- "Auto-fix" button for simple conflicts (port increment, service rename)
- E2E test: import conflicting compose → verify error panel shown → apply fix → verify error cleared
- Animated GIF: "Detect Port Conflict → Auto-Fix"

**Acceptance Criteria:**

- [ ] 4 lint rules implemented with test coverage ≥90%
- [ ] Conflict panel lists all errors/warnings with source node references
- [ ] Canvas nodes show visual badges for conflicts (error/warning states)
- [ ] Auto-fix resolves ≥2 conflict types (port, name)
- [ ] E2E test: upload conflicting-ports.yml → see 2 errors → click fix → export valid compose
- [ ] Validation runs on every canvas change (debounced 500ms)

**Risks & Rollback:**

- Risk: False positives in lint rules → Mitigation: Make rules configurable; start with conservative checks
- Risk: Performance degradation on large graphs → Mitigation: Debounce validation; run in web worker if needed
- Rollback: Disable conflict panel; keep validation logic for API use

**Dependencies:**

- Tech: Zod refinements, graph traversal utilities
- Sequencing: Requires P1 (Blueprint), P2 (Export for validation)

**Estimated Effort:** **M** (4-6 days)

---

## P4: Templates & DX Improvements

**Goal:** Ship curated appliance templates (Jellyfin, Uptime Kuma, Immich, Nextcloud, Paperless-ngx) and enhance developer experience with hot reload, better error handling.

**Scope:**

- 5 appliance templates as Blueprint JSON in `/templates/appliances/`
- Template gallery UI: drag-and-drop service templates onto canvas
- Template metadata: name, description, icon, default ports, required env vars
- DX improvements:
    - Better error messages for import failures (show line numbers, validation errors)
    - Canvas minimap and zoom controls (React Flow built-ins)
    - Undo/redo for canvas operations (using Zustand or React Flow state)
- E2E test: drag Jellyfin template → configure ports → export

**Deliverables:**

- Template gallery sidebar with 5+ templates
- Drag-and-drop templates onto canvas (pre-configured services)
- Templates include: Jellyfin, Uptime-Kuma, Immich, Nextcloud, Paperless-ngx
- Canvas minimap and controls visible
- Undo/redo buttons (Ctrl+Z/Ctrl+Y) functional
- Animated GIF: "Drag Template → Customize → Export"

**Acceptance Criteria:**

- [ ] 5 appliance templates validated against Blueprint schema
- [ ] Template gallery renders with icons and descriptions
- [ ] Drag template onto canvas creates configured service node
- [ ] Undo/redo works for add/delete/move operations (≥3 action history)
- [ ] Import error messages show specific validation failures with line refs
- [ ] E2E test: drag 2 templates, connect to network, export valid compose

**Risks & Rollback:**

- Risk: Template configs become stale → Mitigation: Add CI test to validate templates against latest schemas
- Risk: Undo/redo state conflicts → Mitigation: Use immutable state library; test edge cases
- Rollback: Hide template gallery; keep manual node creation

**Dependencies:**

- Tech: React Flow controls, Zustand/Jotai for undo state
- Sequencing: Requires P2 (export), P3 (validation)

**Estimated Effort:** **M** (4-5 days)

---

## P5: Persistence & Settings

**Goal:** Save blueprints to SQLite database, enable project management (create/open/delete), and add user preferences.

**Scope:**

- Prisma schema: `Blueprint`, `Project` models
- SQLite database in `/data` volume (Docker) or local fs (dev)
- CRUD APIs: create project, save blueprint, load blueprint, list projects, delete project
- UI: Project switcher, save/load buttons, auto-save (debounced 2s)
- Settings panel: theme (light/dark), export format preferences, telemetry opt-in (default off)
- Migration script for Blueprint v0 → v1 (future-proofing)
- Unit tests for Prisma repositories; E2E test for save/load flow

**Deliverables:**

- Projects list page showing all saved blueprints
- Auto-save indicator (saving... / saved)
- Settings modal with theme toggle and export preferences
- Database migrations in `/apps/web/prisma/migrations/`
- E2E test: create project → add services → save → reload page → verify blueprint loaded
- Privacy: no telemetry by default; opt-in flag documented

**Acceptance Criteria:**

- [ ] Prisma schema includes `Project` (id, name, createdAt, updatedAt) and `Blueprint` (projectId, version, data JSON)
- [ ] Save blueprint API persists to SQLite; load API retrieves latest version
- [ ] Projects list shows ≥1 project after creation
- [ ] Auto-save triggers 2s after last canvas change (debounced)
- [ ] Settings persist in localStorage (theme, export prefs)
- [ ] E2E test: save → close browser → reopen → blueprint restored
- [ ] Migration script documented in `/docs/adr/0002-persistence.md`

**Risks & Rollback:**

- Risk: SQLite corruption or locking → Mitigation: Use WAL mode; test concurrent writes
- Risk: Data loss on crash → Mitigation: Auto-save frequently; add "recover last session" feature
- Rollback: Disable persistence; use localStorage for single-session state

**Dependencies:**

- Tech: Prisma, SQLite, Next.js API routes or server actions
- Sequencing: Requires P1 (Blueprint schema), P4 (templates for testing)

**Estimated Effort:** **M** (4-5 days)

---

## P6: Documentation & Release Preparation

**Goal:** Complete user-facing docs, API reference, contribution guide, and prepare for first public release.

**Scope:**

- Docusaurus site in `/docs` with sections: Product (getting started, features), Tech (architecture, API), How-To (import/export, templates), ADRs
- API reference: Blueprint schema (JSON Schema output), REST endpoints (if any)
- Video walkthrough (2-3 min): install → import → edit → export
- README polish: add screenshots, architecture diagram (C4), badges (CI, license, version)
- CONTRIBUTING.md: setup guide, PR checklist, code style, commit conventions
- CHANGELOG generation via semantic-release
- Security audit: CodeQL results review, dependency check, license compliance

**Deliverables:**

- Docusaurus site deployed to GitHub Pages or Vercel
- README includes: badges, 3+ screenshots, architecture diagram, quickstart (Docker + pnpm)
- Video demo uploaded to README (GIF or YouTube link)
- CONTRIBUTING.md with: local setup, test commands, PR process, style guide
- CHANGELOG.md auto-generated with first release notes
- Security policy documented (SECURITY.md) with contact and disclosure timeline

**Acceptance Criteria:**

- [ ] Docusaurus builds without errors; deployed at `/docs` path
- [ ] README includes ≥3 screenshots showing import/export/conflict features
- [ ] Video demo <3min demonstrates full workflow (upload → edit → export)
- [ ] CONTRIBUTING.md tested by fresh contributor (simulated setup on clean VM)
- [ ] ADRs cover: Blueprint schema (0001), persistence (0002), export determinism (0003)
- [ ] CodeQL scan passes; no high/critical vulnerabilities
- [ ] License headers added to all source files (MIT)

**Risks & Rollback:**

- Risk: Docs drift from code → Mitigation: Add CI check to validate code examples in docs
- Risk: Incomplete contributor guide → Mitigation: Test setup on fresh environment
- Rollback: Deploy minimal README-only docs; defer full Docusaurus site

**Dependencies:**

- Tech: Docusaurus, Mermaid for diagrams, asciinema for terminal recordings
- Sequencing: Requires P5 (all features complete for documentation)

**Estimated Effort:** **L** (5-7 days)

---

## P7: GA Release & Distribution

**Goal:** Publish v1.0.0 to GitHub Releases, GHCR, and announce on r/selfhosted, Hacker News, and homelab communities.

**Scope:**

- Multi-arch Docker images (linux/amd64, linux/arm64) published to GHCR
- Release notes with screenshots, changelog, upgrade guide
- Semantic versioning: v1.0.0 tag triggers release workflow
- Distribution channels: GitHub Releases, GHCR, Docker Hub (optional)
- Announcement posts: Reddit (r/selfhosted, r/homelab), Hacker News, Lobsters, social media
- Monitoring: issue templates (bug, feature request, config), Discussions enabled
- Post-launch: triage issues, respond to feedback, plan v1.1 roadmap

**Deliverables:**

- Docker images published: `ghcr.io/<org>/dockitect:latest` and `:v1.0.0`
- GitHub Release v1.0.0 with: changelog, binaries (if any), Docker run command, upgrade notes
- Announcement posts drafted with screenshots and demo GIF
- Issue templates: bug_report.yml, feature_request.yml, config.yml (link to Discussions)
- Discussions categories: Q&A, Show & Tell, Feature Requests, General
- Post-launch checklist: monitor GitHub notifications, respond within 24h, weekly triage

**Acceptance Criteria:**

- [ ] Docker images build for amd64 and arm64; pushed to GHCR on v1.0.0 tag
- [ ] `docker run ghcr.io/<org>/dockitect:v1.0.0` works on Linux/macOS/Windows (Docker Desktop)
- [ ] Release notes include: features list, breaking changes (none for v1.0), upgrade steps
- [ ] README updated with: install badge, version badge, link to docs
- [ ] Announcement posts live on ≥3 platforms (Reddit, HN, Lobsters)
- [ ] Issue templates functional; test by creating sample bug report
- [ ] Discussions enabled; welcome post published with roadmap link

**Risks & Rollback:**

- Risk: Critical bug discovered post-launch → Mitigation: Hotfix process (v1.0.1), rollback Docker tag to previous
- Risk: Negative community feedback → Mitigation: Fast response, issue triage, transparency on fixes
- Rollback: Pull Docker images; revert to pre-release state; issue retraction notice

**Dependencies:**

- Tech: Docker buildx, GHCR, semantic-release, GitHub CLI (gh)
- Sequencing: Requires P6 (docs complete), P0-P5 (all features stable)

**Estimated Effort:** **S** (2-3 days for release; ongoing for support)

---

## Success Metrics (Post-GA)

- **Adoption:** ≥100 GitHub stars in first month
- **Engagement:** ≥10 community PRs or issues
- **Quality:** <5% bug rate (bugs / total issues)
- **Performance:** Round-trip import/export <2s for 20-service compose
- **Reliability:** 99% CI pass rate on main branch

---

## Versioning & Maintenance Plan

- **v1.x (Stable):** Bug fixes, security patches, minor features (backward compatible)
- **v2.x (Future):** Multi-host orchestration, Kubernetes export, advanced IPAM
- **Release cadence:** Minor releases every 4-6 weeks; patches as needed
- **Deprecation policy:** 2 major versions support (v1.x supported through v3.0 release)

---

_Last updated: 2025-10-04 | Next review: End of P3 (Conflict Lint)_
