"use client";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import LogoUploadForm from "./LogoUploadForm";
import LogoList from "./LogoList";

export default function LogoManager() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  // Wait for browser authentication before reading private records.
  const logos = useQuery(
    api.brandLogos.listForAdmin,
    isAuthenticated ? {} : "skip",
  );
  if (isLoading) return <output>Connecting to your dashboard…</output>;
  if (!isAuthenticated) {
    return (
      <output>
        Your dashboard session is unavailable.{" "}
        <Link href="/login" className="underline">
          Sign in again
        </Link>
        .
      </output>
    );
  }
  return (
    <div className="space-y-8">
      <LogoUploadForm />
      <LogoList logos={logos} />
    </div>
  );
}
