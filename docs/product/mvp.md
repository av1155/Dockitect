# MVP Scope

## Core Features

### 1. Blueprint Editor

- **Visual canvas** for designing Docker stacks (React Flow) ✅
- **Intelligent layout algorithms** (P4.5): hierarchical, radial, force-directed, swimlanes
- **Semantic grouping** for sparse topologies: group by image family, shared volumes, dependencies
- Drag-and-drop service composition (P1.5 - pending)
- Three node types: **Host**, **Network** ✅, **Service** ✅
- Multi-host topology support (NAS, Pi, VMs)
- Basic service configuration:
    - Image selection ✅
    - Port mappings (host:container) ✅
    - Environment variables ✅
    - Volume mounts (bind mounts + named volumes) ✅
    - Network connections ✅
    - Startup dependencies ✅

### 2. Import/Export (Bidirectional)

- **Import** existing docker-compose.yml v2.x files
    - Parse services, networks, volumes
    - Render as canvas nodes with connections
    - Support single-file and multi-file compose projects
- **Export** blueprints to deterministic docker-compose.yml
    - Stable key ordering (services, networks, volumes alphabetical)
    - Stable array ordering within services (env, ports, volumes)
    - Clean diffs for Git (reproducible output)
- **Validate** schema on import/export (Zod validation)
- **Round-trip** tests: import → modify → export → re-import (semantic equivalence)

### 3. Conflict Detection & Linting

- **Port conflicts**: Duplicate host ports on same host/network → error
- **Service name collisions**: Duplicate service names → error
- **Volume conflicts**: Same volume target with read/write conflicts → warning
- **Missing environment variables**: Env vars referenced in commands but undefined → warning
- **Conflict panel** UI with visual node badges (red for errors, yellow for warnings)
- **Auto-fix** suggestions for simple conflicts (port increment, service rename)

### 4. Appliance Templates

- Pre-configured service templates for common self-hosted apps:
    - **Jellyfin** (media server)
    - **Uptime Kuma** (monitoring)
    - **Immich** (photo management)
    - **Nextcloud** (file sync & share)
    - **Paperless-ngx** (document management)
- Template metadata: name, description, icon, default ports, required env vars
- Drag-and-drop templates onto canvas (pre-configured services)
- Template gallery sidebar with search/filter

### 5. Persistence & Project Management

- **SQLite database** (via Prisma ORM) for blueprint storage
- **Projects**: Create, open, save, delete blueprints
- **Auto-save**: Debounced save (2s after last change)
- **Version control**: Blueprint v0 schema with migration path to v1+
- **Settings**: ✅ Theme (light/dark with toggle), export format preferences, telemetry opt-in (default: off)

## Out of Scope (Post-MVP)

- **Multi-host orchestration**: Advanced scheduling, resource constraints
- **Advanced networking**: Custom IPAM, IPv6, macvlan configuration
- **Secrets management**: Docker secrets, external secret stores
- **Production deployment automation**: CI/CD pipelines, blue/green deployments
- **Kubernetes/Podman export**: Focus on docker-compose v2.x only for MVP
- **Container introspection**: Reading live container state (no Docker socket access)
- **Embedded terminal**: Exec into containers, view logs in-app

## MVP Success Criteria

1. **Import → Canvas → Export** round-trip works for 5+ test fixtures
2. **Conflict detection** catches port/volume/name collisions with ≥90% accuracy
3. **Templates** for 5 appliances render correctly on canvas
4. **Persistence** auto-saves after 2s; reload restores blueprint
5. **Deterministic export**: Multiple exports produce identical diffs
6. **Tests**: ≥80% code coverage (unit + e2e)
7. **Documentation**: README with animated GIF, quickstart guide

## First-Week KPIs (from Dockitect.md vision)

- ✅ 1 animated GIF in README
- ✅ 1-click run (`pnpm dev` or `docker compose up`)
- ✅ 3+ templates available
- ✅ Import → canvas → export loop working end-to-end
- ✅ PR previews on every change (CI/CD pipeline)

## Privacy & Security Guardrails

- **No telemetry by default**: Opt-in anonymous metrics with public schema (post-MVP)
- **No Docker socket access**: File import/export only (unprivileged container)
- **Offline-first**: App works without internet (templates bundled locally)
- **Secure defaults**: No embedded credentials, no external API calls
