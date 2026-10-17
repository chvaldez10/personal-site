import LogoManager from "@/components/dashboard/LogoManager";

export default function TechFindsPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Tech Finds</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage the logos shown on the home page.
        </p>
      </div>
      <LogoManager />
    </section>
  );
}
