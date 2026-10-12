import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";
import { readPdf } from "@/lib/pdf";
export async function GET(request: Request) {
  const fallback = () =>
    NextResponse.redirect(new URL("/docs/resume.pdf", request.url));
  try {
    const deploymentURL = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!deploymentURL) return fallback();
    const client = new ConvexHttpClient(deploymentURL, {
      logger: false,
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }),
    });
    const url = await client.query(api.siteAssets.resume, {});
    if (!url) return fallback();
    const file = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    const bytes = await readPdf(file);
    if (!bytes) return fallback();
    const download = new URL(request.url).searchParams.get("download") === "1";
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          (download ? "attachment" : "inline") + '; filename="resume.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return fallback();
  }
}
