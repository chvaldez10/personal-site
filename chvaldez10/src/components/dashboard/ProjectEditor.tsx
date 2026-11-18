"use client";

import { useRef, useState, type Ref, type SubmitEvent } from "react";
import { useAction, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import type { Doc } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/buttons/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectStatus } from "@/constants/projectData";
import {
  IMAGE_TYPES,
  isSupportedImage,
  unsupportedImageMessage,
  uploadImageFile,
} from "@/lib/images/upload.client";
import { dashboardFieldClass } from "./formStyles";

const fieldClass = `${dashboardFieldClass} min-h-10`;
const statuses = Object.values(ProjectStatus);

export default function ProjectEditor({
  ref,
  project,
  onSaved,
  onCancel,
}: {
  ref?: Ref<HTMLDivElement>;
  project?: Doc<"projects">;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const create = useMutation(api.projects.create);
  const update = useMutation(api.projects.update);
  const requestUpload = useAction(api.images.requestUpload);
  const completeUpload = useAction(api.images.completeProjectUpload);
  const verifiedUpload = useRef<string | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("imageFile");
    const imageFile = file instanceof File && file.size ? file : null;
    if (imageFile && !isSupportedImage(imageFile)) {
      setFeedback(unsupportedImageMessage);
      return;
    }
    let projectImage = String(values.get("projectImage") ?? "").trim();
    if (!projectImage && !imageFile) {
      setFeedback("Add an image URL or choose an image to upload.");
      return;
    }
    const selectedStatus = statuses.find(
      (status) => status === String(values.get("status")),
    );
    if (!selectedStatus) {
      setFeedback("Choose a project status.");
      return;
    }
    setPending(true);
    setFeedback("");
    try {
      if (imageFile) {
        if (!verifiedUpload.current) {
          const ticket = await requestUpload({ filename: imageFile.name });
          await uploadImageFile(imageFile, ticket.uploadURL);
          verifiedUpload.current = await completeUpload({
            imageId: ticket.imageId,
          });
        }
        projectImage = verifiedUpload.current;
      }
      const details = {
        projectName: String(values.get("projectName") ?? "").trim(),
        projectDescription: String(
          values.get("projectDescription") ?? "",
        ).trim(),
        projectImage,
        projectGithub:
          String(values.get("projectGithub") ?? "").trim() || undefined,
        status: selectedStatus,
      };
      if (project) await update({ id: project._id, ...details });
      else await create(details);
      form.reset();
      verifiedUpload.current = null;
      onSaved();
    } catch (error) {
      setFeedback(
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : "Could not save this project. Check the fields and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card
      ref={ref}
      id="project-editor"
      className="border-orange-200 bg-white text-gray-950"
    >
      <CardHeader>
        <h2 className="text-xl font-semibold">
          {project ? `Edit ${project.projectName}` : "Add a project"}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} aria-busy={pending} className="space-y-4">
          <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="projectName">Name</Label>
              <Input
                id="projectName"
                name="projectName"
                defaultValue={project?.projectName}
                required
                maxLength={120}
                className={fieldClass}
              />
            </div>
            <div>
              <Label htmlFor="projectStatus">Status</Label>
              <select
                id="projectStatus"
                name="status"
                defaultValue={project?.status ?? ProjectStatus.InProgress}
                className={`${fieldClass} w-full rounded-md border px-3 text-sm`}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="projectDescription">Description</Label>
              <textarea
                id="projectDescription"
                name="projectDescription"
                defaultValue={project?.projectDescription}
                required
                maxLength={1000}
                rows={4}
                className={`${fieldClass} w-full rounded-md border p-2 text-sm focus-visible:outline-hidden focus-visible:ring-1`}
              />
            </div>
            <div>
              <Label htmlFor="projectImage">Image URL or /images/ path</Label>
              <Input
                id="projectImage"
                name="projectImage"
                defaultValue={project?.projectImage}
                maxLength={2048}
                placeholder="https://…"
                className={fieldClass}
              />
              <p className="mt-1 text-xs text-gray-600">
                Keep the current image, or replace it with an upload.
              </p>
            </div>
            <div>
              <Label htmlFor="projectImageFile">Upload a new image</Label>
              <Input
                id="projectImageFile"
                name="imageFile"
                type="file"
                accept={IMAGE_TYPES.join(",")}
                onChange={() => {
                  verifiedUpload.current = null;
                }}
                className={fieldClass}
              />
              <p className="mt-1 text-xs text-gray-600">
                PNG, JPEG, GIF, WebP, or SVG, up to 10 MB. Upload takes priority
                over the URL.
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="projectGithub">GitHub link (optional)</Label>
              <Input
                id="projectGithub"
                name="projectGithub"
                type="url"
                defaultValue={project?.projectGithub}
                maxLength={2048}
                placeholder="https://github.com/…"
                className={fieldClass}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit">
                {pending ? "Saving…" : project ? "Save project" : "Add project"}
              </Button>
              {project && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </fieldset>
          <p className="text-sm text-red-700" role="alert">
            {feedback}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
