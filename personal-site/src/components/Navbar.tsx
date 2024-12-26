"use client";

import { FC } from "react";
import { Link } from "react-scroll";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RiMenu5Fill } from "react-icons/ri";
import { navlinks } from "@/data/navlinks";
import { NavbarLinks } from "@/types/shared";

const Navbar: FC = () => {
  return (
    <header className="sticky top-0 flex h-20 w-full shrink-0 items-center px-4 md:px-6 ">
      {/* Mobile Navigation Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <RiMenu5Fill className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="transition-all duration-300">
          <div className="grid gap-2 py-6 text-center lg:text-left">
            {navlinks.map((navlink: NavbarLinks) => (
              <MobileNavbarLinkItem
                key={navlink.href}
                href={navlink.href}
                label={navlink.label}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex gap-6 mx-auto" id="desktop-nav">
        {navlinks.map((navlink: NavbarLinks) => (
          <DesktopNavbarLinkItem
            key={navlink.href}
            href={navlink.href}
            label={navlink.label}
          />
        ))}
      </nav>
    </header>
  );
};

export default Navbar;

const DesktopNavbarLinkItem = ({ href, label }: NavbarLinks) => {
  return (
    <Link
      to={href}
      smooth={true}
      duration={300}
      offset={-80}
      className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 cursor-pointer"
    >
      {label}
    </Link>
  );
};

const MobileNavbarLinkItem = ({ href, label }: NavbarLinks) => {
  return (
    <Link
      to={href}
      smooth={true}
      duration={300}
      offset={-80}
      className="flex w-full items-center py-2 text-lg font-semibold cursor-pointer"
    >
      {label}
    </Link>
  );
};
