"use client";

import { useRef, useState } from "react";
import LogoImage from "@/components/ui/LogoImage";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { BrandLogo } from "@/types/media";
import { publicWebUrl } from "@/lib/links";

export default function MarqueeIcons({
  brandLogos,
}: {
  brandLogos: BrandLogo[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasFocus, setHasFocus] = useState(false);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const selected = brandLogos.find((logo) => logo.id === selectedId);
  const referralLink = publicWebUrl(selected?.referral_link);
  const midpoint = Math.ceil(brandLogos.length / 2);
  const renderLogo = (logo: BrandLogo) => (
    <button
      type="button"
      key={logo.id}
      aria-haspopup="dialog"
      aria-label={"Details about " + (logo.label || logo.alt)}
      onClick={(event) => {
        lastTrigger.current = event.currentTarget;
        setSelectedId(logo.id);
      }}
      className="mr-8 flex h-22.5 w-30 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-3 transition-transform duration-300 hover:-translate-y-1 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <LogoImage src={logo.src} alt={logo.alt} size={36} naturalHeight />
      <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs font-medium text-secondary-foreground">
        {logo.label}
      </span>
    </button>
  );
  return (
    <Dialog
      open={Boolean(selected)}
      onOpenChange={(open) => {
        if (!open) setSelectedId(null);
      }}
    >
      <div
        className="flex w-full flex-col gap-6 py-10"
        onFocusCapture={(event) =>
          setHasFocus(event.target.matches(":focus-visible"))
        }
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setHasFocus(false);
        }}
      >
        <Marquee
          autoFill
          speed={40}
          pauseOnHover
          pauseOnClick
          gradient={false}
          play={!selected && !hasFocus}
        >
          {brandLogos.slice(0, midpoint).map(renderLogo)}
        </Marquee>
        <Marquee
          autoFill
          speed={40}
          pauseOnHover
          pauseOnClick
          gradient={false}
          direction="right"
          play={!selected && !hasFocus}
        >
          {brandLogos.slice(midpoint).map(renderLogo)}
        </Marquee>
      </div>
      {selected && (
        <DialogContent
          className="z-10000 w-75 max-w-[90vw] rounded-2xl border-0 bg-linear-to-br from-white to-gray-50 shadow-2xl"
          overlayClassName="z-9999 bg-black/40 backdrop-blur-xs"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            lastTrigger.current?.focus({ preventScroll: true });
          }}
        >
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-3 pr-6">
              <LogoImage
                src={selected.src}
                alt={selected.alt}
                size={48}
                naturalHeight
              />
              <DialogTitle className="leading-7 text-gray-900">
                {selected.label || selected.alt}
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 leading-relaxed">
              {selected.description}
            </DialogDescription>
          </DialogHeader>
          {referralLink && (
            <Link
              href={referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 underline"
            >
              Visit the site <span aria-hidden="true">→</span>
            </Link>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
