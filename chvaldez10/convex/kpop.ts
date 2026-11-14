import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireOwner } from "./permissions";
import {
  itunesPreviewUrl,
  itunesStoreUrl,
  itunesTrack,
} from "../src/lib/itunes/track";

const maxGroups = 50;
const maxSongsPerGroup = 30;

function groupName(value: string) {
  const name = value.trim();
  if (!name || name.length > 100) {
    throw new ConvexError("Group name must be 1–100 characters.");
  }
  return name;
}

async function getGroup(ctx: MutationCtx, id: Id<"kpopGroups">) {
  const group = await ctx.db.get("kpopGroups", id);
  if (!group) throw new ConvexError("That group no longer exists.");
  return group;
}

export const listGroups = query({
  args: {},
  handler: async (ctx) => {
    const groups = await ctx.db.query("kpopGroups").take(maxGroups);
    return groups
      .map(({ _id, name, songs }) => ({ _id, name, songs }))
      .sort((first, second) => first.name.localeCompare(second.name));
  },
});

export const saveGroup = mutation({
  args: { id: v.optional(v.id("kpopGroups")), name: v.string() },
  handler: async (ctx, { id, name: value }) => {
    await requireOwner(ctx);
    const name = groupName(value);
    const nameKey = name.toLowerCase();
    const existing = await ctx.db
      .query("kpopGroups")
      .withIndex("by_nameKey", (q) => q.eq("nameKey", nameKey))
      .unique();
    if (existing && existing._id !== id) {
      throw new ConvexError("A group with that name already exists.");
    }
    if (id) {
      await getGroup(ctx, id);
      await ctx.db.patch("kpopGroups", id, { name, nameKey });
      return id;
    }
    const groups = await ctx.db.query("kpopGroups").take(maxGroups);
    if (groups.length === maxGroups) {
      throw new ConvexError(`You can feature up to ${maxGroups} groups.`);
    }
    return ctx.db.insert("kpopGroups", { name, nameKey, songs: [] });
  },
});

export const removeGroup = mutation({
  args: { id: v.id("kpopGroups") },
  handler: async (ctx, { id }) => {
    await requireOwner(ctx);
    if (await ctx.db.get("kpopGroups", id))
      await ctx.db.delete("kpopGroups", id);
  },
});

export const addSong = mutation({
  args: { id: v.id("kpopGroups"), song: itunesTrack },
  handler: async (ctx, { id, song }) => {
    await requireOwner(ctx);
    const { songs } = await getGroup(ctx, id);
    if (
      !Number.isSafeInteger(song.trackId) ||
      song.trackId < 1 ||
      [song.title, song.artist].some(
        (value) => !value.trim() || value.length > 300,
      ) ||
      song.album.length > 300 ||
      song.previewUrl.length > 2048 ||
      !itunesPreviewUrl(song.previewUrl) ||
      song.storeUrl.length > 2048 ||
      !itunesStoreUrl(song.storeUrl, song.trackId)
    )
      throw new ConvexError("Choose a song with an available iTunes preview.");

    if (songs.some(({ trackId }) => trackId === song.trackId)) return;
    if (songs.length === maxSongsPerGroup) {
      throw new ConvexError(
        `You can feature up to ${maxSongsPerGroup} songs per group.`,
      );
    }
    await ctx.db.patch("kpopGroups", id, { songs: [...songs, song] });
  },
});

export const removeSong = mutation({
  args: { id: v.id("kpopGroups"), trackId: v.number() },
  handler: async (ctx, { id, trackId }) => {
    await requireOwner(ctx);
    const { songs } = await getGroup(ctx, id);
    await ctx.db.patch("kpopGroups", id, {
      songs: songs.filter((song) => song.trackId !== trackId),
    });
  },
});
