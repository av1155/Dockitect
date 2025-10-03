# Dockitect — Project Charter & Operating Guide

> This document defines Dockitect’s scope, operating guardrails, tech stack, MVP slices, data model, CI/CD shape, and ready-to-run snippets. It assumes standard engineering conventions for commits, branching, PRs/reviews, releases, and repository hygiene. Trunk-based flow with short-lived branches and small PRs is expected.

---

## 1) Name (catchy, relevant, beautiful)

- **Dockitect** — clever (Docker + architect). Great for self-host crowd; slightly Docker-specific.

---

## 2) Product Overview (value & promise)

Design homelab topologies on a canvas and export deterministic `docker-compose.yml`. Import existing Compose to visualize and fix conflicts. Self-hosted, fast, and beautiful. Compose v2.x is in scope for import/export.

---

## 3) Development approach (solo w/ agentic AI)

You’ll vibe code, but you still need rails. Use **trunk-based development** with **tiny PRs**, a living **MVP spec**, and a short **decision log** so agents understand context. (ADRs capture one decision per note with context and consequences.)

**Process in 7 rules**

1. **Small, testable “vertical slices.”** Each PR should add a user-visible slice (e.g., “import Compose → render nodes”).
2. **One-pager RFCs (max 400 words)** for non-trivial choices (schema, import/export, lint rules). Commit them to `/docs/adr/`.
3. **Trunk + short-lived branches** (`feat/*`, `fix/*`, `chore/*`). No long-running release branches.
4. **Conventional Commits** + **semantic-release** to cut versions automatically.
5. **Fail-fast CI** (typecheck, lint, unit tests) + **preview builds** for every PR.
6. **Agent workflow:** give your agent a canonical `/docs/product/mvp.md` and `/docs/tech/architecture.md`. Always update those before asking the agent for code.
7. **Weekly 90-min “shape & ship.”** Shape next slice, ship this week’s slice, log decisions.

This is a hybrid of agile + Shape Up, tuned for a solo dev and AI pair-programmer.

---

## 4) Tech stack (opinionated, modern, beautiful)

**Frontend / app shell**

- **Next.js (App Router)**
- **TypeScript** everywhere
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **React Flow** for the diagram canvas
- **Zustand** for canvas state management
- **Zod** for runtime schema + forms
- **Framer Motion** for tasteful micro-interactions (sparingly)

**Server & API**

- **Next.js server actions / routes** for simple CRUD
- **tRPC** (optional) if you prefer RPC ergonomics end-to-end types
- **Prisma** + **SQLite** (file-based, perfect for self-host)
- **yaml** npm package for Compose parse/emit
- **fast-json-stable-stringify** (ensures deterministic exports)
- **ajv** or **zod-to-json-schema** if you expose JSON schema outwards

**Packaging**

- **Docker multi-stage** (Node 20+ LTS), distroless runtime or alpine
- **Multi-arch** (linux/amd64, linux/arm64) via GH Actions + buildx

**Testing & quality**

- **Vitest** (unit), **Playwright** (e2e)
- **ESLint + @typescript-eslint + eslint-plugin-unicorn**
- **Prettier**
- **Knip** (dead code) + **depcheck** (optional)
- **CodeQL** + **Renovate** + **Dependabot** (security & deps)

**Why this stack:** You get a stunning UI quickly, a proven diagramming lib, fast build/dev cycles, deterministic export, and a storage layer that “just works” in a single container.

---

## 5) Guardrails (important)

**Privacy & offline:** default **no telemetry**. Offer an opt-in anonymous metrics flag later with a public schema.

**Security:** app does **not** need Docker socket. It’s a **designer** that reads/writes files. Keep it unprivileged. A future “introspect running host” add-on can use a sidecar with least privilege.

**Determinism:** exporting YAML must be **stable** (key orders, env order, volume order). It’s crucial for clean diffs → star-win.

**Schema versioning:** define a versioned **Blueprint JSON** (e.g., `v0`, `v1`). Add migration code early.

**Templating:** ship curated **appliance templates** (Jellyfin, Immich, Nextcloud, Paperless-ngx, Uptime-Kuma) as JSON snippets → composes fast.

**Importers (MVP scope):**

- Compose v2.x (single/multi-file)
- Port collisions detector
- Volume/name collisions detector
- Missing env detector with fix-ups

**First-week KPIs:**

- 1 animated GIF in README, 1-click run, 3 templates, import→canvas→export loop working.
- PR previews on every change.

**License:** **MIT** for maximum adoption and contributions.

> Switch to AGPL only if you strongly want to block cloud-SaaS clones; it will reduce adoption.

---

## 6) Bootstrap prompt for your agentic AI

Copy-paste this as your first task to your assistant (edit the chosen name if you like **Dockitect**).

