import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("File Upload", () => {
  test("should upload and parse a simple compose file", async ({ page }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    const fixturePath = join(
      __dirname,
      "../../..",
      "packages/importer/__fixtures__/simple.yml",
    );

    await fileInput.setInputFiles(fixturePath);

    await expect(page.getByTestId("upload-success")).toBeVisible();
    await expect(page.getByTestId("upload-success")).toContainText(
      "Successfully imported 1 service from simple.yml",
    );
  });

  test("should upload and parse a multi-service compose file", async ({
    page,
  }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    const fixturePath = join(
      __dirname,
      "../../..",
      "packages/importer/__fixtures__/multi-service.yml",
    );

    await fileInput.setInputFiles(fixturePath);

    await expect(page.getByTestId("upload-success")).toBeVisible();
    await expect(page.getByTestId("upload-success")).toContainText(
      "Successfully imported 3 services from multi-service.yml",
    );
  });

  test("should show error for invalid YAML", async ({ page }) => {
    await page.goto("/");

    const fileContent = "invalid: yaml: content:";
    const buffer = Buffer.from(fileContent);

    await page.locator('input[type="file"]').setInputFiles({
      name: "invalid.yml",
      mimeType: "text/yaml",
      buffer,
    });

    await expect(page.getByTestId("upload-error")).toBeVisible();
  });

  test("should show error for missing required fields", async ({ page }) => {
    await page.goto("/");

    const fileContent = `
services:
  myservice:
    command: echo "no image"
`;
    const buffer = Buffer.from(fileContent);

    await page.locator('input[type="file"]').setInputFiles({
      name: "missing-image.yml",
      mimeType: "text/yaml",
      buffer,
    });

    await expect(page.getByTestId("upload-error")).toBeVisible();
    await expect(page.getByTestId("upload-error")).toContainText("image");
  });
});
