---
title: Designer-First Workflow: Create, Edit, Library
slug: designer-first-workflow
status: Proposed
owners: [community]
lastUpdated: 2025-10-05
phase: P2a, P3a
---

# Designer-First Workflow: Create, Edit, Library

## 1. Overview

### What & Why

Dockitect is a **visual Docker Compose designer** that bridges design and code. This proposal enhances the core designer experience with three complementary features:

- **Create:** Multiple entry points to start designing (Wizard, Blank Canvas, or Direct YAML)
- **Dual-Mode Editing:** Toggle between Visual Canvas and Monaco-powered YAML editor with bidirectional sync
- **Library:** Save, version, and reuse blueprints/stacks offline; build a personal template collection

**Vision:**  
Dockitect becomes the **go-to Docker Compose designer**: create from scratch or import existing files, edit visually or in YAML, validate before export, and maintain a personal library of tested stacks—all self-hosted and offline-first.

**Why:**  
- Reduce friction for new users (multiple entry points match different skill levels)
- Provide flexibility (visual designers AND YAML power users both happy)
- Enable reusable patterns (library of tested stacks)
- Maintain focus: **designer-first, not runtime orchestrator**

**What This Is NOT:**
- ❌ A deployment tool (no Docker socket access)
- ❌ A runtime manager (no start/stop/logs features)
- ❌ A Portainer/Dockge replacement (pure designer)

**Export, Then Deploy Anywhere:**  
Dockitect generates deterministic `docker-compose.yml` files. Deploy them with your preferred tool:
- `docker compose up` (CLI)
- Portainer (web UI)
- Dockge (interactive manager)
- Watchtower (auto-updates)

---

## 2. Goals / Non-Goals

### Goals

- **Multiple creation paths:** Wizard (guided), Blank Canvas (drag-and-drop), or Direct YAML (expert mode)
- **Dual-mode editing:** Seamless Canvas ↔ Text switching with real-time sync
- **Reusable library:** Save services and stacks; tag, search, version, and instantiate
- **Deterministic exports:** Round-trip editing preserves stable key ordering and Git-friendly diffs
- **Offline-first:** No network calls; all data local
- **Designer-first identity:** Clear positioning as a **design tool**, not deployment tool

### Non-Goals

- **Runtime deployment:** No Docker socket access; no start/stop/logs (use Portainer/Dockge/CLI)
- **Multi-host orchestration:** No agents, no remote management
- **Secrets management:** Use `.env` files or external secrets stores
- **Kubernetes export:** Compose-only for v1.x
- **Live introspection:** No reading running container state

---

## 3. User Journeys

### Journey A — Visual Designer (Beginner)

1. Open Dockitect; click **"Create with Wizard"**
2. Wizard guides through: Image → Ports → Volumes → Networks → Env
3. Click **"Create"**; service appears on Canvas
4. Drag and connect more services, networks
5. Click **"Validate"**; fix any conflicts
6. Click **"Export"**; download `docker-compose.yml`
7. Deploy with `docker compose up` or Portainer

### Journey B — YAML Power User (Expert)

1. Open Dockitect; click **"Create from YAML"**
2. Monaco editor opens with blank template or schema hints
3. Write YAML directly (autocomplete, validation)
4. Click **"Preview Canvas"** → see visual graph update in real-time
5. Toggle back to YAML; refine env vars
6. Click **"Save to Library"**; name it "Media Stack", tag it "media"
7. Click **"Export"**; deterministic YAML ready

### Journey C — Import & Refine (Existing User)

1. Upload existing `docker-compose.yml` via File Upload
2. Canvas renders the topology (Visual mode)
3. Toggle to **Text Editor**; see YAML with schema validation
4. Fix port conflict in YAML; toggle back to Canvas; conflict badge gone
5. Click **"Save to Library"**; name it "Fixed Reverse Proxy"
6. Later: Open Library → search "proxy" → instantiate into new blueprint

### Journey D — Library & Reuse

