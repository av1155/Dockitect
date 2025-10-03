import { describe, it, expect } from "vitest";
import { importDockerCompose } from "../src/compose-importer";

describe("importDockerCompose", () => {
    it("throws not implemented error", () => {
        expect(() => importDockerCompose('version: "3"')).toThrow("Not implemented");
    });
});
