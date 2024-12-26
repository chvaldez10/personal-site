"use client";

import { FC } from "react";
import { Link } from "react-scroll";
import Image from "next/image";

// Components
import { Button } from "@/components/ui/buttons/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { RiMenu5Fill } from "react-icons/ri";

// Types
import { NavbarLinks } from "@/types/shared";

// Data
import { navlinks } from "@/data/navlinks";

// Styles
import "@/styles/navbar.css";

const Navbar: FC = () => {
  return (
    <header className="fixed top-0 flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      {/* Mobile Navigation Sheet */}
      <Sheet>
        {/* Menu Button */}
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <RiMenu5Fill className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>

        {/* Mobile Navigation */}
        <SheetContent side="left">
          <div className="grid gap-4 py-6 text-center md:text-left">
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

      {/* Logo */}
      <div className="flex items-center mx-auto gap-4">
        <Link to="main-header" className="hidden md:flex  hover-scale-effect">
          <Image
            src="/rice-bowl.png"
            alt="Logo"
            width={48}
            height={48}
            quality={100}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6" id="desktop-nav">
          {navlinks.map((navlink: NavbarLinks) => (
            <DesktopNavbarLinkItem
              key={navlink.href}
              href={navlink.href}
              label={navlink.label}
            />
          ))}
        </nav>
      </div>
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
      offset={-50}
      className="group inline-flex w-max items-center justify-center rounded-md px-4 text-sm font-medium transition-colors cursor-pointer text-center"
      id="style-4"
      data-replace={label}
    >
      <span>{label}</span>
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
      className="flex w-full items-center text-lg font-semibold cursor-pointer"
      id="style-4"
      data-replace={label}
    >
      <span>{label}</span>
    </Link>
  );
};
