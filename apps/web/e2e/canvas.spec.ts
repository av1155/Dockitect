import { test, expect } from "@playwright/test";

test.describe("Canvas", () => {
  test("should render React Flow canvas", async ({ page }) => {
    await page.goto("/");

    const canvas = page.locator(".react-flow");
    await expect(canvas).toBeVisible();

    const controls = page.locator(".react-flow__controls");
    await expect(controls).toBeVisible();

    const minimap = page.locator(".react-flow__minimap");
    await expect(minimap).toBeVisible();

    const background = page.locator(".react-flow__background");
    await expect(background).toBeVisible();
  });

  test("should have empty canvas on initial load", async ({ page }) => {
    await page.goto("/");

    const nodes = page.locator(".react-flow__node");
    await expect(nodes).toHaveCount(0);

    const edges = page.locator(".react-flow__edge");
    await expect(edges).toHaveCount(0);
  });
});
