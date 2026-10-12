"use client";

import Link from "next/link";
import { Button } from "@/components/ui/buttons/button";

export default function LoginError({ retry }: { retry: () => void }) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Login unavailable</h1>
      <p>We couldn't load login. Please try again shortly.</p>
      <Button onClick={retry}>Try again</Button>
      <Link href="/" className="underline">
        Back to the site
      </Link>
    </section>
  );
}
