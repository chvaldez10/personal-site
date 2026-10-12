import { test } from "node:test";
import assert from "node:assert/strict";

import { publicWebUrl } from "../src/lib/links.ts";
import { MAX_PDF_BYTES, readPdf } from "../src/lib/pdf.ts";
import { logoUploadSchema } from "../src/lib/validation/logoUpload.ts";

test("stored referral links cannot execute code or embed credentials", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.example",
    "https://user:password@example.com",
    null,
  ]) {
    assert.equal(publicWebUrl(value), null);
  }
  assert.equal(
    publicWebUrl(" https://example.com/path "),
    "https://example.com/path",
  );
});

test("logo form validates provider limits and links before uploading", () => {
  const valid = {
    label: " Logo ",
    alt: "Logo description",
    description: "Details",
    referralLink: "",
  };
  assert.equal(logoUploadSchema.parse(valid).label, "Logo");
  for (const values of [
    { ...valid, label: "x".repeat(121) },
    { ...valid, alt: "x".repeat(251) },
    { ...valid, referralLink: "http://example.com" },
  ]) {
    assert.equal(logoUploadSchema.safeParse(values).success, false);
  }
});

test("resume reader accepts a PDF and rejects invalid content", async () => {
  const pdf = await readPdf(
    new Response("%PDF-test", {
      headers: { "content-type": "application/pdf" },
    }),
  );
  assert.equal(new TextDecoder().decode(pdf), "%PDF-test");
  assert.equal(
    await readPdf(
      new Response("<html>", {
        headers: { "content-type": "application/pdf" },
      }),
    ),
    null,
  );
  assert.equal(
    await readPdf(
      new Response("%PDF-test", { headers: { "content-type": "text/html" } }),
    ),
    null,
  );
});

test("resume reader cancels oversized streams even without a length header", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_PDF_BYTES));
      controller.enqueue(new Uint8Array(1));
    },
    cancel() {
      cancelled = true;
    },
  });
  assert.equal(
    await readPdf(
      new Response(stream, { headers: { "content-type": "application/pdf" } }),
    ),
    null,
  );
  assert.equal(cancelled, true);
});