1. Browse Library; two tabs: **Services** (single-service) and **Stacks** (multi-service)
2. Search by tag "database"; find "PostgreSQL with Backup"
3. Click **"Open"**; template loads into Canvas as new blueprint (unsaved)
4. Customize env vars (POSTGRES_PASSWORD)
5. Click **"Export"**; ready to deploy

---

## 4. UX Spec

### 4.1 Creation Entry Points (Three Paths)

**Main Toolbar (Top):**

```
┌─────────────────────────────────────────────────────────┐
│ [Dockitect]  [Create ▼] [Library] [Import] [Export]   │
└─────────────────────────────────────────────────────────┘
```

**"Create" Dropdown:**
- **Blank Canvas** → Empty visual canvas; drag services/networks from sidebar palette
- **Start with Wizard** → Guided form (Image → Ports → Volumes → Env)
- **Start with YAML** → Monaco editor with Compose schema template

**Default Behavior:**
- **Blank Canvas:** Opens visual mode; sidebar palette with "Add Service", "Add Network"
- **Wizard:** Form-based creation → lands on Canvas with created service
- **YAML:** Opens Text Editor mode; **"Preview Canvas"** button in toolbar

---

### 4.2 Create Wizard (Optional Guided Path)

**Entry Points:**  
- Main toolbar: **"Create"** → **"Start with Wizard"**
- Empty canvas state: **"Get Started with Wizard"** button

**Wizard Steps (Progressive Disclosure):**

1. **Basics**  
   - Image (required): autocomplete from Docker Hub popular images  
   - Name (required): auto-suggest from image (e.g., `nginx:alpine` → `nginx`)  
   - Command (optional): override CMD

2. **Networking**  
   - Ports: add host:container mappings with protocol (TCP/UDP)  
   - Networks: select existing or create new; default to `default` network

3. **Storage**  
   - Volumes: bind mounts (source/target) or named volumes  
   - Read-only toggle per volume

4. **Environment & Restart**  
   - Env vars: key/value editor; import from `.env` file (optional)  
   - Restart policy: `no`, `always`, `on-failure`, `unless-stopped`

5. **Review & Create**  
   - Summary card: image, ports, volumes, env count  
   - **"Add to Canvas"** button → writes Blueprint, opens Canvas in Visual mode  
   - **"Save to Library"** checkbox (optional)

**Validation:**  
- Inline field errors: required image, port format (`1-65535`), duplicate service name  
- Cannot proceed with invalid inputs  
- Live preview of resulting Compose snippet (collapsible YAML preview panel)

**Accessibility:**  
- Keyboard-first: Tab navigation, Enter to proceed, Esc to cancel  
- ARIA labels on all inputs; focus trap in modal  
- Screen-reader announcements on step change

---

### 4.3 Dual-Mode Editor (Canvas ↔ Text)

**Mode Toggle (Toolbar):**

```
┌────────────────────────────────────────────────┐
│  [🎨 Canvas]  [</> YAML]  ← Pill-style toggle │
└────────────────────────────────────────────────┘
```

**Keyboard Shortcut:** `Cmd/Ctrl + Shift + E`

---

#### 4.3.1 Visual Mode (Canvas)

**Features:**
- React Flow canvas with Service, Network, Host nodes
- Drag-and-drop to add nodes from sidebar palette
- Click node → side panel with property editor
- Edges: Service↔Network membership, Service→Service dependsOn
- Validation overlays: error badge (red), warning badge (yellow)
- Context menu (right-click): Edit, Duplicate, Save as Template, Delete

**Toolbar Actions (Canvas Mode):**
- **+ Add Service** → Quick-add dialog (Name, Image, Network)
- **+ Add Network** → Quick-add dialog (Name, Driver)
- **Preview YAML** → Temporary modal showing current export (read-only)
- **Switch to YAML** → Toggle to Text Editor mode

---

#### 4.3.2 Text Mode (YAML Editor)

