/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import schema from "./schema";
import type { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";
import { createOwnerUser } from "./permissions";
import { exportPKCS8, generateKeyPair } from "jose";

const modules = import.meta.glob("./**/*.ts");
const OWNER = "owner@example.com";
beforeEach(() => {
  vi.stubEnv("OWNER_EMAIL", OWNER);
  vi.stubEnv("OWNER_SETUP_KEY", "private-test-setup-key");
  vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account");
  vi.stubEnv("CLOUDFLARE_IMAGES_API_TOKEN", "private-test-token");
  vi.stubEnv("CLOUDFLARE_IMAGES_ACCOUNT_HASH", "test-hash");
  vi.stubEnv("CLOUDFLARE_IMAGES_VARIANT", "public");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function setup() {
  const t = convexTest(schema, modules);
  const ownerId = await t.run((ctx) =>
    ctx.db.insert("users", { email: OWNER }),
  );
  const otherId = await t.run((ctx) =>
    ctx.db.insert("users", { email: "other@example.com" }),
  );
  const owner = t.withIdentity({ subject: `${ownerId}|owner-session` });
  const other = t.withIdentity({
    subject: `${otherId}|other-session`,
    email: OWNER,
  });
  return { t, owner, other, ownerId, otherId };
}
describe("dashboard authorization", () => {
  it("keeps setup unavailable until the private setup key is configured", async () => {
    const t = convexTest(schema, modules);
    vi.stubEnv("OWNER_SETUP_KEY", "");
    expect(await t.query(api.admin.setupAvailable)).toBe(false);
  });
  it("sets up the owner with a valid key and authenticates the chosen password", async () => {
    const keys = await generateKeyPair("RS256", { extractable: true });
    vi.stubEnv(
      "JWT_PRIVATE_KEY",
      (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " "),
    );
    vi.stubEnv("CONVEX_SITE_URL", "https://test.convex.site");
    const t = convexTest(schema, modules);
    const password = "sufficient-test-password";
    const created = await t.action(api.auth.signIn, {
      provider: "password",
      params: {
        flow: "signUp",
        email: OWNER,
        password,
        setupKey: "private-test-setup-key",
      },
    });
    expect(created.tokens?.token).toBeTruthy();
    expect(await t.query(api.admin.setupAvailable)).toBe(false);
    const loggedIn = await t.action(api.auth.signIn, {
      provider: "password",
      params: { flow: "signIn", email: OWNER, password },
    });
    expect(loggedIn.tokens?.token).toBeTruthy();
    await expect(
      t.action(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signIn",
          email: OWNER,
          password: "wrong-test-password",
        },
      }),
    ).rejects.toThrow();
  });
  it("creates exactly one owner and refuses a replay of the account transaction", async () => {
    const t = convexTest(schema, modules);
    const id = await t.run((ctx) => createOwnerUser(ctx, OWNER));
    await expect(t.run((ctx) => createOwnerUser(ctx, OWNER))).rejects.toThrow(
      "Account setup is closed",
    );
    await expect(
      t.run((ctx) => createOwnerUser(ctx, "other@example.com")),
    ).rejects.toThrow("Account setup is not authorized");
    const users = await t.run((ctx) =>
      ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", OWNER))
        .take(2),
    );
    expect(users.map((user) => user._id)).toEqual([id]);
  });
  it("blocks direct signup calls once the owner exists", async () => {
    const { t } = await setup();
    await expect(
      t.action(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signUp",
          email: OWNER,
          password: "sufficient-test-password",
          setupKey: "private-test-setup-key",
        },
      }),
    ).rejects.toThrow("Account setup is closed");
  });
  it("rejects initial signup with no setup key or a different email", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.action(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signUp",
          email: OWNER,
          password: "sufficient-test-password",
        },
      }),
    ).rejects.toThrow("Account setup is not authorized");
    await expect(
      t.action(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signUp",
          email: "other@example.com",
          password: "sufficient-test-password",
          setupKey: "private-test-setup-key",
        },
      }),
    ).rejects.toThrow("Invalid credentials");
    expect(await t.query(api.admin.setupAvailable)).toBe(true);
  });
  it("denies anonymous and another user even when identity claims the owner's email", async () => {
    const { t, owner, other } = await setup();
    await expect(t.query(api.brandLogos.listForAdmin)).rejects.toThrow(
      "Dashboard access required",
    );
    await expect(other.query(api.brandLogos.listForAdmin)).rejects.toThrow(
      "Dashboard access required",
    );
    expect(await owner.query(api.admin.current)).toEqual({ email: OWNER });
    expect(await other.query(api.admin.current)).toBeNull();
    expect(await t.query(api.admin.setupAvailable)).toBe(false);
    expect(await t.query(api.featureFlags.signupEnabled)).toBe(false);
  });
  it("denies upload issuance without owner auth before contacting Cloudflare", async () => {
    const { t, other } = await setup();
    const network = vi.spyOn(globalThis, "fetch");
    await expect(
      t.action(api.images.requestUpload, { filename: "logo.png" }),
    ).rejects.toThrow("Dashboard access required");
    await expect(
      other.action(api.images.requestUpload, { filename: "logo.png" }),
    ).rejects.toThrow("Dashboard access required");
    expect(network).not.toHaveBeenCalled();
  });
});
describe("migration", () => {
  it("preserves imported order, public shape and Cloudflare mappings on replay", async () => {
    const { t, owner, other } = await setup();
    const storageId = await t.run((ctx) =>
      ctx.storage.store(new Blob(["pdf"], { type: "application/pdf" })),
    );
    const logos = [2, 1].map((id) => ({
      id,
      alt: `Logo ${id}`,
      label: null,
      description: "description",
      src: "/logo.svg",
      active: null,
      referral_link: null,
      created: null,
      updated: null,
    }));
    const args = {
      logos,
      flags: [{ name: "signup", enabled: true }],
      resumeStorageId: storageId,
    };
    await t.mutation(internal.migrations.importData, args);
    await t.mutation(internal.migrations.setCloudflareImage, {
      legacyId: 2,
      imageId: "cf-2",
      src: "https://imagedelivery.net/test-hash/cf-2/public",
    });
    await t.mutation(internal.migrations.importData, args);
    const rows = await t.query(api.brandLogos.list);
    expect(rows.map((row) => row.legacyId)).toEqual([2, 1]);
    expect(rows[0].src).toContain("cf-2");
    expect(Object.keys(rows[0]).sort()).toEqual(
      [
        "id",
        "legacyId",
        "alt",
        "label",
        "description",
        "src",
        "active",
        "referral_link",
        "created",
        "updated",
      ].sort(),
    );
    await expect(
      other.mutation(api.brandLogos.setActive, {
        id: rows[0].id as Id<"brandLogos">,
        active: false,
      }),
    ).rejects.toThrow("Dashboard access required");
    await owner.mutation(api.brandLogos.setActive, {
      id: rows[0].id as Id<"brandLogos">,
      active: false,
    });
    expect(
      (await t.query(api.brandLogos.list)).map((logo) => logo.legacyId),
    ).toEqual([1]);
    expect((await owner.query(api.brandLogos.listForAdmin))[0].active).toBe(
      false,
    );
    // convex-test does not populate storage contentType metadata. An unverified
    // file must return null so the frontend uses its local PDF fallback.
    expect(await t.query(api.siteAssets.resume)).toBeNull();
    expect(await t.query(api.featureFlags.signupEnabled)).toBe(false);
  });
});
describe("image completion", () => {
  it("bounds provider requests and gives a safe error for malformed responses", async () => {
    const { owner } = await setup();
    const network = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("upstream failure", { status: 502 }));
    await expect(
      owner.action(api.images.requestUpload, { filename: "logo.png" }),
    ).rejects.toThrow("Image service is unavailable");
    expect(network.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });
  it("rejects expired uploads before requesting the provider", async () => {
    const { t, owner, ownerId } = await setup();
    await t.run((ctx) =>
      ctx.db.insert("pendingImages", {
        imageId: "expired",
        ownerId,
        expiresAt: Date.now() - 1,
      }),
    );
    const network = vi.spyOn(globalThis, "fetch");
    await expect(
      owner.action(api.images.completeUpload, {
        imageId: "expired",
        label: "Logo",
        alt: "Logo",
        description: "Details",
      }),
    ).rejects.toThrow("Upload expired");
    expect(network).not.toHaveBeenCalled();
  });
  it("rejects a foreign pending upload without accessing the provider", async () => {
    const { t, owner, otherId } = await setup();
    await t.run((ctx) =>
      ctx.db.insert("pendingImages", {
        imageId: "foreign",
        ownerId: otherId,
        expiresAt: Date.now() + 10000,
      }),
    );
    const network = vi.spyOn(globalThis, "fetch");
    await expect(
      owner.action(api.images.completeUpload, {
        imageId: "foreign",
        label: "Logo",
        alt: "Logo",
        description: "Description",
      }),
    ).rejects.toThrow("Upload not found");
    expect(network).not.toHaveBeenCalled();
  });
  it("rejects a draft and completes a confirmed image once", async () => {
    const { t, owner, ownerId } = await setup();
    await t.run((ctx) =>
      ctx.db.insert("pendingImages", {
        imageId: "new-image",
        ownerId,
        expiresAt: Date.now() + 10000,
      }),
    );
    let draft = true;
    const network = vi.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            success: true,
            result: {
              id: "new-image",
              draft,
              variants: [
                "https://imagedelivery.net/test-hash/new-image/public",
              ],
            },
          }),
          { status: 200 },
        ),
    );
    const args = {
      imageId: "new-image",
      label: "Logo",
      alt: "Logo",
      description: "Description",
    };
    await expect(owner.action(api.images.completeUpload, args)).rejects.toThrow(
      "not ready",
    );
    draft = false;
    const id = await owner.action(api.images.completeUpload, args);
    expect(await owner.action(api.images.completeUpload, args)).toEqual(id);
    expect((await t.query(api.brandLogos.list)).length).toBe(1);
    expect(network).toHaveBeenCalledTimes(2);
  });
});
