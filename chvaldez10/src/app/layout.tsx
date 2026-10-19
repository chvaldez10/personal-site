import type { Metadata } from "next";
import "@/styles/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Christian Valdez",
  description: "Personal website of Christian Valdez",
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
