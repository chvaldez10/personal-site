import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import SignOut from "@/components/ui/forms/SignOut";
import LogoManager from "@/components/dashboard/LogoManager";
export default async function DashboardPage() {
  const token = await convexAuthNextjsToken();
  const owner = token
    ? await fetchQuery(api.admin.current, {}, { token })
    : null;
  if (!owner) redirect("/login");
  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">{owner.email}</p>
        </div>
        <SignOut />
      </div>
      <LogoManager />
      <Link href="/" className="underline">
        Back to the site
      </Link>
    </section>
  );
}
