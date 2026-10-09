import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loginSchema,
  signupSchema,
  safeNextPath,
} from "../src/lib/validation/auth.ts";
import { brandLogosSchema } from "../src/lib/validation/brandLogos.ts";
import { localLogoSource } from "../src/lib/media.ts";

test("login accepts existing short passwords and preserves whitespace", () => {
  const parsed = loginSchema.parse({
    email: " user@example.com ",
    password: " x ",
  });
  assert.equal(parsed.email, "user@example.com");
  assert.equal(parsed.password, " x ");
});
test("signup rejects invalid addresses, weak passwords, and confirmation mismatches", () => {
  assert.equal(
    signupSchema.safeParse({
      email: "bad",
      password: "abcdefgh",
      confirmPassword: "abcdefgh",
    }).success,
    false,
  );
  assert.equal(
    signupSchema.safeParse({
      email: "user@example.com",
      password: "short",
      confirmPassword: "short",
    }).success,
    false,
  );
  const mismatch = signupSchema.safeParse({
    email: "user@example.com",
    password: "abcdefgh",
    confirmPassword: "different",
  });
  assert.equal(mismatch.success, false);
  assert.deepEqual(mismatch.error.issues[0].path, ["confirmPassword"]);
});
test("confirmation destinations cannot redirect to another origin", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\nevil.example",
    null,
  ]) {
    assert.equal(safeNextPath(value), "/");
  }
  assert.equal(
    safeNextPath("/dashboard?tab=content"),
    "/dashboard?tab=content",
  );
});
test("local media mapping only accepts verified files on the original host", () => {
  assert.equal(
    localLogoSource(
      "https://dvxqlvpokfujnpdwfuom.supabase.co/storage/v1/object/public/meda/logos/canva.svg?t=old",
    ),
    "/logos/canva.svg",
  );
  const other =
    "https://other.example/storage/v1/object/public/meda/logos/canva.svg";
  assert.equal(localLogoSource(other), other);
  const unknown =
    "https://dvxqlvpokfujnpdwfuom.supabase.co/storage/v1/object/public/meda/logos/unknown.svg";
  assert.equal(localLogoSource(unknown), unknown);
});
test("data validation distinguishes empty data from malformed data", () => {
  assert.deepEqual(brandLogosSchema.parse([]), []);
  assert.equal(brandLogosSchema.safeParse([{ id: 1 }]).success, false);
  assert.equal(brandLogosSchema.safeParse(null).success, false);
});
