import Link from "next/link";

const sections = [
  {
    href: "/dashboard/tech-finds",
    title: "Tech Finds",
    description: "Manage the logos shown on the home page.",
  },
  {
    href: "/dashboard/projects",
    title: "Projects",
    description: "Edit project cards, images, and section copy.",
  },
  {
    href: "/dashboard/tutoring-inquiries",
    title: "Tutoring inquiries",
    description: "View and manage tutoring inquiries.",
  },
];

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Choose a section to manage.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
