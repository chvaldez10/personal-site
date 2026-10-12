import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";

const geistSans = localFont({
  src: "./(main)/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./(main)/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
      <body
        className={[geistSans.variable, geistMono.variable, "antialiased"].join(
          " ",
        )}
      >
        <ConvexAuthNextjsServerProvider shouldHandleCode={false}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
