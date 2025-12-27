"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";

import { BrandLogos } from "@/types/supabase";

interface MarqueeIconsProps {
  brandLogos: BrandLogos[];
}

const MarqueeIcons: React.FC<MarqueeIconsProps> = ({ brandLogos }) => {
  const [selectedItem, setSelectedItem] = useState<BrandLogos | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Split logos into two rows
  const rows = useMemo(() => {
    const mid = Math.ceil(brandLogos.length / 2);
    return {
      row1: brandLogos.slice(0, mid),
      row2: brandLogos.slice(mid),
    };
  }, [brandLogos]);

  const handleItemClick = useCallback((item: BrandLogos) => {
    setSelectedItem(item);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const renderItem = (logo: BrandLogos, index: number) => (
    <div
      key={logo.id || index}
      onClick={() => handleItemClick(logo)}
      className="mr-8 shrink-0 w-[120px] h-[90px] rounded-xl flex flex-col items-center justify-center gap-2 p-3 cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-1"
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={36}
        height={36}
        className="object-contain"
        draggable={false}
        loading="lazy"
      />
      <span className="text-xs font-medium text-secondary-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
        {logo.label}
      </span>
    </div>
  );

  return (
    <>
      <div className="w-full py-10 flex flex-col gap-6">
        <Marquee speed={40} pauseOnHover gradient={false}>
          {rows.row1.map((logo, i) => renderItem(logo, i))}
        </Marquee>

        <Marquee speed={40} pauseOnHover gradient={false} direction="right">
          {rows.row2.map((logo, i) => renderItem(logo, i))}
        </Marquee>
      </div>

      {/* Portal for modal */}
      {mounted &&
        selectedItem &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-9999 animate-in fade-in duration-300"
              onClick={handleClose}
            />

            {/* Detail popup */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 w-[300px] shadow-2xl z-10000 animate-in zoom-in-95 fade-in duration-300">
              <button
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-lg text-gray-600 transition-colors"
                onClick={handleClose}
              >
                ×
              </button>
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={selectedItem.src}
                  alt={selectedItem.alt}
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedItem.label}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {selectedItem.description}
              </p>
              {selectedItem.referral_link && (
                <Link
                  href={selectedItem.referral_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-pink-500 text-sm font-medium hover:gap-2.5 transition-all"
                >
                  Check it out <span>→</span>
                </Link>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default React.memo(MarqueeIcons);
