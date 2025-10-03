# Dockitect - Session Summary (2025-10-03)

## ✅ PHASE P0: 100% COMPLETE

All foundation work is done. Repository is production-ready.

---

## 🎯 WHAT'S NEXT: Phase P1 - MVP Importer

**Current Status:** Ready to begin P1 implementation
**Next Phase:** P1 - MVP Importer (Compose v2.x → Blueprint)
**Estimated Effort:** 5-7 days (Large)

---

## 📋 P1 OVERVIEW

**Goal:** Parse docker-compose.yml files into Blueprint v0 JSON and render nodes on canvas.

**Core Deliverables:**

1. Blueprint v0 schema (Zod) in `/packages/schema`
2. Compose → Blueprint parser in `/packages/importer`
3. File upload UI component in `/apps/web`
4. Canvas rendering of Service/Network nodes with edges

**Success Metrics:**

- Upload .yml file → see services as nodes on canvas
- Auto-layout with no overlapping nodes
- Visual distinction between node types
- Round-trip test: import → export → re-import (semantic equivalence)

---

## 📝 P1 TASK BREAKDOWN

### **P1.1: Define Blueprint v0 Schema (Zod)** ⬜

**Priority:** CRITICAL (foundation for all other tasks)

**What to Build:**

```
/packages/schema/
  ├── src/
  │   ├── index.ts           # Export all types
  │   ├── blueprint.ts       # Core Zod schema
  │   └── __tests__/
  │       └── blueprint.test.ts
  ├── package.json
  └── tsconfig.json
```

**Key Types to Implement:**

```typescript
type Blueprint = {
    version: "v0";
    meta: { id: string; name: string; createdAt: string; updatedAt: string };
    hosts: Host[]; // e.g., "nas", "pi-4", "vm-01"
    networks: Net[]; // name, subnet (optional), driver
    services: Service[]; // name, image, env, ports, volumes, networks, hostId
};

type Host = { id: string; name: string; notes?: string };
type Net = { id: string; name: string; driver?: string; subnetCidr?: string };
type Port = { host: number; container: number; protocol?: "tcp" | "udp" };
type Volume = { type: "bind" | "volume"; source: string; target: string; readOnly?: boolean };

type Service = {
    id: string;
    name: string;
    image: string;
    command?: string[];
    env?: Record<string, string>;
    ports?: Port[];
    volumes?: Volume[];
    networks?: string[]; // Net.id
    dependsOn?: string[]; // Service.id
    restart?: "no" | "always" | "unless-stopped" | "on-failure";
    labels?: Record<string, string>;
    hostId?: string; // Host.id (optional in v0)
};
```

**Commands:**

```bash
cd packages/schema
pnpm init
pnpm add zod zod-to-json-schema
pnpm add -D typescript vitest @types/node
pnpm install
```

**Tests Required:**

- Valid Blueprint instances pass validation
- Invalid instances fail with clear error messages
- JSON Schema export works
- Coverage ≥90%

**Commit Message:**

```
feat(schema): define Blueprint v0 with Zod validation

- Implement Blueprint v0 schema with Host, Network, Service types
- Add Zod validation with strict typing
- Export JSON Schema for API documentation
- Add comprehensive test coverage (≥90%)
```

**Docs to Update:**

- `/docs/tech/architecture.md` - Add Blueprint schema section
- `/docs/adr/0001-blueprint-schema.md` - Update with final implementation

---

### **P1.2: Implement Compose → Blueprint Parser** ⬜

**Priority:** HIGH (depends on P1.1)

**What to Build:**

```
/packages/importer/
  ├── src/
  │   ├── index.ts           # Main export
  │   ├── compose-importer.ts # Parser logic
  │   ├── __fixtures__/      # Test compose files
  │   │   ├── simple.yml
  │   │   ├── multi-service.yml
  │   │   ├── networks.yml
  │   │   ├── volumes.yml
  │   │   └── ports.yml
  │   └── __tests__/
  │       └── compose-importer.test.ts
  ├── package.json
  └── tsconfig.json
```

**Core Functionality:**

