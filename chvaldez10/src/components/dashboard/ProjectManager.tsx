"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/buttons/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectStatus } from "@/constants/projectData";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validation/logoUpload";
import { dashboardFieldClass } from "./formStyles";

const fieldClass = `${dashboardFieldClass} min-h-10`;
const statuses = [
  ProjectStatus.InProgress,
  ProjectStatus.Ideation,
  ProjectStatus.Maintenance,
];

function SectionEditor({ section }: { section: Doc<"projectSection"> }) {
  const updateSection = useMutation(api.projects.updateSection);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const values = new FormData(event.currentTarget);
    setPending(true);
    setFeedback("");
    try {
      await updateSection({
        heading: String(values.get("heading") ?? "").trim(),
        description: String(values.get("description") ?? "").trim(),
      });
      setFeedback("Section copy saved.");
    } catch {
      setFeedback("Could not save the section copy. Check both fields and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-orange-200 bg-white text-gray-950">
      <CardHeader>
        <h2 className="text-xl font-semibold">Section copy</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-4" aria-busy={pending}>
          <fieldset disabled={pending} className="space-y-4">
            <div>
              <Label htmlFor="projectHeading">Heading</Label>
              <Input
                id="projectHeading"
                name="heading"
                defaultValue={section.heading}
                required
                maxLength={120}
                className={fieldClass}
              />
            </div>
            <div>
              <Label htmlFor="projectIntro">Intro</Label>
              <textarea
                id="projectIntro"
                name="description"
                defaultValue={section.description}
                required
                maxLength={500}
                rows={3}
                className={`${fieldClass} w-full rounded-md border p-2 text-sm focus-visible:outline-hidden focus-visible:ring-1`}
              />
            </div>
            <Button type="submit">{pending ? "Saving…" : "Save section"}</Button>
          </fieldset>
          <output className="block text-sm text-gray-700">{feedback}</output>
        </form>
      </CardContent>
    </Card>
  );
}

function ProjectEditor({
  project,
  onSaved,
  onCancel,
}: {
  project?: Doc<"projects">;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const create = useMutation(api.projects.create);
  const update = useMutation(api.projects.update);
  const requestUpload = useAction(api.images.requestUpload);
  const completeUpload = useAction(api.images.completeProjectUpload);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("imageFile");
    const imageFile = file instanceof File && file.size ? file : null;
    if (imageFile && (!IMAGE_TYPES.includes(imageFile.type) || imageFile.size > MAX_IMAGE_BYTES)) {
      setFeedback("Choose a PNG, JPEG, GIF, WebP, or SVG up to 10 MB.");
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
        const ticket = await requestUpload({ filename: imageFile.name });
        const payload = new FormData();
        payload.set("file", imageFile);
        const response = await fetch(ticket.uploadURL, {
          method: "POST",
          body: payload,
          signal: AbortSignal.timeout(60000),
        });
        if (!response.ok) throw new Error("Image upload failed.");
        projectImage = await completeUpload({ imageId: ticket.imageId });
      }
      const details = {
        projectName: String(values.get("projectName") ?? "").trim(),
        projectDescription: String(values.get("projectDescription") ?? "").trim(),
        projectImage,
        projectGithub: String(values.get("projectGithub") ?? "").trim() || undefined,
        status: selectedStatus,
      };
      if (project) await update({ id: project._id, ...details });
      else await create(details);
      form.reset();
      onSaved();
    } catch {
      setFeedback("Could not save this project. Check the fields and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card id="project-editor" className="border-orange-200 bg-white text-gray-950">
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
              <Input id="projectName" name="projectName" defaultValue={project?.projectName} required maxLength={120} className={fieldClass} />
            </div>
            <div>
              <Label htmlFor="projectStatus">Status</Label>
              <select id="projectStatus" name="status" defaultValue={project?.status ?? ProjectStatus.InProgress} className={`${fieldClass} w-full rounded-md border px-3 text-sm`}>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="projectDescription">Description</Label>
              <textarea id="projectDescription" name="projectDescription" defaultValue={project?.projectDescription} required maxLength={1000} rows={4} className={`${fieldClass} w-full rounded-md border p-2 text-sm focus-visible:outline-hidden focus-visible:ring-1`} />
            </div>
            <div>
              <Label htmlFor="projectImage">Image URL or /images/ path</Label>
              <Input id="projectImage" name="projectImage" defaultValue={project?.projectImage} maxLength={2048} placeholder="https://…" className={fieldClass} />
              <p className="mt-1 text-xs text-gray-600">Keep the current image, or replace it with an upload.</p>
            </div>
            <div>
              <Label htmlFor="projectImageFile">Upload a new image</Label>
              <Input id="projectImageFile" name="imageFile" type="file" accept={IMAGE_TYPES.join(",")} className={fieldClass} />
              <p className="mt-1 text-xs text-gray-600">PNG, JPEG, GIF, WebP, or SVG, up to 10 MB. Upload takes priority over the URL.</p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="projectGithub">GitHub link (optional)</Label>
              <Input id="projectGithub" name="projectGithub" type="url" defaultValue={project?.projectGithub} maxLength={2048} placeholder="https://github.com/…" className={fieldClass} />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit">{pending ? "Saving…" : project ? "Save project" : "Add project"}</Button>
              {project && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            </div>
          </fieldset>
          <p className="text-sm text-red-700" role="alert">{feedback}</p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ProjectManager() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const data = useQuery(api.projects.listForAdmin, isAuthenticated ? {} : "skip");
  const importCurrent = useMutation(api.projects.importCurrent);
  const remove = useMutation(api.projects.remove);
  const move = useMutation(api.projects.move);
  const importRequested = useRef(false);
  const [importFailed, setImportFailed] = useState(false);
  const [editingId, setEditingId] = useState<Id<"projects"> | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !data || data.section || importRequested.current) return;
    importRequested.current = true;
    void importCurrent({}).catch(() => setImportFailed(true));
  }, [isAuthenticated, data, importCurrent]);

  if (isLoading) return <p>Connecting to your dashboard…</p>;
  if (!isAuthenticated) return <p>Your dashboard session is unavailable. <Link href="/login" className="underline">Sign in again</Link>.</p>;
  if (data === undefined) return <p>Loading projects…</p>;

  async function importProjects() {
    setPendingId("import");
    setImportFailed(false);
    try {
      await importCurrent({});
    } catch {
      setImportFailed(true);
    } finally {
      setPendingId(null);
    }
  }

  async function changeOrder(id: Id<"projects">, direction: "up" | "down") {
    setPendingId(id);
    setFeedback("");
    try {
      await move({ id, direction });
    } catch {
      setFeedback("Could not change the project order.");
    } finally {
      setPendingId(null);
    }
  }

  async function deleteProject(id: Id<"projects">, name: string) {
    if (!window.confirm(`Delete ${name}? This will remove it from the home page.`)) return;
    setPendingId(id);
    setFeedback("");
    try {
      await remove({ id });
      if (editingId === id) setEditingId(null);
      setFeedback("Project deleted.");
    } catch {
      setFeedback("Could not delete the project. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  if (!data.section) {
    return (
      <Card className="border-orange-200 bg-white text-gray-950">
        <CardHeader><h2 className="text-xl font-semibold">Current projects</h2></CardHeader>
        <CardContent className="space-y-4">
          {importFailed ? (
            <>
              <p className="text-sm text-red-700">Could not load the current projects into the editor.</p>
              <Button type="button" onClick={importProjects} disabled={pendingId === "import"}>{pendingId === "import" ? "Retrying…" : "Retry"}</Button>
            </>
          ) : <p className="text-sm text-gray-700">Getting your current projects ready to edit…</p>}
        </CardContent>
      </Card>
    );
  }

  const editing = data.projects.find((project) => project._id === editingId);
  return (
    <div className="space-y-6">
      <Card id="project-list" className="border-orange-200 bg-white text-gray-950">
        <CardHeader><h2 className="text-xl font-semibold">Current projects</h2></CardHeader>
        <CardContent>
          <output className="mb-4 block text-sm text-gray-700">{feedback}</output>
          {data.projects.length === 0 ? <p className="text-sm text-gray-700">No projects yet. Add one below.</p> : (
            <ul className="space-y-3">
              {data.projects.map((project) => {
                const peers = data.projects.filter((item) => item.status === project.status);
                const position = peers.findIndex((item) => item._id === project._id);
                return (
                  <li key={project._id} className="flex flex-col gap-3 rounded-lg border border-orange-200 bg-[#fffbf5] p-3 sm:flex-row sm:items-center">
                    <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-md bg-orange-50 sm:h-20 sm:w-28">
                      <Image src={project.projectImage} alt="" fill sizes="(max-width: 640px) 100vw, 112px" className="object-cover" unoptimized={project.projectImage.startsWith("https://")} />
                    </div>
                    <div className="min-w-0 grow">
                      <p className="font-semibold">{project.projectName}</p>
                      <p className="text-xs font-medium text-orange-800">{project.status}</p>
                      <p className="mt-1 text-sm text-gray-700">{project.projectDescription}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Button type="button" size="sm" variant="outline" onClick={() => {
                        setEditingId(project._id);
                        setFeedback("");
                        document.getElementById("project-editor")?.scrollIntoView();
                      }} disabled={pendingId !== null}>Edit</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => changeOrder(project._id, "up")} disabled={pendingId !== null || position === 0} aria-label={`Move ${project.projectName} up`}>↑</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => changeOrder(project._id, "down")} disabled={pendingId !== null || position === peers.length - 1} aria-label={`Move ${project.projectName} down`}>↓</Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => deleteProject(project._id, project.projectName)} disabled={pendingId !== null}>Delete</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
      <ProjectEditor
        key={editing?._id ?? "new"}
        project={editing}
        onSaved={() => {
          setEditingId(null);
          setFeedback("Project saved.");
          document.getElementById("project-list")?.scrollIntoView();
        }}
        onCancel={() => setEditingId(null)}
      />
      <SectionEditor section={data.section} />
    </div>
  );
}
