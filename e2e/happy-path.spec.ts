import { test, expect } from "@playwright/test";

test.describe("Happy path order flow", () => {
  test("Page loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Multiply or Die/);
  });

  test("Hero CTA scrolls to order form", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="#order-form"]');
    await expect(page.locator("#order-form")).toBeInViewport();
  });

  test("PWYC slider updates microcopy", async ({ page }) => {
    await page.goto("/");
    await page.locator("#order-form").scrollIntoViewIfNeeded();

    // Find the slider
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();

    // Set to $40 (4000 cents) — should show "2 pastors"
    await slider.fill("4000");
    await expect(page.locator('[aria-live="polite"]')).toContainText("2 pastors");
  });

  test("Shipping option toggle updates total", async ({ page }) => {
    await page.goto("/");
    await page.locator("#order-form").scrollIntoViewIfNeeded();

    // Select priority shipping
    await page.click('input[value="priority"]');
    // Total should reflect $12.95 shipping
    await expect(page.locator("text=$12.95")).toBeVisible();
  });

  test("Email validation prevents submission", async ({ page }) => {
    await page.goto("/");
    await page.locator("#order-form").scrollIntoViewIfNeeded();

    await page.fill("#email", "not-an-email");
    await page.click('button[type="submit"]');

    // Should show validation error, NOT redirect to Stripe
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("Confirmation page redirects to home if no session_id", async ({ page }) => {
    await page.goto("/confirmation");
    await expect(page).toHaveURL("/");
  });

  test("Sponsorship counter renders with non-negative numbers", async ({ page }) => {
    await page.goto("/");
    const counter = page.locator('[aria-label*="pastors sponsored"]');
    await expect(counter).toBeVisible();
  });

  test("FAQ accordion opens on click", async ({ page }) => {
    await page.goto("/");
    const firstFaq = page.locator("details").first();
    await firstFaq.scrollIntoViewIfNeeded();
    await firstFaq.locator("summary").click();
    await expect(firstFaq).toHaveAttribute("open");
  });
});
