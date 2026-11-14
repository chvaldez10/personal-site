"use server";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import {
  itunesPreviewUrl,
  itunesStoreUrl,
  type ItunesTrack,
} from "@/lib/itunes/track";

const catalogSong = z.object({
  kind: z.literal("song"),
  trackId: z.number().int().positive(),
  trackName: z.string().trim().min(1).max(300),
  artistName: z.string().trim().min(1).max(300),
  collectionName: z.string().max(300).optional(),
  previewUrl: z.string().max(2048),
  trackViewUrl: z.string().max(2048),
});

export async function searchItunes(
  term: string,
): Promise<{ tracks: ItunesTrack[] } | { error: string }> {
  const search = z.string().trim().min(2).max(200).safeParse(term);
  if (!search.success) return { error: "Enter 2–200 characters to search." };

  try {
    const token = await convexAuthNextjsToken();
    if (!token || !(await fetchQuery(api.admin.current, {}, { token }))) {
      return { error: "Sign in to the dashboard to search iTunes." };
    }
    const url = new URL("https://itunes.apple.com/search");
    url.search = new URLSearchParams({
      term: search.data,
      country: "CA",
      media: "music",
      entity: "song",
      limit: "15",
    }).toString();
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok)
      throw new Error(`iTunes returned HTTP ${response.status}`);
    const { results } = z
      .object({ results: z.array(z.unknown()) })
      .parse(await response.json());
    const tracks = new Map<number, ItunesTrack>();
    for (const result of results.slice(0, 15)) {
      const parsed = catalogSong.safeParse(result);
      if (!parsed.success) continue;
      const song = parsed.data;
      const previewUrl = itunesPreviewUrl(song.previewUrl);
      if (!previewUrl || !itunesStoreUrl(song.trackViewUrl, song.trackId))
        continue;
      tracks.set(song.trackId, {
        trackId: song.trackId,
        title: song.trackName,
        artist: song.artistName,
        album: song.collectionName ?? "",
        previewUrl,
        storeUrl: song.trackViewUrl,
      });
    }
    return { tracks: [...tracks.values()] };
  } catch (error) {
    console.error("iTunes search failed", error);
    return { error: "iTunes search is unavailable. Please try again." };
  }
}
