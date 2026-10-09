import { test, expect } from "@playwright/test";

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
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Canva" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  const resume = await request.get("/docs/resume.pdf");
  expect(resume.status()).toBe(200);
  expect((await resume.body()).subarray(0, 5).toString()).toBe("%PDF-");
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
  ).toHaveAttribute("href", "/docs/resume.pdf");
  await expect(
    page.getByRole("link", { name: "Download Resume" }),
  ).toHaveAttribute("download", "");
});

test("demo mode denies protected routes and gives useful login feedback", async ({
  page,
  request,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email", { exact: true }).fill("demo@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("not-a-real-password");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByText("Login is disabled in demo mode.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Login", exact: true }),
  ).toBeEnabled();
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
