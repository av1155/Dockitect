import { z } from "zod";

export const BlueprintSchema = z.object({
    version: z.string(),
    name: z.string(),
    description: z.string().optional(),
    services: z.record(
        z.object({
            image: z.string(),
            ports: z.array(z.string()).optional(),
            environment: z.record(z.string()).optional(),
            volumes: z.array(z.string()).optional(),
        }),
    ),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;
