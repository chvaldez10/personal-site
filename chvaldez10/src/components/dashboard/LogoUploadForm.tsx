"use client";

import { Button } from "@/components/ui/buttons/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IMAGE_TYPES } from "@/lib/validation/logoUpload";
import { dashboardFieldClass as fieldClass } from "./formStyles";
import { useLogoUpload } from "./useLogoUpload";

export default function LogoUploadForm() {
  const { pending, feedback, submit, resetImage } = useLogoUpload();

  return (
    <Card className="border-orange-200 bg-white text-gray-950">
      <CardHeader>
        <h2 id="add-logo-title" className="text-xl font-semibold">
          Add a logo
        </h2>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={submit}
          aria-busy={pending}
          aria-labelledby="add-logo-title"
        >
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
                className={`${fieldClass} min-h-10`}
              />
            </div>
            <div>
              <Label htmlFor="logoLabel">Label</Label>
              <Input
                id="logoLabel"
                name="label"
                required
                maxLength={120}
                className={`${fieldClass} min-h-10`}
              />
            </div>
            <div>
              <Label htmlFor="logoAlt">Image description</Label>
              <Input
                id="logoAlt"
                name="alt"
                required
                maxLength={250}
                className={`${fieldClass} min-h-10`}
              />
            </div>
            <div>
              <Label htmlFor="logoDescription">Details</Label>
              <textarea
                id="logoDescription"
                name="description"
                required
                maxLength={2000}
                className={`${fieldClass} min-h-24 w-full rounded-md border p-2 text-sm focus-visible:outline-hidden focus-visible:ring-1`}
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
                className={`${fieldClass} min-h-10`}
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Uploading…" : "Upload logo"}
            </Button>
          </fieldset>
          <p
            aria-live="polite"
            aria-atomic="true"
            className={
              feedback?.error
                ? "mt-4 text-sm text-red-700"
                : "mt-4 text-sm text-gray-700"
            }
          >
            {feedback?.text}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
