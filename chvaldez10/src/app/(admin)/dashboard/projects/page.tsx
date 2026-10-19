import ProjectManager from "@/components/dashboard/ProjectManager";

export default function ProjectsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="text-sm text-gray-700">
        Edit the projects section on your home page.
      </p>
      <ProjectManager />
    </section>
  );
}
