import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-20 border-t border-orange-200 bg-[#fff8ed]"
    >
      <div className="home-container py-16 sm:py-20">
        <p className="text-xs font-bold tracking-[0.18em] text-orange-800 uppercase">
          Let&apos;s keep in touch
        </p>
        <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-5xl">
              Good things start with a hello.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-gray-700">
              Have a question about QA, an idea to share, or just want to chat?
              I&apos;d be happy to hear from you.
            </p>
          </div>
          <a
            href="mailto:christianvaldez021@gmail.com"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-orange-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-700 sm:self-auto"
            style={{ color: "white" }}
          >
            Send an email
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-orange-200 pt-6 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <p>Christian Valdez · Building and testing useful things.</p>
          <nav aria-label="Contact links" className="flex flex-wrap gap-x-5 gap-y-3">
            <Link
              href="https://www.linkedin.com/in/chvaldez10/"
              className="font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            >
              LinkedIn
            </Link>
            <Link
              href="https://github.com/chvaldez10"
              className="font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            >
              GitHub
            </Link>
            <Link
              href="/api/resume"
              className="font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            >
              Résumé
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
