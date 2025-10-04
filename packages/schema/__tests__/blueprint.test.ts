import { describe, it, expect } from "vitest";
import {
  BlueprintSchema,
  PortSchema,
  VolumeSchema,
  HostSchema,
  NetSchema,
  ServiceSchema,
  BlueprintMetaSchema,
  type Blueprint,
} from "../src/blueprint";

describe("PortSchema", () => {
  it("validates a valid TCP port mapping", () => {
    const port = { host: 8080, container: 80, protocol: "tcp" as const };
    expect(() => PortSchema.parse(port)).not.toThrow();
  });

  it("validates a valid UDP port mapping", () => {
    const port = { host: 53, container: 53, protocol: "udp" as const };
    expect(() => PortSchema.parse(port)).not.toThrow();
  });

  it("defaults protocol to tcp when omitted", () => {
    const port = { host: 8080, container: 80 };
    const result = PortSchema.parse(port);
    expect(result.protocol).toBe("tcp");
  });

  it("rejects invalid port numbers", () => {
    expect(() => PortSchema.parse({ host: 0, container: 80 })).toThrow();
    expect(() => PortSchema.parse({ host: 8080, container: 70000 })).toThrow();
    expect(() => PortSchema.parse({ host: -1, container: 80 })).toThrow();
  });

  it("rejects non-integer port numbers", () => {
    expect(() => PortSchema.parse({ host: 8080.5, container: 80 })).toThrow();
  });

  it("rejects invalid protocol", () => {
    expect(() =>
      PortSchema.parse({ host: 8080, container: 80, protocol: "sctp" }),
    ).toThrow();
  });
});

describe("VolumeSchema", () => {
  it("validates a valid bind mount", () => {
    const volume = {
      type: "bind" as const,
      source: "/host/path",
      target: "/container/path",
    };
    expect(() => VolumeSchema.parse(volume)).not.toThrow();
  });

  it("validates a valid named volume", () => {
    const volume = {
      type: "volume" as const,
      source: "my-volume",
      target: "/data",
    };
    expect(() => VolumeSchema.parse(volume)).not.toThrow();
  });

  it("validates read-only flag", () => {
    const volume = {
      type: "bind" as const,
      source: "/host",
      target: "/container",
      readOnly: true,
    };
    const result = VolumeSchema.parse(volume);
    expect(result.readOnly).toBe(true);
  });

  it("defaults readOnly to false when omitted", () => {
    const volume = {
      type: "bind" as const,
      source: "/host",
      target: "/container",
    };
    const result = VolumeSchema.parse(volume);
    expect(result.readOnly).toBe(false);
  });

  it("rejects empty source or target", () => {
    expect(() =>
      VolumeSchema.parse({ type: "bind", source: "", target: "/container" }),
    ).toThrow();
    expect(() =>
      VolumeSchema.parse({ type: "bind", source: "/host", target: "" }),
    ).toThrow();
  });

  it("rejects invalid type", () => {
    expect(() =>
      VolumeSchema.parse({ type: "tmpfs", source: "/host", target: "/data" }),
    ).toThrow();
  });
});

describe("HostSchema", () => {
  it("validates a valid host", () => {
    const host = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "nas",
    };
    expect(() => HostSchema.parse(host)).not.toThrow();
  });

  it("validates host with optional notes", () => {
    const host = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "pi-4",
      notes: "Raspberry Pi 4 Model B",
    };
    expect(() => HostSchema.parse(host)).not.toThrow();
  });

  it("rejects invalid UUID", () => {
    expect(() => HostSchema.parse({ id: "not-a-uuid", name: "nas" })).toThrow();
  });

  it("rejects empty name", () => {
    expect(() =>
      HostSchema.parse({ id: "123e4567-e89b-12d3-a456-426614174000", name: "" }),
    ).toThrow();
  });
});

describe("NetSchema", () => {
  it("validates a basic network", () => {
    const network = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "frontend",
    };
    expect(() => NetSchema.parse(network)).not.toThrow();
  });

  it("validates network with driver and subnet", () => {
    const network = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "backend",
      driver: "bridge",
      subnetCidr: "172.20.0.0/16",
    };
    expect(() => NetSchema.parse(network)).not.toThrow();
  });

  it("rejects invalid UUID", () => {
    expect(() => NetSchema.parse({ id: "invalid", name: "net" })).toThrow();
  });

  it("rejects empty name", () => {
    expect(() =>
      NetSchema.parse({ id: "123e4567-e89b-12d3-a456-426614174000", name: "" }),
    ).toThrow();
  });
});

