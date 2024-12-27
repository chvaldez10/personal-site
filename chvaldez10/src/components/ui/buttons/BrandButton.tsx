import React from "react";
import Link from "next/link";

interface BrandButtonProps {
  children: React.ReactNode;
  href?: string;
}

const BrandButton: React.FC<BrandButtonProps> = ({ children }) => {
  return (
    <Link
      href={"https://www.linkedin.com/in/chvaldez10/"}
      target="_blank"
      style={{ textDecoration: "none" }}
    >
      <button className="font-medium text-base flex items-center px-8 py-4 rounded-xl capitalize bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-pink-500 hover:to-yellow-500 hover-scale-effect text-white">
        {children}
        <span className="animate-ping absolute right-0 top-0 w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 to-orange-700"></span>
      </button>
    </Link>
  );
};

export default BrandButton;
