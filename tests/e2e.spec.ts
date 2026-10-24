import { expect, test, type Locator, type Page } from "@playwright/test";

/** Real pointer drag from a card to an action zone (Canvas Protocol). */
async function dragTo(page: Page, card: Locator, zone: Locator, retry = true): Promise<void> {
  try {
    await dragOnce(page, card, zone);
  } catch (e) {
    if (!retry) throw e;
    await page.waitForTimeout(600); // an exiting card was still animating out
    await dragOnce(page, card, zone);
  }
}

async function dragOnce(page: Page, card: Locator, zone: Locator) {
  await card.waitFor({ state: "visible" });
  await page.waitForTimeout(250); // let list re-ordering animations settle
  await card.scrollIntoViewIfNeeded();
  const s = (await card.boundingBox())!;
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2);
  await page.mouse.down();
  await page.mouse.move(s.x + s.width / 2 + 12, s.y + s.height / 2 + 12, { steps: 3 });
  const t = (await zone.boundingBox())!;
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 10 });
  await page.mouse.up();
}
const card = (page: Page, kind: string) => page.locator(`[data-card="${kind}"]`).first();
const zone = (page: Page, id: string) => page.locator(`[data-zone="${id}"]`);

const noConsent = async (page: Page) =>
  page.addInitScript(() => {
    if (!sessionStorage.getItem("init")) {
      localStorage.setItem("secondwind-consent", "denied");
      // the first-visit tour would cover the page; tests start as returning visitors
      localStorage.setItem("sw-tour-home", "1");
      localStorage.setItem("sw-tour-garden", "1");
      localStorage.setItem("sw-flight-school", "1");
      sessionStorage.setItem("init", "1");
    }
  });

