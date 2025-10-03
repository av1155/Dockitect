# Architecture Overview

## Monorepo Structure

```
dockitect/
├── apps/
│   └── web/              # Next.js frontend
├── packages/
│   ├── schema/           # Blueprint schema (Zod)
│   ├── importer/         # Compose → Blueprint
│   └── exporter/         # Blueprint → Compose
└── templates/
    └── appliances/       # Pre-built stacks
```

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React hooks + Context API (MVP)

### Backend/Core

- **Schema**: Zod for validation
- **Parsing**: YAML for docker-compose
- **Build**: Turbo monorepo, pnpm workspaces

### Infrastructure

- **CI/CD**: GitHub Actions
- **Deployment**: Docker multi-arch builds
- **Security**: CodeQL scanning

## Design Principles

1. **Type-safe**: Schema-first design with Zod
2. **Modular**: Separate concerns (schema, import, export, UI)
3. **Extensible**: Plugin-ready architecture for future templates
4. **Portable**: Works offline, no backend required for MVP
