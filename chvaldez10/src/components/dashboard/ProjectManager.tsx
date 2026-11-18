"use client";

import { useRef, useState, type SubmitEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useConvexAuth,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/buttons/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PaginatedListFooter from "@/components/ui/PaginatedListFooter";
import ProjectEditor from "./ProjectEditor";
import { dashboardFieldClass } from "./formStyles";

const fieldClass = `${dashboardFieldClass} min-h-10`;
const pageSize = 20;

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

export default function ProjectManager() {
  const listRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { isLoading, isAuthenticated } = useConvexAuth();
  const section = useQuery(
    api.projects.sectionForAdmin,
    isAuthenticated ? {} : "skip",
  );
  const { results: projects, status, loadMore } = usePaginatedQuery(
    api.projects.pageForAdmin,
    isAuthenticated ? {} : "skip",
    { initialNumItems: pageSize },
  );
  const importCurrent = useMutation(api.projects.importCurrent);
  const remove = useMutation(api.projects.remove);
  const move = useMutation(api.projects.move);
  const [importFailed, setImportFailed] = useState(false);
  const [editingId, setEditingId] = useState<Id<"projects"> | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  if (isLoading) return <p>Connecting to your dashboard…</p>;
  if (!isAuthenticated) return <p>Your dashboard session is unavailable. <Link href="/login" className="underline">Sign in again</Link>.</p>;
  if (section === undefined || status === "LoadingFirstPage") return <p>Loading projects…</p>;

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

  if (!section) {
    return (
      <Card className="border-orange-200 bg-white text-gray-950">
        <CardHeader><h2 className="text-xl font-semibold">Current projects</h2></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">Import the current home page cards to start editing them. This saves a copy in your database.</p>
          {importFailed && <p role="alert" className="text-sm text-red-700">Could not import the current projects. Please try again.</p>}
          <Button type="button" onClick={importProjects} disabled={pendingId === "import"}>{pendingId === "import" ? "Importing…" : "Import current projects"}</Button>
        </CardContent>
      </Card>
    );
  }

  const editing = projects.find((project) => project._id === editingId);
  const boundsByStatus = new Map<
    Doc<"projects">["status"],
    { first: Id<"projects">; last: Id<"projects"> }
  >();
  for (const { status, _id } of projects) {
    const bounds = boundsByStatus.get(status);
    if (bounds) bounds.last = _id;
    else boundsByStatus.set(status, { first: _id, last: _id });
  }
  return (
    <div className="space-y-6">
      <Card ref={listRef} id="project-list" className="border-orange-200 bg-white text-gray-950">
        <CardHeader><h2 className="text-xl font-semibold">Current projects</h2></CardHeader>
        <CardContent>
          <output className="mb-4 block text-sm text-gray-700">{feedback}</output>
          {projects.length === 0 ? <p className="text-sm text-gray-700">No projects yet. Add one below.</p> : (
            <ul className="space-y-3">
              {projects.map((project) => {
                const bounds = boundsByStatus.get(project.status);
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
                        editorRef.current?.scrollIntoView();
                      }} disabled={pendingId !== null}>Edit</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => changeOrder(project._id, "up")} disabled={pendingId !== null || project._id === bounds?.first} aria-label={`Move ${project.projectName} up`}>↑</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => changeOrder(project._id, "down")} disabled={pendingId !== null || (status === "Exhausted" && project._id === bounds?.last)} aria-label={`Move ${project.projectName} down`}>↓</Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => deleteProject(project._id, project.projectName)} disabled={pendingId !== null}>Delete</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <PaginatedListFooter
            status={status}
            count={projects.length}
            itemLabel="projects"
            onLoadMore={() => loadMore(pageSize)}
          />
        </CardContent>
      </Card>
      <ProjectEditor
        key={editing?._id ?? "new"}
        ref={editorRef}
        project={editing}
        onSaved={() => {
          setEditingId(null);
          setFeedback("Project saved.");
          listRef.current?.scrollIntoView();
        }}
        onCancel={() => setEditingId(null)}
      />
      <SectionEditor section={section} />
    </div>
  );
}
