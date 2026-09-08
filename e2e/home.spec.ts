import { test, expect } from "@playwright/test";

test("home page shows PubliQ branding", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Drop & Publish" })).toBeVisible();
  await expect(page.getByLabel("PubliQ")).toBeVisible();
});
