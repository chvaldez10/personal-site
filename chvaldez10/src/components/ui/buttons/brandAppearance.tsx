import type { ReactNode } from "react";

export const brandClassName =
  "hover-scale-effect relative flex items-center rounded-xl bg-linear-to-r from-yellow-500 to-pink-500 px-8 py-4 text-base font-medium text-white hover:from-pink-500 hover:to-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-700";

export const brandStyle = { textDecoration: "none", color: "white" };

export function BrandContent({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <span
        aria-hidden="true"
        className="absolute top-0 right-0 h-4 w-4 animate-ping rounded-full bg-linear-to-r from-orange-400 to-orange-700"
      />
    </>
  );
}
