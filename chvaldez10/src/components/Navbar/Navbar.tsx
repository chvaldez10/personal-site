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
import styles from "./navbar.module.css";

const Navbar: FC = () => {
  return (
    <header className="fixed top-0 flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <MobileNavbar />
      <DesktopNavbar />
    </header>
  );
};
export default Navbar;

const DesktopNavbar = () => {
  return (
    <>
      {/* Logo */}
      <div className="hidden md:flex items-center mx-auto gap-4">
        <NavbarLogo />

        {/* Desktop items */}
        <nav className="gap-6" id="desktop-nav">
          {navlinks.map((navlink: NavbarLinks) => (
            <DesktopNavbarLinkItem
              key={navlink.href}
              href={navlink.href}
              label={navlink.label}
            />
          ))}
        </nav>
      </div>
    </>
  );
};

const DesktopNavbarLinkItem = ({ href, label }: NavbarLinks) => {
  return (
    <Link
      to={href}
      smooth={true}
      duration={300}
      offset={-50}
      className={`${styles.clientNavbar} group inline-flex w-max items-center justify-center rounded-md px-4 text-sm font-medium transition-colors cursor-pointer text-center`}
      data-replace={label}
      style={{ textDecoration: "none" }}
    >
      <span>{label}</span>
    </Link>
  );
};

const MobileNavbar = () => {
  return (
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
        <NavbarLogo />

        {/* Navbar items */}
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
  );
};

const MobileNavbarLinkItem = ({ href, label }: NavbarLinks) => {
  return (
    <Link
      to={href}
      smooth={true}
      duration={300}
      offset={-80}
      className={`${styles.clientNavbar} flex w-full items-center text-lg font-semibold cursor-pointer`}
      data-replace={label}
      style={{ textDecoration: "none" }}
    >
      <span>{label}</span>
    </Link>
  );
};

const NavbarLogo = () => {
  return (
    <Link to="main-header" className="hover-scale-effect">
      <Image
        src="/rice-bowl.png"
        alt="Logo"
        width={48}
        height={48}
        quality={100}
      />
    </Link>
  );
};
