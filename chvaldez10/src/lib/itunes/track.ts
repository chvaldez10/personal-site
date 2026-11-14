import { v } from "convex/values";

export const itunesTrack = v.object({
  trackId: v.number(),
  title: v.string(),
  artist: v.string(),
  album: v.string(),
  previewUrl: v.string(),
  storeUrl: v.string(),
});

export type ItunesTrack = typeof itunesTrack.type;

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function itunesPreviewUrl(value: string) {
  const url = parseUrl(value);
  if (
    url?.origin !== "https://audio-ssl.itunes.apple.com" ||
    url.username ||
    url.password ||
    !/^\/itunes-assets\/AudioPreview\d*\/.+\.m4a$/.test(url.pathname)
  )
    return null;
  return url.href;
}

export function itunesStoreUrl(value: string, trackId: number) {
  const url = parseUrl(value);
  if (
    url?.origin !== "https://music.apple.com" ||
    url.username ||
    url.password ||
    !/^\/ca\/album\/.+\/\d+$/.test(url.pathname) ||
    url.searchParams.get("i") !== String(trackId)
  )
    return null;
  return `https://geo.itunes.apple.com${url.pathname}?i=${trackId}&app=itunes`;
}