describe("ServiceSchema", () => {
  it("validates a minimal service", () => {
    const service = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "nginx",
      image: "nginx:latest",
    };
    expect(() => ServiceSchema.parse(service)).not.toThrow();
  });

  it("validates a service with all optional fields", () => {
    const service = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "app",
      image: "myapp:1.0",
      command: ["npm", "start"],
      env: { NODE_ENV: "production", PORT: "3000" },
      ports: [{ host: 3000, container: 3000 }],
      volumes: [{ type: "bind" as const, source: "/data", target: "/app/data" }],
      networks: ["223e4567-e89b-12d3-a456-426614174001"],
      dependsOn: ["323e4567-e89b-12d3-a456-426614174002"],
      restart: "unless-stopped" as const,
      labels: { "traefik.enable": "true" },
      hostId: "423e4567-e89b-12d3-a456-426614174003",
    };
    expect(() => ServiceSchema.parse(service)).not.toThrow();
  });

  it("rejects invalid restart policy", () => {
    expect(() =>
      ServiceSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "test",
        image: "test:latest",
        restart: "invalid",
      }),
    ).toThrow();
  });

  it("rejects empty name or image", () => {
    expect(() =>
      ServiceSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "",
        image: "test:latest",
      }),
    ).toThrow();
    expect(() =>
      ServiceSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "test",
        image: "",
      }),
    ).toThrow();
  });

  it("rejects non-UUID references", () => {
    expect(() =>
      ServiceSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "test",
        image: "test:latest",
        networks: ["not-a-uuid"],
      }),
    ).toThrow();
    expect(() =>
      ServiceSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "test",
        image: "test:latest",
        dependsOn: ["not-a-uuid"],
      }),
    ).toThrow();
    expect(() =>
      ServiceSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "test",
        image: "test:latest",
        hostId: "not-a-uuid",
      }),
    ).toThrow();
  });
});

describe("BlueprintMetaSchema", () => {
  it("validates valid metadata", () => {
    const meta = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "My Stack",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-02T12:30:45Z",
    };
    expect(() => BlueprintMetaSchema.parse(meta)).not.toThrow();
  });

  it("rejects invalid datetime strings", () => {
    expect(() =>
      BlueprintMetaSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Stack",
        createdAt: "not-a-date",
        updatedAt: "2025-01-02T12:30:45Z",
      }),
    ).toThrow();
  });

  it("rejects empty name", () => {
    expect(() =>
      BlueprintMetaSchema.parse({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-02T12:30:45Z",
      }),
    ).toThrow();
  });
});

describe("BlueprintSchema", () => {
  it("validates a complete valid blueprint", () => {
    const blueprint: Blueprint = {
      version: "v0",
      meta: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Jellyfin Stack",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      hosts: [
        {
          id: "223e4567-e89b-12d3-a456-426614174001",
          name: "nas",
          notes: "Primary storage server",
        },
      ],
      networks: [
        {
          id: "323e4567-e89b-12d3-a456-426614174002",
          name: "media",
          driver: "bridge",
        },
      ],
      services: [
        {
          id: "423e4567-e89b-12d3-a456-426614174003",
          name: "jellyfin",
          image: "jellyfin/jellyfin:latest",
          ports: [{ host: 8096, container: 8096 }],
          volumes: [
            {
              type: "bind",
              source: "/mnt/media",
              target: "/media",
              readOnly: true,
            },
          ],
          networks: ["323e4567-e89b-12d3-a456-426614174002"],
          restart: "unless-stopped",
          hostId: "223e4567-e89b-12d3-a456-426614174001",
        },
      ],
    };

    expect(() => BlueprintSchema.parse(blueprint)).not.toThrow();
  });

  it("validates a minimal single-host blueprint", () => {
    const blueprint = {
      version: "v0",
      meta: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Simple Stack",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      hosts: [],
      networks: [],
      services: [
        {
          id: "223e4567-e89b-12d3-a456-426614174001",
          name: "nginx",
          image: "nginx:latest",
        },
      ],
    };

    expect(() => BlueprintSchema.parse(blueprint)).not.toThrow();
  });

  it("rejects invalid version", () => {
    expect(() =>
      BlueprintSchema.parse({
        version: "v1",
        meta: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Stack",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
        hosts: [],
        networks: [],
        services: [],
      }),
    ).toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() =>
      BlueprintSchema.parse({
        version: "v0",
        meta: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Stack",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
        hosts: [],
        networks: [],
      }),
    ).toThrow();
  });

  it("validates multi-service blueprint with dependencies", () => {
    const blueprint = {
      version: "v0",
      meta: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Multi-Service Stack",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      hosts: [],
      networks: [
        {
          id: "223e4567-e89b-12d3-a456-426614174001",
          name: "backend",
        },
      ],
      services: [
        {
          id: "323e4567-e89b-12d3-a456-426614174002",
          name: "db",
          image: "postgres:15",
          networks: ["223e4567-e89b-12d3-a456-426614174001"],
        },
        {
          id: "423e4567-e89b-12d3-a456-426614174003",
          name: "app",
          image: "myapp:latest",
          networks: ["223e4567-e89b-12d3-a456-426614174001"],
          dependsOn: ["323e4567-e89b-12d3-a456-426614174002"],
        },
      ],
    };

    expect(() => BlueprintSchema.parse(blueprint)).not.toThrow();
  });

  it("provides clear error messages for invalid data", () => {
    try {
      BlueprintSchema.parse({
        version: "v0",
        meta: {
          id: "not-a-uuid",
          name: "",
          createdAt: "invalid-date",
          updatedAt: "2025-01-01T00:00:00Z",
        },
        hosts: [],
        networks: [],
        services: [],
      });
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
