import { expect, test, type Page } from "@playwright/test";

const noConsent = async (page: Page) =>
  page.addInitScript(() => {
    if (!sessionStorage.getItem("init")) {
      localStorage.setItem("secondwind-consent", "denied");
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
      await page.getByRole("button", { name: /Change layout/ }).click();
      await page.getByRole("tab", { name: v }).click();
      await expect(page.getByRole("button", { name: new RegExp(`Layout: ${v}`) })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`view=${v.toLowerCase()}`));
    }
    await page.getByRole("button", { name: /Change layout/ }).click();
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
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Project name is required.")).toBeVisible();

    await page.getByLabel("Project name").fill("Quiz Forge");
    await page.getByLabel("What was it, in one line?").fill("Turns lecture notes into practice quizzes");
    await page.getByLabel("What did you want it to become?").fill("Upload notes and get a quiz with spaced repetition");
    await page.getByLabel("Started around").fill("2026-01-10");
    await page.getByLabel("Stopped around").fill("2025-12-01");
    await page.getByLabel("Repository link").fill("not a url");
    await page.getByRole("button", { name: "Continue" }).click();
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

    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Add at least one thing you finished.", { exact: false })).toBeVisible();
    await page.getByLabel("What did you finish?").fill("Notes parser");
    await page.getByLabel("What did you finish?").press("Enter");
    await page.getByLabel("What is still unfinished?").fill("Spaced repetition");
    await page.getByLabel("What is still unfinished?").press("Enter");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("button", { name: "Get the verdict" }).click();
    await expect(page.getByText("Pick at least one reason.")).toBeVisible();
    await page.getByText("Scope creep", { exact: true }).click();
    await page.getByRole("button", { name: "Get the verdict" }).click();

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
    await page.getByRole("button", { name: "Send message" }).click();
    // pretends success, nothing else happens
    await expect(page.getByText("Message received")).toBeVisible();
  });

  test("contact form validates and sends", async ({ page }) => {
    await noConsent(page);
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Name is required.")).toBeVisible();
    await page.getByLabel("Your name").fill("Asha Rao");
    await page.getByLabel("Email").fill("asha@");
    await page.getByLabel("Message").fill("short");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Enter an email like name@example.com.")).toBeVisible();
    await expect(page.getByText("Message needs at least 10 characters.")).toBeVisible();
    await page.getByLabel("Email").fill("asha@example.com");
    await page.getByLabel("Message").fill("Love the garden view, can clubs use it?");
    await page.waitForTimeout(2600);
    await page.getByRole("button", { name: "Send message" }).click();
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
    const boxes = page.getByRole("checkbox");
    for (let i = 0; i < 7; i++) await boxes.nth(i).check();
    await expect(page.getByText(/Alive again. Pocket Planner has left/)).toBeVisible();
    await page.getByRole("radio", { name: /Salvage/ }).click();
    await page.getByLabel("Part name").fill("Deadline extractor");
    await page.getByRole("button", { name: "Save part" }).click();
    await page.goto("/salvage");
    await expect(page.getByRole("heading", { name: "Deadline extractor" })).toBeVisible();
  });

  test("frankenstein merge creates a combined project", async ({ page }) => {
    await noConsent(page);
    await page.goto("/garden/study-buddy");
    await page.getByRole("radio", { name: /Merge/ }).click();
    await page.getByRole("button", { name: "Stitch them together" }).click();
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
});