```
You are my senior engineer on “Dockitect”, an open-source, self-hosted web app that lets users DESIGN homelab topologies on a canvas and EXPORT deterministic docker-compose.yml (and import existing compose to visualize).

OBJECTIVE (MVP SPRINT 1):
- Implement a minimal vertical slice:
  - Create a Next.js (App Router, TypeScript) project with Tailwind + shadcn/ui + React Flow.
  - Define a versioned Blueprint JSON schema (v0) in /packages/schema with zod and JSON schema output.
  - Build a simple canvas with 3 node types: Host, Network, Service.
  - Implement “Import Compose” (upload docker-compose.yml) → basic parser → create nodes/edges.
  - Implement “Export Compose” (deterministic, stable key order) from the current canvas.
  - Add 2 appliance templates: Jellyfin and Uptime Kuma (JSON).
  - Persist blueprints to SQLite via Prisma in /apps/web (simple models).
  - Ship Dockerfiles and docker-compose.yml for dev and prod.

NON-FUNCTIONAL REQUIREMENTS:
- Deterministic YAML export (use a stable stringify).
- No use of Docker socket; file import/export only.
- Excellent DX: ESLint, Prettier, Vitest, Playwright, strict TS.
- Repo hygiene: MIT LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, .editorconfig.
- CI: GitHub Actions for typecheck/lint/test/build; multi-arch Docker build & push to GHCR on tags.
- Release: semantic-release with Conventional Commits.

REPO LAYOUT:
- /apps/web  (Next.js app)
- /packages/schema (zod schema + json schema emission)
- /packages/exporter (compose emitter from blueprint)
- /packages/importer (compose → blueprint)
- /templates/appliances/*.json (service templates)
- /docs (Docusaurus seed with MVP pages)
- /.github/workflows (ci.yml, release.yml, codeql.yml, renovate.json)

READY-TO-EDIT FILES (create scaffolds):
- docs/product/mvp.md (crisp scope)
- docs/tech/architecture.md (C4-level diagram + data model)
- docs/adr/0001-blueprint-schema.md (tradeoffs)
- README.md (use placeholder screenshots)
- SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md

DELIVERABLES:
- A PR that runs locally: `docker compose up -d` (prod) and `pnpm dev` (dev).
- A sample blueprint JSON and a sample compose file for import tests.
- Tests for importer/exporter round-trip basics.

Follow best practices, explain decisions inline as comments, and prefer simplicity over perfection.
```

---

## 7) GitOps / CI/CD / docs standards (project-specific details)

**Branching & commits**

- **Trunk-based.** Branch names: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`. Small PRs.
- **Conventional Commits** drive **semantic-release** for automated versioning/changelog/tags.
- Enforce with commitlint and a PR template that asks for screenshots or GIFs when UI changes.

**Versioning & releases**

- **semantic-release**: auto bump, changelog, GitHub release notes, tag.
- Tag format: `vMAJOR.MINOR.PATCH`.
- Release channels: `next` (pre-releases from `main`), `latest` on tagged releases.

**CI workflows (GitHub Actions)**

- `ci.yml`: install (pnpm), typecheck, lint, unit tests, e2e (headless), build.
- `docker.yml`: buildx multi-arch, push to GHCR on tag.
- `codeql.yml`: CodeQL weekly + on PR.
- `renovate.json`: automated dependency PRs.

**Security & quality**

- Enable dependency security updates.
- **CODEOWNERS**: you for now; easy to expand.
- **Security policy**: how to report vulns (email), 90-day disclosure window.
- **License scanning** via `license-checker` (optional).

**Documentation**

- **Docusaurus** in `/docs` (or MkDocs Material).
- Structure: `product/`, `tech/`, `adr/`, `how-to/`, `reference/`.
- Keep diagrams in `/docs/media/` and link in README.
- Add **/docs/adr/** (Architecture Decision Records).

**Copilot / code reviews**

- Enable Copilot Chat; require at least one approval for PRs.
- Mark **Required Status Checks**: `lint`, `typecheck`, `test`, `build`.
- Add **Danger** (optional) to comment on missing screenshots/tests in UI PRs.

**Example `ci.yml` (short):**

```yaml
name: ci
on:
    pull_request:
    push:
        branches: [main]
jobs:
    build-test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: pnpm/action-setup@v4
              with: { version: 9 }
            - uses: actions/setup-node@v4
              with: { node-version: "20", cache: "pnpm" }
            - run: pnpm install --frozen-lockfile
            - run: pnpm run typecheck
            - run: pnpm run lint
            - run: pnpm run test -- --coverage
            - run: pnpm run build
```

**Example `docker.yml` (multi-arch):**

```yaml
name: docker
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
                  push: true
                  platforms: linux/amd64,linux/arm64
                  tags: ghcr.io/${{ github.repository }}:latest,ghcr.io/${{ github.repository }}:${{ github.ref_name }}
                  file: ./Dockerfile
