# Dockitect — Design your homelab. Export the stack.

[![CI](https://github.com/av1155/Dockitect/actions/workflows/ci.yml/badge.svg)](https://github.com/av1155/Dockitect/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Draw your topology on a canvas, then export **deterministic `docker-compose.yml`** you can run anywhere. Import existing Compose to visualize and fix conflicts. Self-hosted, beautiful, and fast.

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

- [x] Repository setup with CI/CD pipeline
- [x] Next.js monorepo structure
- [x] TypeScript strict mode + ESLint + Prettier
- [x] React Flow canvas with Zustand state management
- [ ] Canvas editor with Host / Network / Service nodes
- [ ] Import Compose v2.x → Blueprint graph
- [ ] Export Blueprint → stable docker-compose.yml
- [ ] Port/volume/name conflict detection
- [ ] 5+ appliance templates (drag-and-drop)
- [ ] SQLite persistence for blueprints
- [ ] Light/dark theme

_See [roadmap.md](docs/product/roadmap.md) for full plan._

---

## 🚀 Quickstart

### Development

```bash
git clone https://github.com/av1155/Dockitect.git
cd Dockitect
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

### Docker (Coming Soon)

```bash
docker run -d -p 3000:3000 \
  -v $(pwd)/dockitect-data:/data \
  ghcr.io/av1155/dockitect:latest
```

---

## 📁 Project Structure

```
apps/web/              # Next.js app (UI, API)
packages/
  schema/              # Blueprint Zod schema
  importer/            # Compose → Blueprint parser
  exporter/            # Blueprint → Compose generator
templates/appliances/  # Pre-built service templates
docs/                  # Documentation
  product/             # Roadmap, MVP spec, checklist
  tech/                # Architecture, ADRs
  how-to/              # User guides
```

---

## 🛠️ Tech Stack

**Frontend:**

- [Next.js 15](https://nextjs.org/) (App Router)
- [React Flow](https://reactflow.dev/) (Canvas)
- [Zustand](https://zustand.docs.pmnd.rs/) (State management)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)

**Backend:**

- [Zod](https://zod.dev/) (Schema validation)
- [Prisma](https://www.prisma.io/) (Database ORM)
- SQLite (Persistence)

**Tooling:**

- [Turbo](https://turbo.build/) (Monorepo build system)
- [Vitest](https://vitest.dev/) (Unit tests)
- [Playwright](https://playwright.dev/) (E2E tests)
- GitHub Actions (CI/CD)

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Code style guide
- Testing requirements
- Pull request process

---

## 📄 License

[MIT License](LICENSE) — use freely, commercially or personally.

---

## 🗺️ Roadmap

Current phase: **P0 - Repository & Project Setup** ✅

Next up:

- **P1**: MVP Importer (Compose v2.x → Blueprint)
- **P2**: MVP Exporter (Blueprint → Compose v2.x)
- **P3**: Conflict Lint & Validation

See [docs/product/roadmap.md](docs/product/roadmap.md) for details.

---

## 📬 Support

- **Documentation**: [/docs](docs/)
- **Discussions**: [GitHub Discussions](https://github.com/av1155/Dockitect/discussions)
- **Bug Reports**: [Issue Tracker](https://github.com/av1155/Dockitect/issues/new/choose)
- **Security**: See [SECURITY.md](SECURITY.md)

---

**Built with ❤️ for the selfhosted community**
