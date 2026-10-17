import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import DashboardNav from "@/components/dashboard/DashboardNav";
import SignOut from "@/components/ui/forms/SignOut";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await convexAuthNextjsToken();
  const owner = token
    ? await fetchQuery(api.admin.current, {}, { token })
    : null;
  if (!owner) redirect("/login");

  return (
    <div className="min-h-screen bg-[#fffbf5] text-gray-950 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-orange-100 bg-white px-5 py-8 lg:flex lg:flex-col">
        <Link
          href="/dashboard"
          className="text-xl font-semibold tracking-tight"
        >
          Dashboard
        </Link>
        <p className="mt-1 truncate text-sm text-gray-600">{owner.email}</p>
        <div className="mt-10 flex-1">
          <DashboardNav />
        </div>
        <div className="space-y-4 border-t border-orange-100 pt-5">
          <Link
            href="/"
            className="text-sm text-gray-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-orange-700"
          >
            Back to the site
          </Link>
          <SignOut />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-orange-100 bg-white px-4 py-3 lg:hidden">
          <Link href="/dashboard" className="text-lg font-semibold">
            Dashboard
          </Link>
          <DashboardNav mobile />
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
