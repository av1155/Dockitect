# ADR 0001: Blueprint Schema Design

## Status

Proposed

## Context

Dockitect needs an internal representation for Docker stacks that can:

- Be validated at runtime
- Convert to/from docker-compose.yml
- Support future extensions (Kubernetes, Podman)
- Provide type safety in TypeScript

## Decision

Use **Zod** for schema validation with a custom Blueprint format.

### Schema Structure

```typescript
{
  version: string,          // Blueprint schema version
  name: string,             // Stack name
  description?: string,     // Optional description
  services: {               // Service definitions
    [serviceName]: {
      image: string,
      ports?: string[],
      environment?: Record<string, string>,
      volumes?: string[],
    }
  }
}
```

## Consequences

### Positive

- Runtime validation with TypeScript types
- Clear separation from docker-compose format
- Easy to extend without breaking changes
- Type inference for better DX

### Negative

- Custom format requires import/export logic
- Not 1:1 with docker-compose (learning curve)
- Need to maintain mapping layer

### Neutral

- Future: add `networks`, `secrets`, `configs` as needed
- Version field enables schema evolution
