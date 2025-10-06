import { test, expect } from "@playwright/test";
import { join } from "path";

test.describe("Node Interaction", () => {
  test("should open details panel when clicking a service node", async ({
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

    await serviceNode.click();

    const detailsPanel = page.locator('[role="dialog"]');
    await expect(detailsPanel).toBeVisible({ timeout: 3000 });

    await expect(detailsPanel).toContainText("jellyfin");

    await expect(detailsPanel).toContainText("Image");
  });

  test("should close details panel when pressing Escape", async ({ page }) => {
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
    await serviceNode.click();

    const detailsPanel = page.locator('[role="dialog"]');
    await expect(detailsPanel).toBeVisible({ timeout: 3000 });

    await page.keyboard.press("Escape");

    await expect(detailsPanel).not.toBeVisible({ timeout: 3000 });
  });

  test("should open details panel for network node", async ({ page }) => {
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

    const networkNode = page.locator('[aria-label*="Network card"]').first();
    await expect(networkNode).toBeVisible();

    await networkNode.click();

    const detailsPanel = page.locator('[role="dialog"]');
    await expect(detailsPanel).toBeVisible({ timeout: 3000 });

    await expect(detailsPanel).toContainText("Network Details");
  });

  test("should show canvas controls (Fit View, Export PNG, Auto-layout)", async ({
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

    const fitViewButton = page.locator('[aria-label="Fit view to canvas"]');
    await expect(fitViewButton).toBeVisible();

    const exportButton = page.locator('[aria-label="Export canvas as PNG"]');
    await expect(exportButton).toBeVisible();

    const autoLayoutButton = page.locator('[aria-label="Re-apply auto-layout"]');
    await expect(autoLayoutButton).toBeVisible();
  });
});