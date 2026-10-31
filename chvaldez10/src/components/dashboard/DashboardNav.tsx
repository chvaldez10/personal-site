"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/buttons/button";
import SignOut from "@/components/ui/forms/SignOut";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/tech-finds", label: "Tech Finds" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/workouts", label: "Shadowboxing sessions" },
  { href: "/dashboard/tutoring-inquiries", label: "Tutoring inquiries" },
];

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        const link = (
          <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700",
              active
                ? "bg-orange-100 text-orange-950"
                : "text-gray-700 hover:bg-orange-50 hover:text-gray-950",
            )}
          >
            {label}
          </Link>
        );
        return mobile ? (
          <SheetClose asChild key={href}>
            {link}
          </SheetClose>
        ) : (
          <div key={href}>{link}</div>
        );
      })}
    </nav>
  );
}

export default function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  if (!mobile) return <NavLinks />;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open dashboard navigation"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-white text-gray-950">
        <SheetHeader className="mb-8 text-left">
          <SheetTitle>Dashboard</SheetTitle>
        </SheetHeader>
        <NavLinks mobile />
        <div className="mt-8 border-t border-orange-100 pt-5">
          <SheetClose asChild>
            <Link
              href="/"
              className="text-sm text-gray-700 underline-offset-4 hover:underline"
            >
              Back to the site
            </Link>
          </SheetClose>
          <div className="mt-5">
            <SignOut />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
