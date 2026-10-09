"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RiMenu5Fill } from "react-icons/ri";
import { Button } from "@/components/ui/buttons/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { navlinks } from "@/constants/navlinks";
import styles from "./navbar.module.css";

function NavbarLogo() {
  return (
    <Link
      href="/"
      className="hover-scale-effect"
      aria-label="Christian Valdez home"
    >
      <Image
        src="/images/rice-bowl.png"
        alt=""
        width={48}
        height={48}
        quality={100}
      />
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="fixed top-0 z-50 flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <RiMenu5Fill className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Explore the sections of Christian's personal site.
          </SheetDescription>
          <NavbarLogo />
          <nav aria-label="Mobile" className="grid gap-4 py-6">
            {navlinks.map(({ href, label }) => (
              <Link
                key={href}
                href={"/#" + href}
                onClick={() => setMobileOpen(false)}
                className={
                  styles.clientNavbar +
                  " flex w-full items-center px-4 text-lg font-semibold"
                }
                data-replace={label}
              >
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="mx-auto hidden items-center gap-4 md:flex">
        <NavbarLogo />
        <nav aria-label="Main" className="flex gap-6">
          {navlinks.map(({ href, label }) => (
            <Link
              key={href}
              href={"/#" + href}
              className={
                styles.clientNavbar +
                " inline-flex items-center rounded-md px-4 text-center text-sm font-medium"
              }
              data-replace={label}
            >
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