**Features:**
- **Monaco Editor** with full Docker Compose schema validation
- Syntax highlighting, autocomplete, error squiggles
- **Problems Panel** (bottom): line/column errors with descriptions
- **Format on Save** (Prettier for YAML)
- **Find/Replace** (Monaco built-in: `Cmd/Ctrl + F`)

**Schema Integration:**
- Powered by `monaco-yaml` + Compose Specification JSON Schema
- IntelliSense for: services, ports, volumes, networks, env, restart, depends_on
- Hover tooltips: field descriptions from Compose spec

**Toolbar Actions (YAML Mode):**
- **Preview Canvas** → Temporary side-by-side view showing visual graph (updates on type)
- **Switch to Canvas** → Toggle to Visual mode
- **Format** → Prettier YAML formatting
- **Copy All** → Copy YAML to clipboard

---

#### 4.3.3 Bidirectional Sync

**Single Source of Truth:** Blueprint v0 (in-memory Zustand store)

**YAML → Canvas:**
1. User types in Monaco editor
2. Debounced parse (500ms after last keystroke)
3. Validate YAML against Compose schema
4. If valid: Update Blueprint → Re-render Canvas
5. If invalid: Show errors in Problems Panel; do NOT update Canvas

**Canvas → YAML:**
1. User drags node, edits property in side panel
2. Immediate update to Blueprint
3. Regenerate YAML (deterministic export via `@dockitect/exporter`)
4. Update Monaco editor content (preserve cursor position if possible)

**Conflict Handling:**
- **Structural changes** (delete service with volumes) → Confirmation dialog:
  > ⚠️ **Confirm Change**  
  > Removing service 'web' will delete 3 volume mounts and 2 network connections. Proceed?  
  > [Cancel] [Proceed]

**Diff Preview (Large Changes):**
- If YAML edit changes >10 lines → **"Preview Changes"** modal before applying to Canvas
- Show side-by-side diff (old Blueprint → new Blueprint)
- User can: [Accept] [Reject] [Edit More]

**Performance:**
- Debounce YAML parsing (500ms)
- Debounce Canvas rendering on rapid edits (250ms)
- Use Web Worker for YAML parsing if >500 lines

---

### 4.4 Library (Two Tabs)

**Navigation:**

```
┌─────────────────────────────────────┐
│  Library                            │
│  ┌─────────┬─────────┐             │
│  │Services │ Stacks  │             │
│  └─────────┴─────────┘             │
└─────────────────────────────────────┘
```

---

#### 4.4.1 Services Tab (Single-Service Templates)

**Columns:**  
- Name  
- Tags (badges: `database`, `media`, `monitoring`)  
- Last Updated  
- Actions: **Open** | **Duplicate** | **Export** | **Delete**

**Features:**  
- **Search:** Filter by name, tags, description  
- **Tag filter:** Click tag badge to show all items with that tag  
- **Preview:** Hover over item → tooltip shows image, ports, volumes count  
- **Instantiate:** "Open" loads the service into Canvas as new blueprint (unsaved)  
- **Duplicate:** Creates copy with `(Copy)` appended to name

**Empty State:**
> **No service templates yet**  
> Create one from a blueprint or import a compose file with a single service.  
> [Import Compose] [Create Service]

---

#### 4.4.2 Stacks Tab (Multi-Service Blueprints)

**Columns:**  
- Name  
- Tags (badges: `media-stack`, `monitoring`, `web-apps`)  
- Services Count (e.g., "5 services")  
- Last Updated  
- Actions: **Open** | **Duplicate** | **Export** | **Delete**

**Features:**  
- **Search & Filter:** Same as Services tab  
- **Preview:** Hover → tooltip shows service names, network count  
- **Instantiate:** "Open" loads entire stack into Canvas

**Empty State:**
> **No stacks saved**  
> Save your current blueprint to start building your library.  
> [Save Current Blueprint]

---

#### 4.4.3 Save to Library Flow

**From Canvas (Toolbar):**

Click **"Save to Library"** → Modal:

