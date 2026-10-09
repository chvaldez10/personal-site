const localLogos = new Set([
  "aldente.png",
  "arc.svg",
  "browser-stack.svg",
  "canva.svg",
  "coda.svg",
  "color-hunt.svg",
  "cursor.png",
  "logitech.svg",
  "open-ai.svg",
  "raycast.svg",
  "supabase.svg",
  "warp.svg",
  "youtube.svg",
  "youtube-music.svg",
  "zen.svg",
]);

// These local files were verified byte-for-byte against the original public objects.
export function localLogoSource(source: string): string {
  try {
    const url = new URL(source);
    const prefix = "/storage/v1/object/public/meda/logos/";
    if (
      url.origin !== "https://dvxqlvpokfujnpdwfuom.supabase.co" ||
      !url.pathname.startsWith(prefix)
    )
      return source;
    const filename = url.pathname.slice(prefix.length);
    return localLogos.has(filename) ? "/logos/" + filename : source;
  } catch {
    return source;
  }
}