test.describe("SecondWind", () => {
  test("landing has one primary CTA, live score demo and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await noConsent(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your unfinished projects deserve a second look.");
    await expect(page.locator("main").getByRole("link", { name: "Bury your first project" }).first()).toHaveAttribute("href", "/bury");
    const interest = page.locator("#demo-interest");
    await interest.scrollIntoViewIfNeeded();
    await interest.fill("1");
    await page.locator("#demo-relevance").fill("1");
    await page.locator("#demo-ideaStrength").fill("1");
    await page.locator("#demo-completion").fill("10");
    await expect(page.getByText("Rest with an epitaph").first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("cookie banner appears and remembers the choice", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("region", { name: "Cookie preferences" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Essential only" }).click();
    await expect(banner).toBeHidden();
    await page.reload();
    await expect(page.getByRole("region", { name: "Cookie preferences" })).toBeHidden();
  });

  test("garden: all four views switch, filters and search work", async ({ page }) => {
    await noConsent(page);
    await page.goto("/garden");
    await expect(page.getByRole("button", { name: /Habit Hike, Resurrection Score/ })).toBeVisible();
    for (const v of ["Plots", "Ledger", "Timeline", "Garden"]) {
      await page.getByRole("tab", { name: v }).click();
      await expect(page.getByRole("tab", { name: v })).toHaveAttribute("aria-selected", "true");
      await expect(page).toHaveURL(new RegExp(`view=${v.toLowerCase()}`));
    }
    await page.getByRole("tab", { name: "Plots" }).click();
    await page.getByLabel("Search projects").fill("chess");
    await expect(page.locator("#garden-view li")).toHaveCount(1);
    await page.getByLabel("Search projects").fill("zzzz");
    await expect(page.getByText("Nothing rests here")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page.getByRole("button", { name: /^Archive/ }).click();
    await expect(page.locator("#garden-view li")).toHaveCount(2);
  });

  test("ledger sorts by name", async ({ page }) => {
    await noConsent(page);
    await page.goto("/garden?view=ledger");
    await page.getByRole("button", { name: /^Project/ }).click();
    await expect(page.locator("tbody tr").first()).toContainText("Budget Bee");
  });

  test("autopsy wizard validates, autosaves, blocks bots and gives a verdict", async ({ page }) => {
    await noConsent(page);
    await page.goto("/bury");
    await dragTo(page, card(page, "autopsy"), zone(page, "bury-next"));
    await expect(page.getByText("Project name is required.")).toBeVisible();

    await page.getByLabel("Project name").fill("Quiz Forge");
    await page.getByLabel("What was it, in one line?").fill("Turns lecture notes into practice quizzes");
    await page.getByLabel("What did you want it to become?").fill("Upload notes and get a quiz with spaced repetition");
    await page.getByLabel("Started around").fill("2026-01-10");
    await page.getByLabel("Stopped around").fill("2025-12-01");
    await page.getByLabel("Repository link").fill("not a url");
    await dragTo(page, card(page, "autopsy"), zone(page, "bury-next"));
    await expect(page.getByText("It cannot stop before it started.")).toBeVisible();
    await expect(page.getByText("Enter a full link starting with https://")).toBeVisible();
    await page.getByLabel("Stopped around").fill("2026-03-01");
    await page.getByLabel("Repository link").fill("https://github.com/me/quiz-forge");
    await page.getByLabel("Tags").fill("students, education");

    // autosave survives a reload
    await page.waitForTimeout(600);
    await page.reload();
    await expect(page.getByText("We restored the autopsy you started earlier.")).toBeVisible();
    await expect(page.getByLabel("Project name")).toHaveValue("Quiz Forge");

    await dragTo(page, card(page, "autopsy"), zone(page, "bury-next"));
    await dragTo(page, card(page, "autopsy"), zone(page, "bury-next"));
    await expect(page.getByText("Add at least one thing you finished.", { exact: false })).toBeVisible();
    await page.getByLabel("What did you finish?").fill("Notes parser");
    await page.getByLabel("What did you finish?").press("Enter");
    await page.getByLabel("What is still unfinished?").fill("Spaced repetition");
    await page.getByLabel("What is still unfinished?").press("Enter");
    await dragTo(page, card(page, "autopsy"), zone(page, "bury-next"));

    await dragTo(page, card(page, "autopsy"), zone(page, "bury-next"));
    await expect(page.getByText("Pick at least one reason.")).toBeVisible();
    await page.getByText("Scope creep", { exact: true }).click();
    await dragTo(page, card(page, "autopsy"), zone(page, "bury-next"));

    await expect(page.getByRole("heading", { name: "Quiz Forge" })).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole("img", { name: /Resurrection Score: \d+ out of 100/ })).toBeVisible();
    await page.locator("main a[href^='/garden/quiz-forge']").click();
    await expect(page.getByRole("heading", { level: 1, name: "Quiz Forge" })).toBeVisible();
  });

  test("honeypot silently drops bot submissions", async ({ page }) => {
    await noConsent(page);
    await page.goto("/contact");
    await page.locator("input[name=website]").fill("spam.example", { force: true });
    await page.getByLabel("Your name").fill("Bot");
    await page.getByLabel("Email").fill("bot@example.com");
    await page.getByLabel("Message").fill("Buy followers now please");
    await page.waitForTimeout(2600);
    await dragTo(page, card(page, "form-contact-form"), zone(page, "zone-contact-form"));
    // pretends success, nothing else happens
    await expect(page.getByText("Message received")).toBeVisible();
  });

  test("contact form validates and sends", async ({ page }) => {
    await noConsent(page);
    await page.goto("/contact");
    await dragTo(page, card(page, "form-contact-form"), zone(page, "zone-contact-form"));
    await expect(page.getByText("Name is required.")).toBeVisible();
    await page.getByLabel("Your name").fill("Asha Rao");
    await page.getByLabel("Email").fill("asha@");
    await page.getByLabel("Message").fill("short");
    await dragTo(page, card(page, "form-contact-form"), zone(page, "zone-contact-form"));
    await expect(page.getByText("Enter an email like name@example.com.")).toBeVisible();
    await expect(page.getByText("Message needs at least 10 characters.")).toBeVisible();
    await page.getByLabel("Email").fill("asha@example.com");
    await page.getByLabel("Message").fill("Love the garden view, can clubs use it?");
    await page.waitForTimeout(2600);
    await dragTo(page, card(page, "form-contact-form"), zone(page, "zone-contact-form"));
    await expect(page.getByText("Message received")).toBeVisible();
  });

  test("contact API rejects invalid payloads server side", async ({ request }) => {
    const res = await request.post("/api/contact", { data: { name: "A", email: "x", message: "", elapsed: 9000 } });
    expect(res.status()).toBe(422);
  });

  test("project paths: sprint ticking brings a project back to life", async ({ page }) => {
    await noConsent(page);
    await page.goto("/garden/pocket-planner");
    await expect(page.getByText("7-day sprint")).toBeVisible();
    for (let i = 0; i < 7; i++) {
      await dragTo(page, page.locator('[data-zone="sprint-todo"] [data-card="day"]').first(), zone(page, "sprint-done"));
      await expect(page.locator('[data-zone="sprint-done"] [data-card="day"]')).toHaveCount(i + 1, { timeout: 6000 });
    }
    await expect(page.getByText(/Alive again. Pocket Planner has left/)).toBeVisible();
    await dragTo(page, card(page, "project"), zone(page, "path-salvage"));
    await page.getByLabel("Part name").fill("Deadline extractor");
    await dragTo(page, card(page, "form-organ-form"), zone(page, "zone-organ-form"));
    await expect(page.locator('[data-card="organ"]', { hasText: "Deadline extractor" })).toBeVisible({ timeout: 6000 });
    await page.goto("/salvage");
    await expect(page.getByRole("heading", { name: "Deadline extractor" })).toBeVisible();
  });

  test("frankenstein merge creates a combined project", async ({ page }) => {
    await noConsent(page);
    await page.goto("/garden/study-buddy");
    await dragTo(page, card(page, "project"), zone(page, "path-merge"));
    await dragTo(page, card(page, "sibling"), zone(page, "stitch-table"));
    await page.getByRole("link", { name: "Open the combined project" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("×");
  });

  test("death report is computed from the garden", async ({ page }) => {
    await noConsent(page);
    await page.goto("/insights");
    await expect(page.getByText(/ended \d+ of your 12 projects/)).toBeVisible();
  });

  test("custom 404, legal pages and SEO files", async ({ page, request }) => {
    const res = await page.goto("/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This page was never built" })).toBeVisible();
    for (const p of ["/privacy", "/terms"]) {
      expect((await request.get(p)).status()).toBe(200);
    }
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/garden/pocket-planner");
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toContain("image/png");
    expect((await request.get("/icon.svg")).status()).toBe(200);
  });

  test("meta tags and security headers", async ({ page }) => {
    const res = await page.goto("/garden");
    const h = res!.headers();
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-powered-by"]).toBeUndefined();
    await expect(page).toHaveTitle("The Garden | SecondWind");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  });

  test("every image and svg role=img has alt text", async ({ page }) => {
    for (const p of ["/", "/garden", "/garden/pocket-planner"]) {
      await page.goto(p);
      const missing = await page.$$eval("img:not([alt]), [role=img]:not([aria-label]):not([aria-labelledby])", (els) => els.length);
      expect(missing, p).toBe(0);
    }
  });

  test("salvage yard: borrow moves a part into another project", async ({ page }) => {
    await noConsent(page);
    await page.goto("/salvage");
    await dragTo(page, page.locator('[data-card="part"]', { hasText: "Syllabus date parser" }), zone(page, "borrow-study-buddy"));
    await expect(page.getByText("Part delivered")).toBeVisible({ timeout: 8000 });
    await page.getByRole("link", { name: "Open Study Buddy" }).click();
    await expect(page.getByText('Borrowed "Syllabus date parser" from Pocket Planner')).toBeVisible();
  });

  test("sample project pre-fills the autopsy", async ({ page }) => {
    await noConsent(page);
    await page.goto("/bury?sample=1");
    await expect(page.getByLabel("Project name")).toHaveValue("Lecture Lens");
  });

  test("death report: clicking a cause focuses it", async ({ page }) => {
    await noConsent(page);
    await page.goto("/insights");
    await page.getByRole("button", { name: /Scope creep/ }).click();
    await expect(page.getByText("Fix for scope creep:")).toBeVisible();
  });

  test("keyboard users can drag with Space and drop with Enter", async ({ page }) => {
    await noConsent(page);
    await page.goto("/garden/chess-bot", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await card(page, "project").focus();
    await page.keyboard.press("Space");
    await expect(zone(page, "path-revive")).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Pivot sketch")).toBeVisible({ timeout: 6000 });
  });

  test("no primary action buttons remain on core screens", async ({ page }) => {
    await noConsent(page);
    for (const [path, banned] of [
      ["/bury", /^(Continue|Get the verdict|Add)$/],
      ["/contact", /^Send message$/],
      ["/salvage", /^Borrow$/],
      ["/garden/pocket-planner", /^(Save part|Stitch them together|Remove from garden)$/],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("button", { name: banned, exact: true })).toHaveCount(0);
    }
  });
});
