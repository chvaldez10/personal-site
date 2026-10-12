export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function readPdf(response: Response): Promise<ArrayBuffer | null> {
  if (
    !response.ok ||
    response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
      "application/pdf" ||
    Number(response.headers.get("content-length") || 0) > MAX_PDF_BYTES ||
    !response.body
  ) {
    await response.body?.cancel();
    return null;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_PDF_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-"
    ? bytes.buffer
    : null;
}
