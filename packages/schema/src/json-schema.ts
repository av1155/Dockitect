import { zodToJsonSchema } from "zod-to-json-schema";
import { BlueprintSchema } from "./blueprint";

export function getBlueprintJsonSchema() {
  return zodToJsonSchema(BlueprintSchema, {
    name: "Blueprint",
    $refStrategy: "none",
  });
}
