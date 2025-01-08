"use client";

import React, { useEffect } from "react";

// React Bubble UI
import BubbleUI from "react-bubble-ui";
import "react-bubble-ui/dist/index.css";
import BubbleItem from "./BubbleItem";
import "./bubble-animation.css";

import { BrandLogos } from "@/types/supabase";

interface BubbleIconsProps {
  brandLogos: BrandLogos[];
}

const BubbleIcons: React.FC<BubbleIconsProps> = ({ brandLogos }) => {
  const options = {
    size: 180,
    minSize: 20,
    gutter: 8,
    numCols: 4,
    xRadius: 100,
    yRadius: 80,
    cornerRadius: 50,
    fringeWidth: 160,
    gravitation: 5,
    showGuides: false,
    compact: true,
    provideProps: true,
  };

  useEffect(() => {
    const bubblesContainer = document.querySelector("._2MD0k") as HTMLElement;
    const bubbleItems =
      document.querySelectorAll<HTMLDivElement>(".bubbleItem");
    bubbleItems.forEach((i) => (i.ondragstart = () => false));
    const dragspeed = 2;
    let isDown = false;
    let startX: number;
    let startY: number;
    let scrollLeft: number;
    let scrollTop: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      bubblesContainer?.classList.add("active");
      startX = e.pageX - (bubblesContainer?.offsetLeft || 0);
      startY = e.pageY - (bubblesContainer?.offsetTop || 0);
      scrollLeft = bubblesContainer?.scrollLeft || 0;
      scrollTop = bubblesContainer?.scrollTop || 0;
    };

    const handleMouseLeave = () => {
      isDown = false;
      bubblesContainer?.classList.remove("active");
    };

    const handleMouseUp = () => {
      isDown = false;
      bubblesContainer?.classList.remove("active");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - (bubblesContainer?.offsetLeft || 0);
      const y = e.pageY - (bubblesContainer?.offsetTop || 0);
      const walk = (x - startX) * dragspeed;
      const topwalk = (y - startY) * dragspeed;
      if (bubblesContainer) {
        bubblesContainer.scrollLeft = scrollLeft - walk;
        bubblesContainer.scrollTop = scrollTop - topwalk;
      }
    };

    bubblesContainer?.addEventListener("mousedown", handleMouseDown);
    bubblesContainer?.addEventListener("mouseleave", handleMouseLeave);
    bubblesContainer?.addEventListener("mouseup", handleMouseUp);
    bubblesContainer?.addEventListener("mousemove", handleMouseMove);

    return () => {
      bubblesContainer?.removeEventListener("mousedown", handleMouseDown);
      bubblesContainer?.removeEventListener("mouseleave", handleMouseLeave);
      bubblesContainer?.removeEventListener("mouseup", handleMouseUp);
      bubblesContainer?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const children = brandLogos.map((brandLogo, i) => (
    <BubbleItem key={i} {...brandLogo} />
  ));

  return (
    <BubbleUI options={options} className="bubbleUIContainer cursor-grab">
      {children}
    </BubbleUI>
  );
};

export default BubbleIcons;
