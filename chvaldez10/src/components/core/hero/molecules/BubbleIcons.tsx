"use client";

import React, { useRef, useState, useEffect } from "react";
import BubbleItem from "./BubbleItem";
import "./bubble-animation.css";

import { BrandLogos } from "@/types/supabase";

interface BubbleIconsProps {
  brandLogos: BrandLogos[];
}

const BubbleIcons: React.FC<BubbleIconsProps> = ({ brandLogos }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [, forceUpdate] = useState(0);

  // Apply fisheye transforms directly to DOM (no React re-render)
  const applyFisheyeEffect = () => {
    if (!containerRef.current || !gridRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const centerX = container.width / 2;
    const centerY = container.height / 2;

    const focusRadius = 100;
    const maxRadius = Math.min(container.width, container.height) * 0.5;

    const bubbles =
      gridRef.current.querySelectorAll<HTMLDivElement>(".honeycomb-item");

    bubbles.forEach((bubble) => {
      const rect = bubble.getBoundingClientRect();
      const bubbleCenterX = rect.left + rect.width / 2 - container.left;
      const bubbleCenterY = rect.top + rect.height / 2 - container.top;

      const distance = Math.sqrt(
        (bubbleCenterX - centerX) ** 2 + (bubbleCenterY - centerY) ** 2
      );

      let scale: number;
      let opacity: number;

      if (distance <= focusRadius) {
        scale = 1.1;
        opacity = 1;
      } else if (distance <= maxRadius) {
        const t = (distance - focusRadius) / (maxRadius - focusRadius);
        const easedT = 1 - Math.pow(1 - t, 2);
        scale = 1.1 - easedT * 0.55;
        opacity = 1 - easedT * 0.45;
      } else {
        scale = 0.55;
        opacity = 0.55;
      }

      bubble.style.transform = `scale(${scale})`;
      bubble.style.opacity = String(opacity);
    });
  };

  // Animation loop for smooth updates
  const updateLoop = () => {
    if (!gridRef.current) return;

    gridRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
    applyFisheyeEffect();

    if (isDraggingRef.current) {
      rafRef.current = requestAnimationFrame(updateLoop);
    }
  };

  // Initial effect and resize handler
  useEffect(() => {
    applyFisheyeEffect();
    window.addEventListener("resize", applyFisheyeEffect);
    return () => {
      window.removeEventListener("resize", applyFisheyeEffect);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: clientX - positionRef.current.x,
      y: clientY - positionRef.current.y,
    };
    if (gridRef.current) {
      gridRef.current.style.cursor = "grabbing";
    }
    rafRef.current = requestAnimationFrame(updateLoop);
    forceUpdate((n) => n + 1);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;

    const newX = clientX - dragStartRef.current.x;
    const newY = clientY - dragStartRef.current.y;

    const maxOffset = 250;
    positionRef.current = {
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
    };
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
    if (gridRef.current) {
      gridRef.current.style.cursor = "grab";
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    // Final update after drag ends
    if (gridRef.current) {
      gridRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
    }
    applyFisheyeEffect();
    forceUpdate((n) => n + 1);
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) =>
    handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };
  const handleMouseUp = () => handleEnd();
  const handleMouseLeave = () => {
    if (isDraggingRef.current) handleEnd();
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = () => handleEnd();

  return (
    <div
      ref={containerRef}
      className="honeycomb-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="focus-ring" />

      <div ref={gridRef} className="honeycomb-grid" style={{ cursor: "grab" }}>
        {brandLogos.map((brandLogo, i) => (
          <div key={brandLogo.id || i} className="honeycomb-item">
            <BubbleItem {...brandLogo} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BubbleIcons;
