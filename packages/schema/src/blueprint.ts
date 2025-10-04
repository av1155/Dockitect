import { z } from "zod";

export const PortSchema = z.object({
  host: z.number().int().min(1).max(65535),
  container: z.number().int().min(1).max(65535),
  protocol: z.enum(["tcp", "udp"]).default("tcp"),
});

export const VolumeSchema = z.object({
  type: z.enum(["bind", "volume"]),
  source: z.string().min(1),
  target: z.string().min(1),
  readOnly: z.boolean().default(false),
});

export const HostSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  notes: z.string().optional(),
});

export const NetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  driver: z.string().optional(),
  subnetCidr: z.string().optional(),
});

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  image: z.string().min(1),
  command: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
  ports: z.array(PortSchema).optional(),
  volumes: z.array(VolumeSchema).optional(),
  networks: z.array(z.string().uuid()).optional(),
  dependsOn: z.array(z.string().uuid()).optional(),
  restart: z.enum(["no", "always", "unless-stopped", "on-failure"]).optional(),
  labels: z.record(z.string(), z.string()).optional(),
  hostId: z.string().uuid().optional(),
});

export const BlueprintMetaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BlueprintSchema = z.object({
  version: z.literal("v0"),
  meta: BlueprintMetaSchema,
  hosts: z.array(HostSchema),
  networks: z.array(NetSchema),
  services: z.array(ServiceSchema),
});

export type Port = z.infer<typeof PortSchema>;
export type Volume = z.infer<typeof VolumeSchema>;
export type Host = z.infer<typeof HostSchema>;
export type Net = z.infer<typeof NetSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type BlueprintMeta = z.infer<typeof BlueprintMetaSchema>;
export type Blueprint = z.infer<typeof BlueprintSchema>;
