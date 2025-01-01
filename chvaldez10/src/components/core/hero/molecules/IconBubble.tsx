"use client";

import React, { useEffect } from "react";
import BubbleUI from "react-bubble-ui";
import "react-bubble-ui/dist/index.css";
import BubbleItem from "./BubbleItem";
import { data } from "@/data/bubbleData";
import "./bubble-animation.css";

const IconBubble: React.FC = () => {
  const options = {
    size: 180,
    minSize: 20,
    gutter: 8,
    numCols: 5,
    yRadius: 220,
    xRadius: 130,
    cornerRadius: 50,
    fringeWidth: 45,
    gravitation: 5,
    showGuides: true,
    compact: true,
    provideProps: true,
  };

  useEffect(() => {
    const bubbles = document.querySelector("._2MD0k") as HTMLElement;
    const img = document.querySelectorAll<HTMLDivElement>(".bubbleItem");
    img.forEach((i) => (i.ondragstart = () => false));
    const dragspeed = 2;
    let isDown = false;
    let startX: number;
    let startY: number;
    let scrollLeft: number;
    let scrollTop: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      bubbles?.classList.add("active");
      startX = e.pageX - (bubbles?.offsetLeft || 0);
      startY = e.pageY - (bubbles?.offsetTop || 0);
      scrollLeft = bubbles?.scrollLeft || 0;
      scrollTop = bubbles?.scrollTop || 0;
    };

    const handleMouseLeave = () => {
      isDown = false;
      bubbles?.classList.remove("active");
    };

    const handleMouseUp = () => {
      isDown = false;
      bubbles?.classList.remove("active");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - (bubbles?.offsetLeft || 0);
      const y = e.pageY - (bubbles?.offsetTop || 0);
      const walk = (x - startX) * dragspeed;
      const topwalk = (y - startY) * dragspeed;
      if (bubbles) {
        bubbles.scrollLeft = scrollLeft - walk;
        bubbles.scrollTop = scrollTop - topwalk;
      }
    };

    bubbles?.addEventListener("mousedown", handleMouseDown);
    bubbles?.addEventListener("mouseleave", handleMouseLeave);
    bubbles?.addEventListener("mouseup", handleMouseUp);
    bubbles?.addEventListener("mousemove", handleMouseMove);

    return () => {
      bubbles?.removeEventListener("mousedown", handleMouseDown);
      bubbles?.removeEventListener("mouseleave", handleMouseLeave);
      bubbles?.removeEventListener("mouseup", handleMouseUp);
      bubbles?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const children = data.map((item, i) => <BubbleItem key={i} data={item} />);

  return (
    <BubbleUI options={options} className="bubbleUIContainer">
      {children}
    </BubbleUI>
  );
};

export default IconBubble;
