import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Canvas Rendering", () => {
  test("should render service node after uploading compose file", async ({
    page,
  }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    const fixturePath = join(
      __dirname,
      "../../..",
      "packages/importer/__fixtures__/jellyfin.yml",
    );

    await fileInput.setInputFiles(fixturePath);

    await expect(page.getByTestId("upload-success")).toBeVisible();

    await page.waitForSelector('[aria-label*="Service card"]', {
      timeout: 5000,
    });

    const serviceNode = page.locator('[aria-label*="Service card"]').first();
    await expect(serviceNode).toBeVisible();

    await expect(serviceNode).toContainText("jellyfin");

    const canvasControls = page.locator(".react-flow__controls");
    await expect(canvasControls).toBeVisible();
  });

  test("should render multiple service nodes from multi-service compose", async ({
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

    await page.waitForSelector('[aria-label*="Service card"]', {
      timeout: 5000,
    });

    const serviceNodes = page.locator('[aria-label*="Service card"]');
    const serviceCount = await serviceNodes.count();
    expect(serviceCount).toBe(3);
  });

  test("should render network nodes when compose has networks", async ({
    page,
  }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    const fixturePath = join(
      __dirname,
      "../../..",
      "packages/importer/__fixtures__/networks.yml",
    );

    await fileInput.setInputFiles(fixturePath);

    await expect(page.getByTestId("upload-success")).toBeVisible();

    await page.waitForSelector('[aria-label*="Network card"]', {
      timeout: 5000,
    });

    const networkNodes = page.locator('[aria-label*="Network card"]');
    const networkCount = await networkNodes.count();

    expect(networkCount).toBeGreaterThanOrEqual(1);

    await expect(networkNodes.first()).toContainText("frontend");
  });

  test("should not render nodes when no file is uploaded", async ({ page }) => {
    await page.goto("/");

    const serviceNodes = page.locator('[aria-label*="Service card"]');
    const serviceCount = await serviceNodes.count();

    expect(serviceCount).toBe(0);
  });
});
