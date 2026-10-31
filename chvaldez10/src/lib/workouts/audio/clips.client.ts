import { z } from "zod";
import type { AudioRequest } from "./schema";
import { compactSpokenWav } from "./timeline";

const errorSchema = z.object({ error: z.string() });
const audioCacheName = "shadowboxing-coaching-audio-v1";

export function signature(request: AudioRequest) {
  return JSON.stringify(request);
}

async function audioDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Audio could not be read."));
    reader.onerror = () => reject(new Error("Audio could not be read."));
    reader.readAsDataURL(blob);
  });
}

export async function compactAudioSource(src: string): Promise<string> {
  try {
    const original = await (await fetch(src)).blob();
    const compacted = await compactSpokenWav(original);
    return compacted.size < original.size ? audioDataUrl(compacted) : src;
  } catch {
    return src;
  }
}

export async function cachedAudio(
  request: AudioRequest,
  provider: string,
  onProgress: (message: string) => void,
): Promise<string> {
  let cache: Cache | undefined;
  let cacheKey: Request | undefined;
  if ("caches" in window && crypto.subtle) {
    try {
      const encoded = new TextEncoder().encode(signature(request));
      const digest = await crypto.subtle.digest("SHA-256", encoded);
      const hash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      cacheKey = new Request(
        `${location.origin}/hobbies/mma?audio-cache=${hash}`,
      );
      cache = await caches.open(audioCacheName);
      const saved = await cache.match(cacheKey);
      if (saved) {
        const original = await saved.blob();
        let compacted = original;
        try {
          compacted = await compactSpokenWav(original);
        } catch {
          // Keep a usable cached clip rather than spending another request.
        }
        if (compacted.size < original.size) {
          try {
            await cache.put(
              cacheKey,
              new Response(compacted, {
                headers: { "Content-Type": "audio/wav" },
              }),
            );
          } catch {
            // The compacted clip can still be used without updating storage.
          }
        }
        return audioDataUrl(compacted);
      }
    } catch {
      cache = undefined;
    }
  }

  let blob: Blob;
  if (provider === "kokoro") {
    const { generateKokoroAudio } = await import("./kokoro.client");
    blob = await generateKokoroAudio(request, onProgress);
  } else {
    const response = await fetch("/api/workouts/audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: signature(request),
    });
    if (!response.ok) {
      const parsed = errorSchema.safeParse(
        await response.json().catch(() => null),
      );
      throw new Error(
        parsed.success
          ? parsed.data.error
          : "Coaching audio could not be generated. Try again.",
      );
    }
    blob = await response.blob();
  }
  if (blob.type !== "audio/wav")
    throw new Error("The voice service returned invalid audio.");
  let compacted = blob;
  try {
    compacted = await compactSpokenWav(blob);
  } catch {
    // Playback can still use the original voice clip.
  }
  if (cache && cacheKey) {
    try {
      await cache.put(
        cacheKey,
        new Response(compacted, { headers: { "Content-Type": "audio/wav" } }),
      );
    } catch {
      // Audio can still be previewed if browser storage is unavailable.
    }
  }
  return audioDataUrl(compacted);
}
