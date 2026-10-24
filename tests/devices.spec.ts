import { expect, test } from "@playwright/test";

const PAGES = ["/", "/garden", "/garden?view=plots", "/garden?view=ledger", "/garden?view=timeline", "/garden/pocket-planner", "/bury", "/salvage", "/insights", "/contact", "/privacy"];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("secondwind-consent", "denied");
    sessionStorage.setItem("sw-intro", "1"); // repeat-visit fast boot
    localStorage.setItem("sw-tour-home", "1");
    localStorage.setItem("sw-tour-garden", "1");
  });
});

test("every page renders without errors or sideways scrolling", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${page.url()} ${e.message}`));
  for (const p of PAGES) {
    const res = await page.goto(p, { waitUntil: "domcontentloaded" });
    expect(res?.status(), p).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(400);
    // what a visitor feels: can the page be scrolled sideways at all?
    const shift = await page.evaluate(() => {
      scrollTo(300, scrollY);
      const x = scrollX;
      scrollTo(0, scrollY);
      return x;
    });
    expect(shift, `${p} scrolls sideways`).toBe(0);
  }
  expect(errors).toEqual([]);
});

test("boot intro clears quickly on repeat visits", async ({ page }) => {
  const t0 = Date.now();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sw-boot")).toBeHidden({ timeout: 3000 });
  expect(Date.now() - t0).toBeLessThan(3000);
});

test("garden opens in easy mode and visits projects", async ({ page }) => {
  await page.goto("/garden");
  await expect(page.getByRole("radio", { name: "Easy" })).toHaveAttribute("aria-checked", "true", { timeout: 15000 });
  await expect(page.getByRole("slider", { name: "Throttle" })).toHaveCount(0);
  const name = page.locator("p.font-display").filter({ hasText: /\S/ }).first();
  await page.getByRole("button", { name: "Fly to next project" }).click();
  await expect(name).toBeVisible();
  await page.getByRole("radio", { name: "Pilot" }).click();
  await expect(page.getByRole("slider", { name: "Throttle" })).toBeVisible();
});

test("drag and drop works on this device", async ({ page, context }, info) => {
  await page.goto("/garden/chess-bot", { waitUntil: "networkidle" });
  const card = page.locator('[data-card="project"]').first();
  const zone = page.locator('[data-zone="path-pivot"]');
  await card.scrollIntoViewIfNeeded();
  const s = (await card.boundingBox())!;
  const sx = s.x + s.width / 2;
  const sy = s.y + s.height / 2;
  if (info.project.name === "android-phone") {
    // real touch input, the way a phone drags
    const cdp = await context.newCDPSession(page);
    const touch = (type: string, x?: number, y?: number) =>
      cdp.send("Input.dispatchTouchEvent", { type: type as "touchStart", touchPoints: x === undefined ? [] : [{ x, y: y!, id: 1 }] });
    await touch("touchStart", sx, sy);
    for (let i = 1; i <= 4; i++) await touch("touchMove", sx + i * 3, sy + i * 3);
    const t = (await zone.boundingBox())!;
    for (let i = 1; i <= 12; i++) await touch("touchMove", sx + ((t.x + t.width / 2 - sx) * i) / 12, sy + ((t.y + t.height / 2 - sy) * i) / 12);
    await touch("touchEnd");
  } else {
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(sx + 10, sy + 10, { steps: 3 });
    await zone.evaluate((el) => el.scrollIntoView({ block: "center" })); // zones pulse while a card is held, so skip stability waits
    const t = (await zone.boundingBox())!;
    await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 10 });
    await page.mouse.up();
  }
  await expect(page.getByText("Pivot sketch")).toBeVisible({ timeout: 8000 });
});
