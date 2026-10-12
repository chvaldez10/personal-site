"use client";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoImage from "@/components/ui/LogoImage";
import { IMAGE_TYPES } from "@/lib/validation/logoUpload";
import { useLogoUpload } from "./useLogoUpload";

export default function LogoManager() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  // Wait for browser authentication before reading private records.
  const logos = useQuery(
    api.brandLogos.listForAdmin,
    isAuthenticated ? {} : "skip",
  );
  const { pending, feedback, submit, resetImage } = useLogoUpload();
  if (isLoading) return <output>Connecting to your dashboard…</output>;
  if (!isAuthenticated) {
    return (
      <output>
        Your dashboard session is unavailable.{" "}
        <Link href="/login" className="underline">
          Sign in again
        </Link>
        .
      </output>
    );
  }
  return (
    <div className="space-y-8">
      <form
        onSubmit={submit}
        className="max-w-xl space-y-4"
        aria-busy={pending}
      >
        <h2 className="text-xl font-semibold">Add a logo</h2>
        <fieldset disabled={pending} className="space-y-4">
          <div>
            <Label htmlFor="logoImage">Image</Label>
            <Input
              id="logoImage"
              name="image"
              type="file"
              accept={IMAGE_TYPES.join(",")}
              onChange={resetImage}
              required
            />
          </div>
          <div>
            <Label htmlFor="logoLabel">Label</Label>
            <Input id="logoLabel" name="label" required maxLength={120} />
          </div>
          <div>
            <Label htmlFor="logoAlt">Image description</Label>
            <Input id="logoAlt" name="alt" required maxLength={250} />
          </div>
          <div>
            <Label htmlFor="logoDescription">Details</Label>
            <textarea
              id="logoDescription"
              name="description"
              required
              maxLength={2000}
              className="min-h-24 w-full rounded-md border border-input bg-transparent p-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
            />
          </div>
          <div>
            <Label htmlFor="logoLink">Website link (optional)</Label>
            <Input
              id="logoLink"
              name="referralLink"
              type="url"
              maxLength={2048}
              placeholder="https://example.com"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Uploading…" : "Upload logo"}
          </Button>
        </fieldset>
        <p
          aria-live="polite"
          aria-atomic="true"
          className={feedback?.error ? "text-sm text-destructive" : "text-sm"}
        >
          {feedback?.text}
        </p>
      </form>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Current logos</h2>
        {logos === undefined ? (
          <p>Loading logos…</p>
        ) : logos.length === 0 ? (
          <p>No logos yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {logos.map((logo) => (
              <li
                key={logo.id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <LogoImage src={logo.src} alt={logo.alt} />
                <div>
                  <p className="font-medium">{logo.label || logo.alt}</p>
                  <p className="text-sm text-muted-foreground">
                    {logo.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
