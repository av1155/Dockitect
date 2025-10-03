import { describe, it, expect } from "vitest";
import { BlueprintSchema } from "../src/blueprint";

describe("BlueprintSchema", () => {
    it("validates a valid blueprint", () => {
        const blueprint = {
            version: "1.0",
            name: "test-stack",
            description: "A test stack",
            services: {
                web: {
                    image: "nginx:latest",
                    ports: ["80:80"],
                    environment: { ENV: "prod" },
                },
            },
        };

        expect(() => BlueprintSchema.parse(blueprint)).not.toThrow();
    });

    it("rejects invalid blueprint", () => {
        const invalid = {
            version: "1.0",
            // missing required 'name' field
            services: {},
        };

        expect(() => BlueprintSchema.parse(invalid)).toThrow();
    });
});