- Parse docker-compose.yml (v2.x spec)
- Extract: services, networks, volumes
- Map to Blueprint v0 structure
- Handle edge cases (missing networks, volume syntax variations)
- Generate unique IDs for entities

**Commands:**

```bash
cd packages/importer
pnpm init
pnpm add yaml @dockitect/schema
pnpm add -D typescript vitest @types/node
pnpm install
```

**Test Fixtures to Create:**

1. `simple.yml` - Single service (nginx)
2. `multi-service.yml` - 3+ services with dependencies
3. `networks.yml` - Custom networks with services
4. `volumes.yml` - Bind mounts and named volumes
5. `ports.yml` - Various port mappings

**Tests Required:**

- Each fixture parses without errors
- Blueprint validates against schema
- Round-trip test: parse → export → parse (semantic equality)
- Edge cases: empty compose, missing services, invalid YAML
- Coverage ≥80%

**Commit Message:**

```
feat(importer): implement Compose v2.x → Blueprint parser

- Add YAML parser for docker-compose files
- Map services, networks, volumes to Blueprint v0
- Handle edge cases and validation errors
- Add 5+ test fixtures with comprehensive coverage
```

**Docs to Update:**

- `/docs/tech/architecture.md` - Add importer data flow diagram
- Create `/docs/how-to/import-compose.md` - User guide

---

### **P1.3: File Upload UI Component** ⬜

**Priority:** MEDIUM (depends on P1.2)

**What to Build:**

```
/apps/web/components/
  ├── FileUpload.tsx         # Upload button/dropzone
  └── __tests__/
      └── FileUpload.test.tsx
```

**Features:**

- Upload button or drag-and-drop zone
- Accept `.yml` and `.yaml` files
- File validation (YAML syntax check)
- Display parsing errors to user
- Loading states during import
- Success feedback with node count

**Integration:**

- Call importer package to parse uploaded file
- Update Zustand store with parsed Blueprint
- Trigger canvas re-render

**Commands:**

```bash
cd apps/web
pnpm add react-dropzone  # Optional, for drag-and-drop
```

**E2E Test:**

```typescript
test("upload compose file renders nodes", async ({ page }) => {
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("__fixtures__/jellyfin.yml");
    await expect(page.locator('[data-testid="service-node"]')).toHaveCount(1);
});
```

**Commit Message:**

```
feat(ui): add file upload component for compose import

- Create FileUpload component with validation
- Integrate with importer package
- Update Zustand store with parsed Blueprint
- Add E2E test for upload flow
```

---

### **P1.4: Render Service Nodes on Canvas** ⬜

**Priority:** HIGH (depends on P1.3)

**What to Build:**

- Update `Canvas.tsx` to render Blueprint nodes
- Create custom node components:
    - `ServiceNode.tsx` - Service container with image, ports
    - `NetworkNode.tsx` - Network bubble
    - `HostNode.tsx` - Placeholder for future
- Position algorithm (auto-layout)
- Connect services with edges based on networks/dependencies

**Auto-Layout Strategy:**

```typescript
// Simple grid layout for MVP
const layoutNodes = (services: Service[]) => {
    return services.map((service, index) => ({
        id: service.id,
        type: "service",
        data: { label: service.name, image: service.image },
        position: {
            x: (index % 3) * 300,
            y: Math.floor(index / 3) * 200,
        },
    }));
};
```

**Node Styling:**

- Service nodes: Blue border, white background
- Network nodes: Green bubble, dashed border
- Edges: Grey lines with arrows

**Commit Message:**

```
feat(ui): render service nodes from imported Blueprint

- Add ServiceNode and NetworkNode components
- Implement basic grid auto-layout
- Connect services with network edges
- Add E2E test for node rendering
```

---

## 🔧 TECHNICAL NOTES

### **Dependencies to Add:**

**Schema package:**

- `zod` - Runtime validation
- `zod-to-json-schema` - JSON Schema export

**Importer package:**

- `yaml` - YAML parsing
- `@dockitect/schema` - Blueprint types

**Web app:**

