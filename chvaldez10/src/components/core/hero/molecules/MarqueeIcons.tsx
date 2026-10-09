"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { BrandLogos } from "@/types/supabase";

export default function MarqueeIcons({
  brandLogos,
}: {
  brandLogos: BrandLogos[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const selected = brandLogos.find((logo) => logo.id === selectedId);
  const midpoint = Math.ceil(brandLogos.length / 2);
  const renderLogo = (logo: BrandLogos) => (
    <button
      type="button"
      key={logo.id}
      aria-haspopup="dialog"
      aria-label={"Details about " + (logo.label || logo.alt)}
      onClick={(event) => {
        lastTrigger.current = event.currentTarget;
        setSelectedId(logo.id);
      }}
      className="mr-8 flex h-22.5 w-30 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-3 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transform-none"
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={36}
        height={36}
        className="h-9 w-9 object-contain"
        draggable={false}
      />
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
      <div className="flex w-full flex-col gap-6 py-10">
        <Marquee
          speed={40}
          pauseOnHover
          pauseOnClick
          gradient={false}
          play={!selected}
        >
          {brandLogos.slice(0, midpoint).map(renderLogo)}
        </Marquee>
        <Marquee
          speed={40}
          pauseOnHover
          pauseOnClick
          gradient={false}
          direction="right"
          play={!selected}
        >
          {brandLogos.slice(midpoint).map(renderLogo)}
        </Marquee>
      </div>
      {selected && (
        <DialogContent
          className="max-w-sm rounded-2xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            lastTrigger.current?.focus();
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <Image
                src={selected.src}
                alt={selected.alt}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <DialogTitle>{selected.label || selected.alt}</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              {selected.description}
            </DialogDescription>
          </DialogHeader>
          {selected.referral_link && (
            <Link
              href={selected.referral_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 underline"
            >
              Check it out <span aria-hidden="true">→</span>
            </Link>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
