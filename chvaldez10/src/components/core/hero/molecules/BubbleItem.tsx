import { FC } from "react";
import Image from "next/image";
import { CompanyLogo } from "@/types/shared";

const BubbleItem: FC<CompanyLogo> = ({ ...data }) => {
  return (
    <div
      className="bubbleItem p-2 rounded-full flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
      style={{
        background: `linear-gradient(135deg, var(--brand-secondary-100), var(--brand-secondary-200))`,
      }}
    >
      <Image
        src={data.src}
        alt={data.alt}
        width={40}
        height={40}
        className="w-1/2 h-1/2 "
      />
      <p className="mt-1 text-xs sm:text-sm md:text-base lg:text-lg text-secondary-foreground">
        {data.label}
      </p>
    </div>
  );
};

export default BubbleItem;
