import Link from "next/link";
import KpopManager from "@/components/dashboard/KpopManager";
import { Button } from "@/components/ui/buttons/button";

export default function KpopDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">K-pop</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage the groups and song previews on your K-pop page.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/hobbies/k-pop#songs">View public page</Link>
        </Button>
      </div>
      <KpopManager />
    </section>
  );
}