```
┌───────────────────────────────────────┐
│  Save to Library                      │
│                                       │
│  Type: ○ Service  ● Stack            │
│                                       │
│  Name: [Media Server Stack_____]     │
│  Description (optional):              │
│  [Jellyfin + Sonarr + Radarr___]     │
│                                       │
│  Tags: [media] [×]  [+Add Tag]       │
│                                       │
│  [Cancel]              [Save]        │
└───────────────────────────────────────┘
```

**Validation:**
- Name required
- Duplicate name → warning: "A template with this name exists. Overwrite?"
- Service type: must have exactly 1 service in Blueprint
- Stack type: must have ≥1 service

---

### 4.5 Import Flow

**File Upload Button (Toolbar):**

Click **"Import"** → File picker (`.yml`, `.yaml`)

**Import Behavior:**
1. Parse Compose YAML via `@dockitect/importer`
2. Convert to Blueprint v0
3. **Default: Open in Visual mode** (Canvas)
4. Show success toast: "Imported 5 services, 2 networks"
5. If errors: Show Problems Panel with warnings (e.g., unsupported fields)

**User Can:**
- View in Canvas immediately (default)
- Toggle to YAML to see imported file
- Save to Library
- Export (deterministic, cleaned up)

---

### 4.6 Export Flow

**Export Button (Toolbar):**

Click **"Export"** → Triggers download

**Export Behavior:**
1. Convert Blueprint v0 to Compose YAML via `@dockitect/exporter`
2. Deterministic key ordering (alphabetical services, networks, volumes)
3. Stable array ordering within services
4. Download as `docker-compose.yml` (or user-specified name)

**Advanced Options (Optional Menu):**
- **Format:** Compose v2.x (default) | Compose v3.x (legacy)
- **Filename:** Custom name
- **Include comments:** Add inline comments for clarity

---

## 5. Architecture & Data Flow

### Key Principles

- **Single Source of Truth:** Blueprint v0 in memory (Zustand store)
- **Deterministic Import/Export:** Via existing packages (`@dockitect/importer`, `@dockitect/exporter`)
- **Local-Only:** No network calls; SQLite for library storage
- **File-Based Designer:** No Docker socket; pure design tool

### Mermaid Diagram

```mermaid
flowchart LR
  subgraph UI
    Canvas[🎨 Canvas Mode]
    Editor[</> YAML Mode]
    Wizard[🪄 Wizard]
  end
  
  State((Blueprint v0<br/>Zustand Store))
  
  subgraph Packages
    IMP[@dockitect/importer]
    EXP[@dockitect/exporter]
    SCHEMA[@dockitect/schema]
  end
  
  Library[(Library<br/>SQLite)]
  ComposeIn[(docker-compose.yml<br/>Import)]
  ComposeOut[(docker-compose.yml<br/>Export)]
  
  Canvas <--> State
  Editor <--> State
  Wizard --> State
  
  State <--> SCHEMA
  ComposeIn --> IMP --> State
  State --> EXP --> ComposeOut
  State <--> Library
```

### State Flow

**Creation:**
- Wizard → writes Blueprint → opens Canvas
- Blank Canvas → user adds nodes → updates Blueprint
- YAML Editor → parses YAML → updates Blueprint → syncs Canvas

**Editing:**
- Canvas edits → update Blueprint → regenerate YAML
- YAML edits → parse → update Blueprint → re-render Canvas

**Persistence:**
- Save to Library → serialize Blueprint → store in SQLite
- Open from Library → load Blueprint → render in Canvas or YAML

**Export:**
- Blueprint → Exporter → deterministic YAML → download

---

## 6. Data Model

### Blueprint v0 (Existing)

