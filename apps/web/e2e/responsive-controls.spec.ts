import { test, expect } from "@playwright/test";
import { join } from "path";

// Ensures the top-right control bar remains visible and adapts on small widths
// and that fit-on-resize keeps nodes in view

test.describe("Responsive Controls & Resize Fit", () => {
  test("controls remain visible and wrap at narrow width", async ({ page }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 360, height: 740 });

    const fileInput = page.locator('input[type="file"]');
    const fixturePath = join(
      __dirname,
      "../../..",
      "packages/importer/__fixtures__/jellyfin.yml",
    );

    await fileInput.setInputFiles(fixturePath);

    await expect(page.getByTestId("upload-success")).toBeVisible();

    const fitViewButton = page.locator('[aria-label="Fit view to canvas"]');
    const exportButton = page.locator('[aria-label="Export canvas as PNG"]');
    const autoLayoutButton = page.locator('[aria-label="Re-apply auto-layout"]');

    await expect(fitViewButton).toBeVisible();
    await expect(exportButton).toBeVisible();
    await expect(autoLayoutButton).toBeVisible();
  });

  test("fitView triggers on resize and keeps nodes visible", async ({ page }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    const fixturePath = join(
      __dirname,
      "../../..",
      "packages/importer/__fixtures__/multi-service.yml",
    );

    await fileInput.setInputFiles(fixturePath);
    await expect(page.getByTestId("upload-success")).toBeVisible();

    // A representative node should be visible
    const firstService = page.locator('[aria-label*="Service card"]').first();
    await expect(firstService).toBeVisible();

    // Resize to a smaller viewport to force re-fit
    await page.setViewportSize({ width: 480, height: 640 });

    // After debounce + animation, node should still be visible
    await page.waitForTimeout(600);
    await expect(firstService).toBeVisible();

    // Resize back to larger
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(600);
    await expect(firstService).toBeVisible();
  });
});
