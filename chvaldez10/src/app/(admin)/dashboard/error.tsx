"use client";

import Link from "next/link";
import { Button } from "@/components/ui/buttons/button";

export default function DashboardError({ retry }: { retry: () => void }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard unavailable</h1>
      <p>We couldn't load your dashboard. Please try again or sign in again.</p>
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={retry}>Try again</Button>
        <Link href="/login" className="underline">
          Sign in again
        </Link>
      </div>
    </section>
  );
}
