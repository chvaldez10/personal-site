import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import schema from "./schema";
import { requireOwner } from "./permissions";
import {
  projectData,
  projectSectionDefaults,
  ProjectStatus,
} from "../src/constants/projectData";

const sectionName = "home";
const status = v.union(
  v.literal(ProjectStatus.InProgress),
  v.literal(ProjectStatus.Ideation),
  v.literal(ProjectStatus.Maintenance),
);
const result = v.object({
  section: v.union(schema.doc("projectSection"), v.null()),
  projects: v.array(schema.doc("projects")),
});

async function readProjects(ctx: QueryCtx) {
  const section = await ctx.db
    .query("projectSection")
    .withIndex("by_name", (q) => q.eq("name", sectionName))
    .unique();
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_sortOrder")
    .take(100);
  return { section, projects };
}

function requiredText(value: string, label: string, max: number) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max)
    throw new ConvexError(`${label} must be 1–${max} characters.`);
  return trimmed;
}

function imageSource(value: string) {
  const source = requiredText(value, "Image", 2048);
  if (/^\/images\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|gif|svg)$/.test(source))
    return source;
  try {
    const url = new URL(source);
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.hash
    )
      return source;
  } catch {
    // Show the same field error for malformed and unsupported URLs.
  }
  throw new ConvexError("Use an uploaded image, an HTTPS image URL, or /images/ path.");
}

function githubLink(value: string | undefined) {
  const link = value?.trim();
  if (!link) return undefined;
  if (link.length > 2048) throw new ConvexError("GitHub link is too long.");
  try {
    const url = new URL(link);
    if (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      !url.username &&
      !url.password
    )
      return link;
  } catch {
    // Show the same field error for malformed and unsupported URLs.
  }
  throw new ConvexError("Use an HTTPS github.com link.");
}

export const list = query({
  args: {},
  returns: result,
  handler: readProjects,
});

export const listForAdmin = query({
  args: {},
  returns: result,
  handler: async (ctx) => {
    await requireOwner(ctx);
    return readProjects(ctx);
  },
});

export const importCurrent = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requireOwner(ctx);
    const existing = await ctx.db
      .query("projectSection")
      .withIndex("by_name", (q) => q.eq("name", sectionName))
      .unique();
    if (existing) return null;
    const firstProject = await ctx.db.query("projects").first();
    if (firstProject) throw new ConvexError("Projects already exist.");
    await ctx.db.insert("projectSection", {
      name: sectionName,
      ...projectSectionDefaults,
    });
    let sortOrder = 0;
    for (const projectStatus of [
      ProjectStatus.InProgress,
      ProjectStatus.Ideation,
      ProjectStatus.Maintenance,
    ]) {
      for (const project of projectData[projectStatus]) {
        await ctx.db.insert("projects", {
          ...project,
          status: projectStatus,
          sortOrder: sortOrder++,
        });
      }
    }
    return null;
  },
});

export const updateSection = mutation({
  args: { heading: v.string(), description: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const section = await ctx.db
      .query("projectSection")
      .withIndex("by_name", (q) => q.eq("name", sectionName))
      .unique();
    if (!section) throw new ConvexError("Import the current projects first.");
    await ctx.db.patch("projectSection", section._id, {
      heading: requiredText(args.heading, "Heading", 120),
      description: requiredText(args.description, "Intro", 500),
    });
    return null;
  },
});

const projectArgs = {
  projectName: v.string(),
  projectDescription: v.string(),
  projectImage: v.string(),
  projectGithub: v.optional(v.string()),
  status,
};

function validatedProject(args: {
  projectName: string;
  projectDescription: string;
  projectImage: string;
  projectGithub?: string;
  status: "Building" | "Ideas" | "Maintaining";
}) {
  return {
    projectName: requiredText(args.projectName, "Name", 120),
    projectDescription: requiredText(args.projectDescription, "Description", 1000),
    projectImage: imageSource(args.projectImage),
    projectGithub: githubLink(args.projectGithub),
    status: args.status,
  };
}

export const create = mutation({
  args: projectArgs,
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const section = await ctx.db
      .query("projectSection")
      .withIndex("by_name", (q) => q.eq("name", sectionName))
      .unique();
    if (!section) throw new ConvexError("Import the current projects first.");
    const rows = await ctx.db
      .query("projects")
      .withIndex("by_sortOrder")
      .take(100);
    if (rows.length >= 100)
      throw new ConvexError("The projects section is full.");
    const last = await ctx.db
      .query("projects")
      .withIndex("by_sortOrder")
      .order("desc")
      .first();
    return ctx.db.insert("projects", {
      ...validatedProject(args),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    });
  },
});

export const update = mutation({
  args: { id: v.id("projects"), ...projectArgs },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    await ctx.db.patch("projects", args.id, validatedProject(args));
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requireOwner(ctx);
    await ctx.db.delete("projects", id);
    return null;
  },
});

export const move = mutation({
  args: { id: v.id("projects"), direction: v.union(v.literal("up"), v.literal("down")) },
  returns: v.null(),
  handler: async (ctx, { id, direction }) => {
    await requireOwner(ctx);
    const project = await ctx.db.get("projects", id);
    if (!project) throw new ConvexError("Project not found.");
    const rows = await ctx.db.query("projects").withIndex("by_sortOrder").take(100);
    const sameStatus = rows.filter((row) => row.status === project.status);
    const position = sameStatus.findIndex((row) => row._id === id);
    const neighbor = sameStatus[position + (direction === "up" ? -1 : 1)];
    if (!neighbor) return null;
    await ctx.db.patch("projects", project._id, { sortOrder: neighbor.sortOrder });
    await ctx.db.patch("projects", neighbor._id, { sortOrder: project.sortOrder });
    return null;
  },
});
