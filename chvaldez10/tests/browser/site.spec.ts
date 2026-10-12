import { test, expect } from "@playwright/test";

test("login recovers from a backend failure without exposing the raw error", async ({
  page,
  request,
}) => {
  const backend = process.env.E2E_BACKEND_URL;
  if (!backend || new URL(backend).hostname !== "127.0.0.1")
    throw new Error("Run browser tests with pnpm test:e2e.");
  await request.post(backend + "/__tests/query-failure", {
    data: { path: "admin:setupAvailable", fail: true },
  });
  try {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Login unavailable" }),
    ).toBeVisible();
    await expect(
      page.getByText("Invalid credentials.", { exact: true }),
    ).toHaveCount(0);
    await request.post(backend + "/__tests/query-failure", {
      data: { path: "admin:setupAvailable", fail: false },
    });
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  } finally {
    await request.post(backend + "/__tests/query-failure", {
      data: { path: "admin:setupAvailable", fail: false },
    });
  }
});

test("marquee loops on wide screens and pauses for keyboard interaction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 2560, height: 900 });
  await page.goto("/#tech-finds");
  const rows = page.locator(".rfm-marquee-container");
  await expect(rows).toHaveCount(2);
  const track = rows.first().locator(".rfm-marquee").first();
  await expect
    .poll(() =>
      track.evaluate((element) =>
        parseFloat(getComputedStyle(element).animationDuration),
      ),
    )
    .toBeGreaterThan(0);
  await page.mouse.move(0, 0);
  const initial = await track.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await expect
    .poll(() =>
      track.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(initial);
  const gaps = await rows.evaluateAll((elements) =>
    elements.map((row) => {
      const boundary = row.getBoundingClientRect();
      const buttons = Array.from(row.querySelectorAll("button"))
        .map((button) => button.getBoundingClientRect())
        .filter(
          (rect) => rect.right > boundary.left && rect.left < boundary.right,
        )
        .sort((a, b) => a.left - b.left);
      let end = boundary.left;
      let maxGap = 0;
      for (const button of buttons) {
        maxGap = Math.max(maxGap, button.left - end);
        end = Math.max(end, button.right);
      }
      return Math.max(maxGap, boundary.right - end);
    }),
  );
  for (const gap of gaps) expect(gap).toBeLessThanOrEqual(33);
  const trigger = page
    .getByRole("button", { name: "Details about Canva" })
    .first();
  await trigger.focus();
  await expect
    .poll(() =>
      track.evaluate((element) => getComputedStyle(element).animationPlayState),
    )
    .toBe("paused");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("failed logos show a fallback in the list and details without losing their text", async ({
  page,
}) => {
  await page.route(
    (url) =>
      url.pathname === "/logos/canva.svg" ||
      url.searchParams.get("url") === "/logos/canva.svg",
    (route) =>
      route.fulfill({
        status: 404,
        contentType: "text/plain",
        body: "Missing image",
      }),
  );
  await page.goto("/");
  const trigger = page
    .getByRole("button", { name: "Details about Canva" })
    .first();
  await expect(
    trigger.getByRole("img", {
      name: "Canva logo (image unavailable)",
      exact: true,
    }),
  ).toBeVisible();
  await expect(trigger.getByText("Canva", { exact: true })).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("img", {
      name: "Canva logo (image unavailable)",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Canva", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Fixture content for browser tests."),
  ).toBeVisible();
});

test("public site uses local media and supports accessible logo details", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "I'm Christian" }),
  ).toBeVisible();
  const trigger = page
    .getByRole("button", { name: "Details about Canva" })
    .first();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Canva" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  const resume = await request.get("/docs/resume.pdf");
  expect(resume.status()).toBe(200);
  expect((await resume.body()).subarray(0, 5).toString()).toBe("%PDF-");
  const fallback = await request.get("/api/resume", { maxRedirects: 0 });
  expect(fallback.status()).toBe(307);
  expect(new URL(fallback.headers().location).pathname).toBe(
    "/docs/resume.pdf",
  );
  const fallbackFile = await request.get("/api/resume");
  expect((await fallbackFile.body()).subarray(0, 5).toString()).toBe("%PDF-");
  expect(errors).toEqual([]);
});

test("project filters work with the keyboard and the resume has direct links", async ({
  page,
}) => {
  await page.goto("/");
  const filter = page.getByRole("button", { name: "Ideation", exact: true });
  await filter.focus();
  await page.keyboard.press("Enter");
  await expect(filter).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Open Resume in a new tab" }),
  ).toHaveAttribute("href", "/api/resume");
  await expect(
    page.getByRole("link", { name: "Download Resume" }),
  ).toHaveAttribute("download", "");
  await expect(
    page.getByRole("link", { name: "Download Resume" }),
  ).toHaveAttribute("href", "/api/resume?download=1");
});

test("anonymous users are blocked and the real login form handles rejected credentials", async ({
  page,
  request,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email", { exact: true }).fill("owner@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("test-only-invalid-password");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(
    page.getByText("Unable to sign in. Check your email and password."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Login", exact: true }),
  ).toBeEnabled();
  const privateRoute = await request.get("/admin/probe", { maxRedirects: 0 });
  expect(privateRoute.status()).toBe(307);
  expect(privateRoute.headers().location).toContain("/login");
  const confirmation = await request.get(
    "/auth/confirm?type=signup&token_hash=invalid&next=//evil.example",
    { maxRedirects: 0 },
  );
  expect(confirmation.status()).toBe(307);
  expect(confirmation.headers().location).toContain(
    "/login?confirmation=failed",
  );
});

test("mobile navigation closes and links back to homepage sections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByRole("button", { name: "Toggle navigation menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile", exact: true })
    .getByRole("link", { name: "Projects" })
    .click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
