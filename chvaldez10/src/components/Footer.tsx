import { FC } from "react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import Typography from "@/components/ui/text/typography";

const Footer: FC = () => (
  <footer className="bg-white rounded-lg shadow-lg m-4">
    <div className="w-full mx-auto max-w-3xl p-6 flex flex-row justify-between items-center">
      <Typography
        variant="p"
        text="Last Updated December 2025"
        className="text-gray-800"
      />
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
