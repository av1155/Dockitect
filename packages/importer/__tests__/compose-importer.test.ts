import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { importDockerCompose } from "../src/compose-importer";
import type { Blueprint } from "@dockitect/schema";

function loadFixture(name: string): string {
  return readFileSync(
    join(__dirname, "..", "__fixtures__", `${name}.yml`),
    "utf-8",
  );
}

describe("importDockerCompose", () => {
  describe("simple compose file", () => {
    it("parses single service with ports", () => {
      const yaml = loadFixture("simple");
      const blueprint = importDockerCompose(yaml);

      expect(blueprint.version).toBe("v0");
      expect(blueprint.services).toHaveLength(1);

      const service = blueprint.services[0];
      expect(service.name).toBe("nginx");
      expect(service.image).toBe("nginx:alpine");
      expect(service.ports).toHaveLength(1);
      expect(service.ports?.[0]).toMatchObject({
        host: 80,
        container: 80,
        protocol: "tcp",
      });
      expect(service.restart).toBe("unless-stopped");
    });

    it("generates valid UUIDs for all entities", () => {
      const yaml = loadFixture("simple");
      const blueprint = importDockerCompose(yaml);

      expect(blueprint.meta.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(blueprint.services[0].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe("multi-service compose file", () => {
    it("parses multiple services with dependencies", () => {
      const yaml = loadFixture("multi-service");
      const blueprint = importDockerCompose(yaml);

      expect(blueprint.services).toHaveLength(3);

      const serviceNames = blueprint.services.map((s) => s.name);
      expect(serviceNames).toContain("db");
      expect(serviceNames).toContain("redis");
      expect(serviceNames).toContain("app");
    });

    it("preserves service dependencies", () => {
      const yaml = loadFixture("multi-service");
      const blueprint = importDockerCompose(yaml);

      const app = blueprint.services.find((s) => s.name === "app");
      const db = blueprint.services.find((s) => s.name === "db");
      const redis = blueprint.services.find((s) => s.name === "redis");

      expect(app?.dependsOn).toHaveLength(2);
      expect(app?.dependsOn).toContain(db?.id);
      expect(app?.dependsOn).toContain(redis?.id);
    });

    it("parses environment variables", () => {
      const yaml = loadFixture("multi-service");
      const blueprint = importDockerCompose(yaml);

      const db = blueprint.services.find((s) => s.name === "db");
      expect(db?.env).toEqual({
        POSTGRES_PASSWORD: "secret",
        POSTGRES_DB: "myapp",
      });

      const app = blueprint.services.find((s) => s.name === "app");
      expect(app?.env).toEqual({
        DATABASE_URL: "postgresql://postgres:secret@db:5432/myapp",
        REDIS_URL: "redis://redis:6379",
      });
    });

    it("parses commands", () => {
      const yaml = loadFixture("multi-service");
      const blueprint = importDockerCompose(yaml);

      const app = blueprint.services.find((s) => s.name === "app");
      expect(app?.command).toEqual(["npm", "start"]);
    });
  });

  describe("networks compose file", () => {
    it("parses custom networks", () => {
      const yaml = loadFixture("networks");
      const blueprint = importDockerCompose(yaml);

      expect(blueprint.networks).toHaveLength(2);

      const frontendNet = blueprint.networks.find((n) => n.name === "frontend");
      const backendNet = blueprint.networks.find((n) => n.name === "backend");

      expect(frontendNet?.driver).toBe("bridge");
      expect(backendNet?.driver).toBe("bridge");
      expect(backendNet?.subnetCidr).toBe("172.20.0.0/16");
    });

    it("connects services to networks via IDs", () => {
      const yaml = loadFixture("networks");
      const blueprint = importDockerCompose(yaml);

      const web = blueprint.services.find((s) => s.name === "web");
      const api = blueprint.services.find((s) => s.name === "api");
      const db = blueprint.services.find((s) => s.name === "db");

      const frontendId = blueprint.networks.find((n) => n.name === "frontend")?.id;
      const backendId = blueprint.networks.find((n) => n.name === "backend")?.id;

      expect(web?.networks).toEqual([frontendId]);
      expect(api?.networks).toEqual([frontendId, backendId]);
      expect(db?.networks).toEqual([backendId]);
    });
  });

  describe("volumes compose file", () => {
    it("parses bind mounts", () => {
      const yaml = loadFixture("volumes");
      const blueprint = importDockerCompose(yaml);

      const app = blueprint.services[0];
      const bindMounts = app.volumes?.filter((v) => v.type === "bind");

      expect(bindMounts).toHaveLength(2);
      expect(bindMounts?.[0]).toMatchObject({
        type: "bind",
        source: "./config",
        target: "/app/config",
        readOnly: true,
      });
      expect(bindMounts?.[1]).toMatchObject({
        type: "bind",
        source: "/var/log/app",
        target: "/var/log",
        readOnly: true,
      });
    });

    it("parses named volumes", () => {
      const yaml = loadFixture("volumes");
      const blueprint = importDockerCompose(yaml);

      const app = blueprint.services[0];
      const namedVolumes = app.volumes?.filter((v) => v.type === "volume");

      expect(namedVolumes).toHaveLength(2);
      expect(namedVolumes?.[0]).toMatchObject({
        type: "volume",
        source: "app-data",
        target: "/data",
        readOnly: false,
      });
    });
  });

  describe("ports compose file", () => {
    it("parses TCP ports", () => {
      const yaml = loadFixture("ports");
      const blueprint = importDockerCompose(yaml);

      const web = blueprint.services.find((s) => s.name === "web");
      expect(web?.ports).toHaveLength(2);
      expect(web?.ports?.[0]).toMatchObject({
        host: 80,
        container: 80,
        protocol: "tcp",
      });
      expect(web?.ports?.[1]).toMatchObject({
        host: 443,
        container: 443,
        protocol: "tcp",
      });
    });

    it("parses UDP ports", () => {
      const yaml = loadFixture("ports");
      const blueprint = importDockerCompose(yaml);

      const dns = blueprint.services.find((s) => s.name === "dns");
      const udpPorts = dns?.ports?.filter((p) => p.protocol === "udp");

      expect(udpPorts).toHaveLength(1);
      expect(udpPorts?.[0]).toMatchObject({
        host: 53,
        container: 53,
        protocol: "udp",
      });
    });

    it("parses mixed TCP/UDP ports", () => {
      const yaml = loadFixture("ports");
      const blueprint = importDockerCompose(yaml);

      const dns = blueprint.services.find((s) => s.name === "dns");
      expect(dns?.ports).toHaveLength(3);

      const tcpPorts = dns?.ports?.filter((p) => p.protocol === "tcp");
      const udpPorts = dns?.ports?.filter((p) => p.protocol === "udp");

      expect(tcpPorts).toHaveLength(2);
      expect(udpPorts).toHaveLength(1);
    });
  });

  describe("jellyfin fixture (real-world example)", () => {
    it("parses complete Jellyfin stack", () => {
      const yaml = loadFixture("jellyfin");
      const blueprint = importDockerCompose(yaml);

      expect(blueprint.services).toHaveLength(1);

      const jellyfin = blueprint.services[0];
      expect(jellyfin.name).toBe("jellyfin");
      expect(jellyfin.image).toBe("jellyfin/jellyfin:latest");
      expect(jellyfin.restart).toBe("unless-stopped");
    });

    it("parses environment array format", () => {
      const yaml = loadFixture("jellyfin");
      const blueprint = importDockerCompose(yaml);

      const jellyfin = blueprint.services[0];
      expect(jellyfin.env).toEqual({
        TZ: "America/New_York",
      });
    });

    it("parses labels", () => {
      const yaml = loadFixture("jellyfin");
      const blueprint = importDockerCompose(yaml);

      const jellyfin = blueprint.services[0];
      expect(jellyfin.labels).toEqual({
        "traefik.enable": "true",
        "traefik.http.routers.jellyfin.rule": "Host(`jellyfin.local`)",
      });
    });

    it("parses multiple port mappings with protocols", () => {
      const yaml = loadFixture("jellyfin");
      const blueprint = importDockerCompose(yaml);

      const jellyfin = blueprint.services[0];
      expect(jellyfin.ports).toHaveLength(4);

      const tcpPorts = jellyfin.ports?.filter((p) => p.protocol === "tcp");
      const udpPorts = jellyfin.ports?.filter((p) => p.protocol === "udp");

      expect(tcpPorts).toHaveLength(2);
      expect(udpPorts).toHaveLength(2);
    });
  });

  describe("error handling", () => {
    it("throws on empty services", () => {
      const yaml = `version: "3.8"\nservices: {}`;
      expect(() => importDockerCompose(yaml)).toThrow(
        "Compose file must contain at least one service",
      );
    });

    it("throws on service without image", () => {
      const yaml = `
version: "3.8"
services:
  app:
    command: echo hello
`;
      expect(() => importDockerCompose(yaml)).toThrow(
        'Service "app" must specify an image',
      );
    });

    it("throws on invalid port format", () => {
      const yaml = `
version: "3.8"
services:
  app:
    image: nginx
    ports:
      - "invalid"
`;
      expect(() => importDockerCompose(yaml)).toThrow("Invalid port definition");
    });

    it("throws on undefined network reference", () => {
      const yaml = `
version: "3.8"
services:
  app:
    image: nginx
    networks:
      - nonexistent
`;
      expect(() => importDockerCompose(yaml)).toThrow(
        'Network "nonexistent" not defined',
      );
    });

    it("throws on invalid YAML", () => {
      const yaml = "this is not: valid: yaml: :::";
      expect(() => importDockerCompose(yaml)).toThrow();
    });
  });

  describe("blueprint validation", () => {
    it("returns valid Blueprint that passes schema validation", () => {
      const yaml = loadFixture("simple");
      const blueprint = importDockerCompose(yaml);

      expect(blueprint.version).toBe("v0");
      expect(blueprint.meta.id).toBeTruthy();
      expect(blueprint.meta.name).toBeTruthy();
      expect(blueprint.meta.createdAt).toBeTruthy();
      expect(blueprint.meta.updatedAt).toBeTruthy();
      expect(Array.isArray(blueprint.hosts)).toBe(true);
      expect(Array.isArray(blueprint.networks)).toBe(true);
      expect(Array.isArray(blueprint.services)).toBe(true);
    });
  });
});
