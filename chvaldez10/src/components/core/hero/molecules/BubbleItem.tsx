"use client";

import { FC, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Types
import { BrandLogos } from "@/types/supabase";

const BubbleItem: FC<BrandLogos> = ({ ...data }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  return (
    <div
      className="perspective bubbleItem p-2"
      onClick={handleClick}
      style={{
        background: `linear-gradient(135deg, var(--brand-secondary-100), var(--brand-secondary-200))`,
      }}
    >
      <div className={`bubbleCard ${isFlipped ? "flipped" : ""}`}>
        {/* Logo and Label */}
        <div className="bubbleFront flex flex-col items-center justify-center">
          <Image
            src={data.src}
            alt={data.alt}
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            draggable={false}
          />
          <p className="mt-1 text-[10px] sm:text-xs text-secondary-foreground font-medium truncate max-w-full px-1">
            {data?.label}
          </p>
        </div>

        {/* Description and Referral Link */}
        <div className="bubbleBack flex flex-col items-center justify-center p-2">
          <p className="text-center text-[8px] sm:text-[10px] text-gray-800 line-clamp-3">
            {data.description}
          </p>
          {data?.referral_link && (
            <Link
              href={data?.referral_link || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:underline text-[8px] sm:text-[10px] mt-1 transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              Link ↗
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BubbleItem;