- `react-dropzone` (optional) - Drag-and-drop upload

### **Testing Strategy:**

1. **Unit Tests (Vitest):**
    - Schema validation
    - Parser logic
    - Component rendering

2. **E2E Tests (Playwright):**
    - Upload file → verify nodes appear
    - Test with jellyfin.yml fixture

3. **Coverage Targets:**
    - Schema: ≥90%
    - Importer: ≥80%
    - Components: ≥70%

### **Common Pitfalls to Avoid:**

1. **Don't parse everything:** Start with services, networks, volumes only (defer extends, anchors, profiles)
2. **Don't over-engineer layout:** Simple grid is fine for P1
3. **Don't skip validation:** Always validate parsed Blueprint against schema
4. **Don't forget error handling:** Show user-friendly messages for parse failures

---

## 📊 P1 ACCEPTANCE CRITERIA CHECKLIST

- [ ] Importer handles 5+ test fixtures without errors
- [ ] Blueprint v0 schema validates all parsed outputs
- [ ] Canvas renders ≥3 service nodes from multi-service compose
- [ ] Network edges connect services correctly
- [ ] E2E test uploads jellyfin.yml and asserts 1 service node visible
- [ ] Code coverage ≥80% for importer package
- [ ] Upload UI shows loading/success/error states
- [ ] Nodes don't overlap (basic auto-layout)

---

## 🚀 GETTING STARTED (Next Session)

### **Step 1: Start with P1.1 (Schema)**

```bash
cd /Users/andreaventi/Developer/Dockitect
git checkout -b feat/p1.1-blueprint-schema

# Create schema package
cd packages/schema
pnpm init
pnpm add zod zod-to-json-schema
pnpm add -D typescript vitest @types/node

# Create file structure
mkdir -p src/__tests__
touch src/index.ts src/blueprint.ts src/__tests__/blueprint.test.ts

# Start coding!
code src/blueprint.ts
```

### **Recommended Order:**

1. ✅ **Start with P1.1** (schema) - Foundation for everything
2. ✅ **Then P1.2** (importer) - Core parsing logic
3. ✅ **Then P1.3** (upload UI) - User interaction
4. ✅ **Finally P1.4** (canvas rendering) - Visual output

**Each sub-task = separate PR** (small, focused, testable)

---

## 🎯 KEY REFERENCES

**Vision Document:** `/Dockitect.md`
**Roadmap:** `/docs/product/roadmap.md`
**Checklist:** `/docs/product/checklist.md`
**Architecture:** `/docs/tech/architecture.md`
**ADR 0001:** `/docs/adr/0001-blueprint-schema.md`

**Current Branch:** `main`
**Latest Commit:** `84822ac` - docs: add Zustand to tech stack

---

## 💡 TIPS FOR SUCCESS

1. **Read ADR 0001 first** - Blueprint schema is already designed
2. **Use test fixtures early** - Start with `simple.yml` and build up
3. **Commit frequently** - Each sub-task should be 1 commit
4. **Run tests often** - `pnpm test` after every change
5. **Check types** - `pnpm typecheck` before committing
6. **Update docs** - Architecture.md and ADRs as you go

---

## 📈 PROGRESS TRACKING

**P0:** ✅ COMPLETE (100%)
**P1:** ⬜ NOT STARTED (0%)

- P1.1: ⬜ Blueprint Schema
- P1.2: ⬜ Compose Parser
- P1.3: ⬜ Upload UI
- P1.4: ⬜ Canvas Rendering

**Estimated Timeline:** 5-7 days (40-56 hours)

---

## 🎉 MOTIVATION

You're about to build the **core value proposition** of Dockitect:

> "Upload docker-compose.yml → see your stack visualized"

This is the **killer feature** that will make users go "wow!" 🚀

Everything you build in P1 enables:

- P2: Export (reverse direction)
- P3: Conflict detection (the "aha!" moment)
- P4-P7: Polish and release

**Let's make it happen!** 💪

---

**Session End:** 2025-10-03
**Next Agent:** Start with P1.1 - Blueprint Schema
**Status:** Ready to build 🚀
