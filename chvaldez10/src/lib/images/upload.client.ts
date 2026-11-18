const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const unsupportedImageMessage =
  "Choose a PNG, JPEG, GIF, WebP, or SVG up to 10 MB.";

export function isSupportedImage(file: File) {
  return IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES;
}

export async function uploadImageFile(file: File, uploadUrl: string) {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch(uploadUrl, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error("Image upload failed.");
}
