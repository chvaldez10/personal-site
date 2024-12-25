import { navlinks } from "@/data/navlinks";
import { NavbarLinks } from "@/types/shared";

export default function Home() {
  return (
    // test the scroll
    <>
      {navlinks.map((navlink: NavbarLinks) => (
        <div id={navlink.href} key={navlink.href} className="h-screen">
          <h2>{navlink.label}</h2>
        </div>
      ))}
    </>
  );
}