```typescript
type Blueprint = {
  version: 'v0';
  meta: { 
    id: string; 
    name: string; 
    createdAt: string; 
    updatedAt: string;
  };
  hosts: Host[];
  networks: Network[];
  services: Service[];
};

type Host = { 
  id: string; 
  name: string; 
};

type Network = { 
  id: string; 
  name: string; 
  driver?: string; 
  external?: boolean; 
};

type Service = {
  id: string;
  name: string;
  image: string;
  command?: string[];
  env?: Record<string, string>;
  ports?: Port[];
  volumes?: Volume[];
  networks?: string[]; // Network.id[]
  dependsOn?: string[]; // Service.id[]
  restart?: 'no' | 'always' | 'unless-stopped' | 'on-failure';
  labels?: Record<string, string>;
  hostId?: string; // Host.id
};
```

### Library Entities (New)

**ServiceTemplate:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  tags: string[];
  version?: string;
  createdAt: Date;
  updatedAt: Date;
  blueprintSnapshot: {
    services: [Service]; // Single service
    networks?: Network[]; // Optional dependencies
  };
}
```

**Stack:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  tags: string[];
  version?: string;
  createdAt: Date;
  updatedAt: Date;
  blueprint: Blueprint; // Full Blueprint v0
}
```

### SQLite Schema (Prisma)

```prisma
model ServiceTemplate {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  tags        String   // JSON array
  version     String   @default("v0")
  data        String   // JSON Blueprint snapshot
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Stack {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  tags        String   // JSON array
  version     String   @default("v0")
  blueprint   String   // JSON Blueprint
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 7. Monaco Editor Integration

### Technical Stack

- **@monaco-editor/react** (React wrapper)
- **monaco-yaml** (YAML language support + schema validation)
- **Compose Specification JSON Schema** (`compose-spec/schema/compose-spec.json`)

### Features

- Syntax highlighting for YAML
- Autocomplete: services, ports, volumes, networks, env
- Schema validation: real-time error squiggles
- Hover tooltips: field descriptions from Compose spec
- Problems panel: line/column errors
- Format on save (Prettier)
- Find/Replace (Monaco built-in)

### Setup (Code Sketch)

```typescript
// apps/web/components/YAMLEditor.tsx
"use client";
import Editor from "@monaco-editor/react";
import { configureMonacoYaml } from "monaco-yaml";

function beforeMount(monaco) {
  configureMonacoYaml(monaco, {
    enableSchemaRequest: true,
    yamlVersion: "1.2",
    schemas: [
      {
        uri: "https://raw.githubusercontent.com/compose-spec/compose-spec/main/schema/compose-spec.json",
        fileMatch: ["**/docker-compose*.yml", "**/compose.yml"],
      },
    ],
  });
}

