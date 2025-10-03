import { describe, it, expect } from "vitest";
import { exportDockerCompose } from "../src/compose-exporter";

describe("exportDockerCompose", () => {
    it("throws not implemented error", () => {
        const blueprint = {
            version: "1.0",
            name: "test",
            services: {},
        };
        expect(() => exportDockerCompose(blueprint)).toThrow("Not implemented");
    });
});
