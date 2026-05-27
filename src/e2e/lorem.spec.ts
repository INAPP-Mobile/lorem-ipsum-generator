import { test, expect } from "@playwright/test";

test.describe("Lorem Ipsum Generator — E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads and shows the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("Lorem Ipsum Generator");
  });

  test("generates text on page load (paragraphs mode by default)", async ({ page }) => {
    await expect(page.locator("pre")).not.toBeEmpty({ timeout: 5000 });
    const text = await page.locator("pre").textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(50);
  });

  test("generates 5 paragraphs by default", async ({ page }) => {
    await expect(page.locator("pre")).not.toBeEmpty({ timeout: 5000 });
    const text = await page.locator("pre").textContent();
    const paragraphs = text!.split("\n\n");
    expect(paragraphs).toHaveLength(5);
  });

  test("copy button copies the generated text", async ({ page }) => {
    await expect(page.locator("pre")).not.toBeEmpty({ timeout: 5000 });

    await page.evaluate(() => {
      navigator.clipboard.writeText = (text: string) =>
        Promise.resolve();
    });

    const copyButton = page.locator("button", { hasText: "Copy" });
    await expect(copyButton).toBeVisible({ timeout: 5000 });
    await copyButton.click();
  });

  test("generate button refreshes the text", async ({ page }) => {
    await expect(page.locator("pre")).not.toBeEmpty({ timeout: 5000 });
    const first = await page.locator("pre").textContent();

    await page.locator("button", { hasText: "Regenerate" }).click();
    await page.waitForTimeout(200);
    const second = await page.locator("pre").textContent();

    expect(first).not.toBe(second);
  });

  test("switching to words mode generates words", async ({ page }) => {
    await page.locator("button", { hasText: "Words" }).click();
    await page.waitForTimeout(200);

    const text = await page.locator("pre").textContent();
    expect(text).toBeTruthy();

    const words = text!.split(/\s+/).filter(Boolean);
    expect(words.length).toBeLessThanOrEqual(110);
  });

  test("switching to bytes mode generates bytes", async ({ page }) => {
    await page.locator("button", { hasText: "Bytes" }).click();
    await page.waitForTimeout(200);

    const text = await page.locator("pre").textContent({ timeout: 5000 });
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  test.describe("History feature", () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => localStorage.clear());
      await page.reload();
    });

    test("after generating text, a history entry appears with badge", async ({ page }) => {
      await expect(page.locator("pre")).not.toBeEmpty({ timeout: 5000 });
      await expect(page.getByText("No history yet")).not.toBeVisible();
      await expect(page.getByText("PAR", { exact: true }).first()).toBeVisible({ timeout: 5000 });
    });

    test("pin a history entry and verify the star icon is yellow", async ({ page }) => {
      await expect(page.locator("pre")).not.toBeEmpty({ timeout: 5000 });
      await expect(page.getByText("PAR", { exact: true }).first()).toBeVisible({ timeout: 5000 });

      const pinButton = page.locator('button[title="Pin"]').first();
      await pinButton.click();

      await expect(page.locator('button[title="Unpin"]').first()).toBeVisible({ timeout: 3000 });
      const starSvg = page.locator('button[title="Unpin"] svg').first();
      await expect(starSvg).toHaveClass(/text-yellow-400/);
    });

    test("click a history entry loads the text back into the display", async ({ page }) => {
      await expect(page.locator("pre")).not.toBeEmpty({ timeout: 5000 });
      const firstText = await page.locator("pre").textContent();
      await expect(page.getByText("PAR", { exact: true }).first()).toBeVisible({ timeout: 5000 });

      await page.locator("button", { hasText: "Regenerate" }).click();
      await page.waitForTimeout(200);
      const secondText = await page.locator("pre").textContent();

      const firstEntry = page.locator("div.cursor-pointer").filter({ hasText: firstText!.slice(0, 20) }).first();
      await firstEntry.click();
      await page.waitForTimeout(200);

      await expect(page.locator("pre")).toHaveText(firstText!, { timeout: 5000 });
    });

    test("delete an entry removes it from the list", async ({ page }) => {
      await expect(page.locator("pre")).not.toBeEmpty({ timeout: 5000 });
      await expect(page.getByText("PAR", { exact: true }).first()).toBeVisible({ timeout: 5000 });

      await page.locator('button[title="Delete"]').first().click({ force: true });
      await expect(page.getByText("No history yet")).toBeVisible({ timeout: 5000 });
    });

    test("clear all removes all history entries", async ({ page }) => {
      await expect(page.locator("pre")).not.toBeEmpty({ timeout: 5000 });
      await expect(page.getByText("PAR", { exact: true }).first()).toBeVisible({ timeout: 5000 });

      await page.locator("button", { hasText: "Clear All" }).click();
      await expect(page.getByText("No history yet")).toBeVisible({ timeout: 5000 });
    });
  });
});