export function YAMLEditor({ value, onChange }) {
  return (
    <Editor
      height="100vh"
      defaultLanguage="yaml"
      value={value}
      beforeMount={beforeMount}
      onChange={onChange}
      options={{
        wordWrap: "on",
        tabSize: 2,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
}
```

### Sync Strategy

**Single Source of Truth:** Blueprint v0 in Zustand

**YAML → Blueprint:**
```typescript
const handleYAMLChange = useDeBounce((yaml: string) => {
  try {
    const parsed = parseYAML(yaml); // yaml npm package
    const blueprint = importCompose(parsed); // @dockitect/importer
    setBlueprintState(blueprint); // Zustand action
  } catch (error) {
    setProblems([{ line, column, message }]); // Show in Problems Panel
  }
}, 500);
```

**Blueprint → YAML:**
```typescript
const yaml = useMemo(() => {
  return exportCompose(blueprintState); // @dockitect/exporter
}, [blueprintState]);

// Monaco editor controlled value
<Editor value={yaml} onChange={handleYAMLChange} />
```

---

## 8. Roadmap Integration

### P2a — Create Wizard + Library Foundations

**Scope:**  
- Service Creation Wizard (Basics → Networking → Storage → Env → Review)
- "Blank Canvas" entry point with sidebar palette
- "Start with YAML" entry point (Monaco editor)
- Library UI (Services + Stacks tabs)
- Save to Library flow
- Open from Library flow
- Search, tag filtering, duplicate, delete

**Deliverables:**  
- ✅ Three creation paths functional (Wizard, Canvas, YAML)
- ✅ Library can save, tag, search, instantiate templates offline
- ✅ "Save to Library" button in toolbar

**Acceptance Criteria:**  
- [ ] Wizard produces valid Blueprint v0 that passes schema validation
- [ ] Blank Canvas allows drag-and-drop service/network creation
- [ ] "Start with YAML" opens Monaco editor with schema validation
- [ ] Library can save, tag, search, and instantiate templates offline
- [ ] E2E test: Wizard → Canvas → Save to Library → Open → Export

**Estimated Effort:** **M** (4-6 days)

---

### P3a — Dual-Mode Editor (Canvas ↔ YAML)

**Scope:**  
- Monaco-based YAML editor with Docker Compose schema validation
- Bidirectional sync with Canvas (debounced, conflict-aware)
- Mode toggle in toolbar (Canvas | YAML)
- Problems panel (line/column errors)
- Preview features: "Preview Canvas" in YAML mode, "Preview YAML" in Canvas mode
- Diff modal for large structural changes
- Format-on-save, find/replace

**Deliverables:**  
- ✅ Monaco YAML editor with Compose schema autocomplete
- ✅ Toggle between Canvas and YAML modes (toolbar + keyboard shortcut)
- ✅ Edits in either mode reflect in the other within 500ms
- ✅ Problems panel shows validation errors with line numbers
- ✅ Conflict confirmation dialog for structural changes

**Acceptance Criteria:**  
- [ ] Canvas and YAML stay in sync; edits in either reflect within 500ms
- [ ] YAML validates against Compose schema; diagnostics shown in Problems panel
- [ ] Conflict dialog on structural changes (e.g., deleting service with volumes)
- [ ] "Preview Canvas" in YAML mode shows live visual graph (side-by-side or modal)
- [ ] E2E test: Import → Edit YAML → Toggle Canvas → Verify changes → Export

**Estimated Effort:** **L** (5-7 days)

---

## 9. Acceptance Criteria (Summary)

- [ ] **Three creation paths** work: Wizard, Blank Canvas, Start with YAML
- [ ] **Wizard** produces valid Blueprint v0 that passes schema validation
- [ ] **Canvas and YAML** stay in sync; edits in either reflect within 500ms
- [ ] **Exporter** outputs deterministic `docker-compose.yml` (stable key ordering)
- [ ] **Library** can save, tag, search, preview, and instantiate templates offline
- [ ] **Monaco editor** validates against Compose schema; shows autocomplete and errors
- [ ] **Conflict dialog** appears on structural changes (delete service, remove volumes)
- [ ] **No network requests** occur (fully offline)
- [ ] **Import → Canvas → YAML → Edit → Export** round-trip works

---

## 10. Test Plan

### Automated

**Unit:**  
- `@dockitect/schema` (Zod validation)
- `@dockitect/importer` (Compose → Blueprint round-trip)
- `@dockitect/exporter` (Blueprint → Compose deterministic output)
- Library CRUD (save, load, delete, search)
- Wizard form validation

**Integration:**  
- YAML Editor ↔ Blueprint ↔ Canvas synchronization
- Deterministic export snapshots (multiple exports produce identical diffs)
- Library save/load round-trip

**E2E (Playwright):**  
- **Wizard flow:** Wizard → Canvas → Export → Verify valid Compose
- **YAML flow:** Start with YAML → Write YAML → Preview Canvas → Export
- **Import flow:** Upload Compose → Canvas → Toggle YAML → Verify sync
- **Library flow:** Import → Save to Library → Reopen → Export → Compare
- **Sync test:** Edit YAML → Toggle Canvas → Edit Canvas → Toggle YAML → Verify consistency

### Manual

**Offline verification:**  
- Disconnect network; verify all features work (no API calls)

**Conflict dialogs:**  
- Delete service with volumes in YAML → verify confirmation modal
- Remove network in Canvas → verify connected services prompt

**Error states:**  
- Invalid YAML syntax → verify Problems panel
- Port conflicts → verify Canvas error badges
- Missing required fields → verify wizard validation

**Accessibility:**  
- Keyboard-only navigation (Tab, Enter, Esc)
- Screen reader compatibility (ARIA labels)
- Focus order logical
- Dark/light themes work

---

## 11. Risks & Mitigations

### Risk: Bidirectional Sync Complexity

**Problem:** YAML edits that Compose permits but Blueprint can't express  
**Mitigation:**  
- Problems panel shows warnings for unsupported fields
- Preserve raw fields as labels when safe
- Document supported Compose features clearly

### Risk: Monaco Performance

**Problem:** Monaco + React Flow on same page might be heavy  
**Mitigation:**  
- Lazy-load Monaco (only mount when YAML mode active)
- Use Web Worker for YAML parsing (>500 lines)
- Debounce sync (500ms)

### Risk: UX Confusion (Two Modes)

**Problem:** Users unsure when to use Canvas vs YAML  
**Mitigation:**  
- Clear onboarding: "Choose your style: Visual or Code"
- Tooltips on mode toggle: "Switch to YAML editor" / "Switch to visual canvas"
- Tutorial/docs: "When to use each mode"

### Risk: Library Data Loss

**Problem:** SQLite corruption or accidental deletion  
**Mitigation:**  
- Export library as JSON backup (feature in settings)
- Import library from JSON backup
- Auto-backup to user's data directory (weekly)

---

## 12. Open Questions

- **Template variables:** Should services support variable substitution (e.g., `${HOSTNAME}`)? If yes, MVP or post-MVP?
- **Library sharing:** Should users be able to export/import library as JSON for sharing? (Likely yes, simple feature)
- **Monaco themes:** Should editor theme sync with app theme (light/dark)? (Likely yes)
- **YAML validation strictness:** Allow unknown Compose fields (with warnings) or reject? (Suggest: allow with warnings)
- **Multi-file compose:** Support `docker-compose.yml` + `docker-compose.override.yml`? (Defer to post-MVP)

---

## 13. UI Microcopy Examples

### Buttons & Actions

- **Create** (dropdown: Blank Canvas | Start with Wizard | Start with YAML)
- **Save to Library**
- **Export**
- **Import**
- **Switch to YAML** / **Switch to Canvas**
- **Preview Canvas** (in YAML mode)
- **Format YAML**

### Empty States

- **Canvas (blank):** "Start designing. Add your first service or network from the sidebar."
- **Library Services:** "No service templates yet. Create one from a blueprint or import a compose file."
- **Library Stacks:** "No stacks saved. Save your current blueprint to start building your library."

### Confirmations

- **Delete from Library:** "Delete 'Media Server Stack'? This cannot be undone."
- **Structural change:** "Removing service 'web' will delete 3 volume mounts. Proceed?"
- **Overwrite template:** "A template named 'PostgreSQL' already exists. Overwrite?"

### Errors & Warnings

- **YAML syntax:** "Invalid YAML at line 12, column 5: unexpected token"
- **Port conflict:** "Port 8080 is already used by service 'nginx'"
- **Missing field:** "Service 'web' requires an image"
- **Validation:** "Network 'frontend' is referenced but not defined"

### Tooltips & Help

- **Mode toggle:** "Switch between visual canvas and YAML editor (Cmd+Shift+E)"
- **Preview Canvas:** "See how your YAML looks as a visual graph"
- **Save to Library:** "Save this blueprint to reuse later"

---

## 14. Examples

### Wizard → docker-compose.yml

**Wizard Inputs:**  
- Image: `nginx:alpine`
- Name: `web`
- Ports: `8080:80/tcp`
- Env: `TZ=UTC`
- Volume: bind `./site` → `/usr/share/nginx/html`
- Restart: `unless-stopped`

**Generated YAML:**

```yaml
version: "3.9"
services:
  web:
    container_name: web
    environment:
      TZ: "UTC"
    image: nginx:alpine
    ports:
      - "8080:80/tcp"
    restart: unless-stopped
    volumes:
      - type: bind
        source: ./site
        target: /usr/share/nginx/html
networks:
  default:
    name: webnet
```

### YAML Editor → Canvas Preview

**User Types:**

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/postgresql/data
  
  app:
    image: myapp:latest
    depends_on:
      - db
    ports:
      - "3000:3000"

volumes:
  db-data:
```

**Canvas Preview Shows:**
- 2 service nodes: `db`, `app`
- 1 volume node: `db-data`
- Edge: `app` → `db` (depends_on)
- Edge: `db` → `db-data` (volume mount)

---

## 15. Marketing Positioning

### Tagline
> **"The beautiful Docker Compose designer. Edit visually or in YAML, export deterministic configs, deploy anywhere."**

### Key Messages

1. **Designer-First:** Not a deployment tool; pure design tool
2. **Dual-Mode Editing:** Visual designers AND YAML experts both happy
3. **Deterministic Exports:** Git-friendly diffs for version control
4. **Offline-First:** Self-hosted, no telemetry, no Docker socket
5. **Beautiful UX:** Next.js + shadcn/ui + Monaco = polished experience

### Competitive Differentiation

| Feature | Portainer | Dockge | **Dockitect** |
|---|---|---|---|
| **Visual Canvas Editing** | ❌ | ❌ | ✅ |
| **YAML Editor** | ✅ | ✅ | ✅ (Monaco + schema) |
| **Dual-Mode (Canvas ↔ YAML)** | ❌ | ❌ | ✅ **UNIQUE** |
| **Deterministic Exports** | ❌ | ❌ | ✅ (Git-friendly) |
| **Runtime Deployment** | ✅ | ✅ | ❌ (by design) |
| **Purpose** | Orchestrator | Manager | **Designer** |

**We Are:**  
- The **Figma** of Docker Compose (design tool, not deployment tool)
- The **missing link** between whiteboard sketches and `docker-compose.yml`

**We Are NOT:**  
- A Portainer replacement (use Portainer for runtime)
- A server management tool (use Dockge/CLI for deploy)

---

## 16. Success Metrics

**MVP Success (P2a + P3a complete):**
- [ ] User can create a service via Wizard in <2 min
- [ ] User can edit YAML and see Canvas update in <1 sec
- [ ] User can save/load from Library without errors
- [ ] Export produces byte-identical YAML on repeat exports
- [ ] 90% of test coverage for sync logic

**Community Adoption (Post-Launch):**
- ≥100 GitHub stars in first month
- ≥10 community issues/PRs
- ≥5 user-submitted templates in Library

---

## 17. Next Steps

1. **Team Review:** Gather feedback on scope and priorities
2. **Update Roadmap:** Add P2a and P3a with detailed acceptance criteria
3. **Design Mocks:** Wizard, Library, Mode Toggle, YAML Editor (Excalidraw/Figma)
4. **Spike: Monaco Integration** (1-2 days)
   - Proof-of-concept: Monaco + monaco-yaml + Compose schema
   - Test bidirectional sync performance
5. **Spike: Library Storage** (1 day)
   - Prisma schema for ServiceTemplate and Stack
   - Save/load/search implementation
6. **Implementation:**
   - **Week 1-2:** P2a (Wizard + Library)
   - **Week 3-4:** P3a (Dual-Mode Editor)
   - **Week 5:** Integration, polish, docs

---

## 18. Linking

- **Roadmap:** [docs/product/roadmap.md](./roadmap.md)
- **MVP:** [docs/product/mvp.md](./mvp.md)
- **Checklist:** [docs/product/checklist.md](./checklist.md)
- **ADR 0001 (Blueprint schema):** [docs/adr/0001-blueprint-schema.md](../adr/0001-blueprint-schema.md)

---

_Last updated: 2025-10-05 | Status: Proposed | Next review: After P1.6 complete_
