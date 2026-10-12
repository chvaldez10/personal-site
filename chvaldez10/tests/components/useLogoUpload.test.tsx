// @vitest-environment node
import { createElement, type FormEvent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useLogoUpload } from "../../src/components/dashboard/useLogoUpload";

const actions = vi.hoisted(() => ({
  request: vi.fn(),
  complete: vi.fn(),
  use: vi.fn(),
}));
vi.mock("convex/react", () => ({ useAction: actions.use }));
const NativeFormData = globalThis.FormData;
beforeEach(() => {
  vi.clearAllMocks();
  actions.use
    .mockReturnValueOnce(actions.request)
    .mockReturnValueOnce(actions.complete);
  actions.request.mockResolvedValue({
    imageId: "image-one",
    uploadURL: "https://upload.imagedelivery.net/test",
  });
});
afterEach(() => vi.unstubAllGlobals());

it("retries a failed save with the uploaded image instead of uploading a duplicate", async () => {
  const form = { reset: vi.fn() };
  const file = new File(["image"], "logo.png", { type: "image/png" });
  vi.stubGlobal(
    "FormData",
    class extends NativeFormData {
      constructor(input?: unknown) {
        super();
        if (input === form) {
          this.set("image", file);
          this.set("label", "Logo");
          this.set("alt", "Logo description");
          this.set("description", "Details");
          this.set("referralLink", "");
        }
      }
    },
  );
  const network = vi.fn().mockResolvedValue(new Response("ok"));
  vi.stubGlobal("fetch", network);
  actions.complete
    .mockRejectedValueOnce(new Error("Temporary save failure"))
    .mockResolvedValueOnce("saved-logo");
  const holder: { current?: ReturnType<typeof useLogoUpload> } = {};
  function Harness() {
    // eslint-disable-next-line react/immutability -- This test-only SSR harness captures the hook to simulate submit events without a mounted browser UI.
    holder.current = useLogoUpload();
    return null;
  }
  renderToStaticMarkup(createElement(Harness));
  if (!holder.current) throw new Error("Upload hook did not render.");
  const event = {
    preventDefault: vi.fn(),
    currentTarget: form,
  } as unknown as FormEvent<HTMLFormElement>;
  await holder.current.submit(event);
  expect(form.reset).not.toHaveBeenCalled();
  await holder.current.submit(event);
  expect(actions.request).toHaveBeenCalledTimes(1);
  expect(network).toHaveBeenCalledTimes(1);
  expect(actions.complete).toHaveBeenCalledTimes(2);
  expect(actions.complete.mock.calls.map(([args]) => args.imageId)).toEqual([
    "image-one",
    "image-one",
  ]);
  expect(form.reset).toHaveBeenCalledTimes(1);
});
