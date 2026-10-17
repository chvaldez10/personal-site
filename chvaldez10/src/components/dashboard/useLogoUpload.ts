"use client";

import { useRef, useState, type SubmitEvent } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  logoUploadSchema,
} from "@/lib/validation/logoUpload";

export function useLogoUpload() {
  const requestUpload = useAction(api.images.requestUpload);
  const completeUpload = useAction(api.images.completeUpload);
  const uploaded = useRef<{ imageId: string; expiresAt: number } | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  function resetImage() {
    uploaded.current = null;
    setFeedback(null);
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setFeedback(null);
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("image");
    if (!(file instanceof File) || !file.size) {
      setFeedback({ text: "Choose an image.", error: true });
      return;
    }
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      setFeedback({
        text: "Choose a PNG, JPEG, GIF, WebP, or SVG up to 10 MB.",
        error: true,
      });
      return;
    }
    const parsed = logoUploadSchema.safeParse(Object.fromEntries(values));
    if (!parsed.success) {
      setFeedback({ text: parsed.error.issues[0].message, error: true });
      return;
    }
    setPending(true);
    try {
      // A failed save can be retried without uploading a second image.
      // Use a conservative local expiry within the backend's 15-minute limit.
      let imageId =
        uploaded.current && uploaded.current.expiresAt > Date.now()
          ? uploaded.current.imageId
          : null;
      if (!imageId) {
        const issuedAt = Date.now();
        const ticket = await requestUpload({ filename: file.name });
        const payload = new FormData();
        payload.set("file", file);
        const response = await fetch(ticket.uploadURL, {
          method: "POST",
          body: payload,
          signal: AbortSignal.timeout(60000),
        });
        if (!response.ok) throw new Error("Image upload failed.");
        imageId = ticket.imageId;
        uploaded.current = { imageId, expiresAt: issuedAt + 14 * 60 * 1000 };
      }
      const { referralLink, ...details } = parsed.data;
      await completeUpload({
        imageId,
        ...details,
        ...(referralLink ? { referralLink } : {}),
      });
      form.reset();
      uploaded.current = null;
      setFeedback({ text: "Logo added.", error: false });
    } catch {
      setFeedback({
        text: uploaded.current
          ? "The image uploaded, but its details could not be saved. Try again to finish saving."
          : "The image could not be uploaded. Please try again.",
        error: true,
      });
    } finally {
      setPending(false);
    }
  }
  return { pending, feedback, submit, resetImage };
}
