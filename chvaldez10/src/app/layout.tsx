import type { Metadata } from "next";
import "@/styles/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Christian Valdez | Software QA Analyst",
  description:
    "Christian Valdez is a software QA analyst who builds, tests, and improves useful things. Explore his work, interests, and ideas in progress.",
  openGraph: {
    title: "Christian Valdez | Software QA Analyst",
    description:
      "A personal workspace for building useful things, testing the details, and sharing ideas in progress.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConvexAuthNextjsServerProvider shouldHandleCode={false}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
