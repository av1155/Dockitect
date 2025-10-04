import { parse } from "yaml";
import {
  Blueprint,
  BlueprintSchema,
  type Service,
  type Net,
  type Port,
  type Volume,
} from "@dockitect/schema";
// Cross-platform UUID generator (Node + Browser)
function generateUUID(): string {
  const g: any = (typeof globalThis !== "undefined" ? globalThis : {}) as any;
  if (g.crypto && typeof g.crypto.randomUUID === "function") {
    return g.crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface ComposeService {
  image?: string;
  command?: string | string[];
  environment?: Record<string, string> | string[];
  ports?: string[];
  volumes?: string[];
  networks?: string[] | Record<string, unknown>;
  depends_on?: string[] | Record<string, unknown>;
  restart?: string;
  labels?: Record<string, string> | string[];
}

interface ComposeNetwork {
  driver?: string;
  ipam?: {
    config?: Array<{ subnet?: string }>;
  };
}

interface ComposeFile {
  version?: string;
  services?: Record<string, ComposeService>;
  networks?: Record<string, ComposeNetwork>;
  volumes?: Record<string, unknown>;
}

export function importDockerCompose(composeYaml: string): Blueprint {
  const compose: ComposeFile = parse(composeYaml);

  if (!compose.services || Object.keys(compose.services).length === 0) {
    throw new Error("Compose file must contain at least one service");
  }

  const now = new Date().toISOString();
  const networkMap = new Map<string, string>();
  const serviceMap = new Map<string, string>();

  const networks: Net[] = [];
  if (compose.networks) {
    for (const [name, config] of Object.entries(compose.networks)) {
      const id = generateUUID();
      networkMap.set(name, id);

      const subnet = config?.ipam?.config?.[0]?.subnet;

      networks.push({
        id,
        name,
        driver: config?.driver,
        subnetCidr: subnet,
      });
    }
  }

  const services: Service[] = [];
  for (const [name, config] of Object.entries(compose.services)) {
    const id = generateUUID();
    serviceMap.set(name, id);

    if (!config.image) {
      throw new Error(`Service "${name}" must specify an image`);
    }

    const service: Service = {
      id,
      name,
      image: config.image,
    };

    if (config.command) {
      service.command = Array.isArray(config.command)
        ? config.command
        : config.command.split(" ");
    }

    if (config.environment) {
      service.env = normalizeEnvironment(config.environment);
    }

    if (config.ports) {
      service.ports = parsePorts(config.ports);
    }

    if (config.volumes) {
      service.volumes = parseVolumes(config.volumes);
    }

    if (config.networks) {
      service.networks = parseNetworks(config.networks, networkMap);
    }

    if (config.restart) {
      const restart = config.restart as
        | "no"
        | "always"
        | "unless-stopped"
        | "on-failure";
      if (
        ["no", "always", "unless-stopped", "on-failure"].includes(restart)
      ) {
        service.restart = restart;
      }
    }

    if (config.labels) {
      service.labels = normalizeLabels(config.labels);
    }

    services.push(service);
  }

  for (const [name, config] of Object.entries(compose.services)) {
    if (config.depends_on) {
      const serviceId = serviceMap.get(name)!;
      const service = services.find((s) => s.id === serviceId)!;
      service.dependsOn = parseDependsOn(config.depends_on, serviceMap);
    }
  }

  const blueprint: Blueprint = {
    version: "v0",
    meta: {
      id: generateUUID(),
      name: "Imported Stack",
      createdAt: now,
      updatedAt: now,
    },
    hosts: [],
    networks,
    services,
  };

  return BlueprintSchema.parse(blueprint);
}

function normalizeEnvironment(
  env: Record<string, string> | string[],
): Record<string, string> {
  if (Array.isArray(env)) {
    const result: Record<string, string> = {};
    for (const item of env) {
      const [key, ...valueParts] = item.split("=");
      if (key) {
        result[key] = valueParts.join("=");
      }
    }
    return result;
  }
  return env;
}

function normalizeLabels(
  labels: Record<string, string> | string[],
): Record<string, string> {
  if (Array.isArray(labels)) {
    const result: Record<string, string> = {};
    for (const item of labels) {
      const [key, ...valueParts] = item.split("=");
      if (key) {
        result[key] = valueParts.join("=");
      }
    }
    return result;
  }
  return labels;
}

function parsePorts(ports: string[]): Port[] {
  return ports.map((portDef) => {
    const match = portDef.match(/^(\d+):(\d+)(?:\/(tcp|udp))?$/);
    if (!match) {
      throw new Error(`Invalid port definition: ${portDef}`);
    }

    const [, hostPort, containerPort, protocol] = match;
    return {
      host: Number.parseInt(hostPort, 10),
      container: Number.parseInt(containerPort, 10),
      protocol: (protocol as "tcp" | "udp") || "tcp",
    };
  });
}

function parseVolumes(volumes: string[]): Volume[] {
  return volumes.map((volumeDef) => {
    const parts = volumeDef.split(":");
    if (parts.length < 2) {
      throw new Error(`Invalid volume definition: ${volumeDef}`);
    }

    const [source, target, options] = parts;
    const readOnly = options?.includes("ro") || false;

    const type = source.startsWith("/") || source.startsWith(".") ? "bind" : "volume";

    return {
      type,
      source,
      target,
      readOnly,
    };
  });
}

function parseNetworks(
  networks: string[] | Record<string, unknown>,
  networkMap: Map<string, string>,
): string[] {
  const networkNames = Array.isArray(networks) ? networks : Object.keys(networks);

  return networkNames.map((name) => {
    const id = networkMap.get(name);
    if (!id) {
      throw new Error(`Network "${name}" not defined in networks section`);
    }
    return id;
  });
}

function parseDependsOn(
  dependsOn: string[] | Record<string, unknown>,
  serviceMap: Map<string, string>,
): string[] {
  const serviceNames = Array.isArray(dependsOn) ? dependsOn : Object.keys(dependsOn);

  return serviceNames.map((name) => {
    const id = serviceMap.get(name);
    if (!id) {
      throw new Error(`Dependent service "${name}" not found`);
    }
    return id;
  });
}
