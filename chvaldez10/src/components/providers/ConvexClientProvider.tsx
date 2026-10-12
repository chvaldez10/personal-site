"use client";
import { useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("Convex is not configured.");
    return new ConvexReactClient(url);
  });
  return (
    <ConvexAuthNextjsProvider client={client}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
