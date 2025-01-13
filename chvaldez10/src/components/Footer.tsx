import { FC } from "react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const Footer: FC = () => (
  <footer className="bg-white rounded-lg shadow-lg m-4">
    <div className="w-full mx-auto max-w-3xl p-6 flex flex-row justify-between items-center">
      {/* Left side of footer */}
      <span className="text-sm text-gray-800">Last Updated January 2025</span>

      {/* Right side of footer */}
      <Link
        href="https://github.com/chvaldez10/personal-site"
        className="hover-scale-effect"
      >
        <FaGithub size={24} />
      </Link>
    </div>
  </footer>
);

export default Footer;