```

---

## 8) Initial README

````markdown
# Dockitect — Design your homelab. Export the stack.

Draw your topology on a canvas, then export **deterministic `docker-compose.yml`** you can run anywhere. Import existing Compose to visualize and fix conflicts. Self-hosted, beautiful, and fast.

## ✨ Why

Homelabs grow messy: scattered `docker-compose.yml`, port collisions, no single source of truth. **Dockitect** bridges **design ↔ code**:

- Visual nodes for hosts, networks, and services
- Import **Compose** → see your lab as a graph
- Export **deterministic Compose** (clean diffs)
- Catch conflicts before you `up -d`

## 🎯 Key Features (MVP)

- Canvas editor (React Flow) with Host / Network / Service nodes
- Appliance templates (Jellyfin, Uptime Kuma) you can drop in
- Compose **import** (v2.x) → blueprint graph
- Compose **export** with stable ordering
- Port/volume/name **linting**

## 🧰 Tech

Next.js (App Router) • TypeScript • Tailwind • shadcn/ui • React Flow • Prisma + SQLite • Zod • Vitest • Playwright

## 🚀 Quickstart

```bash
# Docker (production-like)
docker run -p 3000:3000 \
  -v $(pwd)/dockitect:/data \
  ghcr.io/<you>/dockitect:latest
```
````

Or dev:

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000`.

## 📁 Project Layout

```
apps/web/              # Next.js app
packages/schema/       # Blueprint zod schema + JSON schema
packages/importer/     # Compose -> blueprint
packages/exporter/     # Blueprint -> Compose
templates/appliances/  # Jellyfin, Uptime-Kuma, etc.
docs/                  # Docusaurus
```

## 🧪 Tests

```bash
pnpm test          # unit
pnpm e2e           # Playwright (headless)
```

## 🔒 Security

No Docker socket required. File import/export only. Report issues via SECURITY.md.

## 📝 Roadmap

- [ ] Round-trip import/export parity
- [ ] Conflict panel (ports, volumes, env)
- [ ] Template gallery
- [ ] Shareable “Blueprint” files (v1 schema)

````

---

## 9) Product cut-plan (first three “vertical slices”)

1) **Importer v0**: Upload Compose → parse → create Host/Service/Network nodes.
2) **Exporter v0**: Canvas → Compose (stable) for single host, single network.
3) **Conflict Lint v0**: Port/volume/name checks with fix-ups and UI badges.

Each slice ends with an **animated GIF** added to README.

---

## 10) Minimal initial data model (practical)

**Blueprint (v0)**
```ts
type Blueprint = {
  version: 'v0';
  meta: { id: string; name: string; createdAt: string; updatedAt: string };
  hosts: Host[];         // e.g., "nas", "pi-4", "vm-01"
  networks: Net[];       // name, subnet (optional), type: bridge/macvlan/custom
  services: Service[];   // name, image, env, ports, volumes, networks, hostId
};

type Host = { id: string; name: string; notes?: string };
type Net  = { id: string; name: string; driver?: string; subnetCidr?: string };
type Port = { host: number; container: number; protocol?: 'tcp'|'udp' };

type Volume = { type: 'bind'|'volume'; source: string; target: string; readOnly?: boolean };

type Service = {
  id: string; name: string; image: string; command?: string[];
  env?: Record<string,string>;
  ports?: Port[];
  volumes?: Volume[];
  networks?: string[];   // Net.id
  dependsOn?: string[];  // Service.id
  restart?: 'no'|'always'|'unless-stopped'|'on-failure';
  labels?: Record<string,string>;
  hostId?: string;       // Host.id (optional in v0)
};
````

- Keep `v0` intentionally small; add `deploy`, `healthcheck`, `secrets` later with a version bump + migration.

**Lint rules (v0)**

- Duplicate host ports on same host/network → error
- Duplicate service names → error
- Volume target duplicates with read/write conflicts → warn
- Missing env referenced in command → warn

---

## 11) Docker files (starter snippets)

**`Dockerfile`**

```dockerfile
# build
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile
RUN pnpm -w build

# run
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

**`docker-compose.yml` (dev convenience)**

```yaml
services:
    dockitect:
        image: ghcr.io/you/dockitect:latest
        container_name: dockitect
        ports: ["3000:3000"]
        volumes:
            - ./data:/data
        restart: unless-stopped
```

---

## 12) Final reality check (so we don’t waste time)

- If you **cannot** deliver deterministic export + working import (even basic), **don’t ship** the MVP; the wow factor depends on that bridge.
- Don’t overbuild IPAM or DCIM features; that’s NetBox’s turf. Keep it **visual + exportable**, with **lint** that prevents real pain.
- Screenshots and a 10-second GIF are not optional; they are your star engine.
