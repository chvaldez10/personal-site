"use client";

import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Expand, Shrink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/buttons/button";
import { CanvasBoundary, useWebGLPreview } from "@/components/ui/WebGLPreview";
import { cn } from "@/lib/utils";
import styles from "./kpop-player.module.css";

const DiscCanvas = dynamic(() => import("./KpopDiscCanvas"), { ssr: false });

export default function KpopRecordScene({
  name,
  color,
  accent,
  playing,
  expanded,
  onToggleExpanded,
}: {
  name: string;
  color: string;
  accent: string;
  playing: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const { frame, nearby, shouldRender, ready, onReady, onFailure } =
    useWebGLPreview({ trackVisibility: true });
  const [reducedMotion, setReducedMotion] = useState(true);
  const [orbit, setOrbit] = useState({ yaw: 0.12, pitch: 0.17 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  function rotate(yaw: number, pitch = 0) {
    setOrbit((current) => ({
      yaw: current.yaw + yaw,
      pitch: Math.max(-0.62, Math.min(0.62, current.pitch + pitch)),
    }));
  }

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motion.matches);
    updateMotion();
    motion.addEventListener("change", updateMotion);
    return () => motion.removeEventListener("change", updateMotion);
  }, []);

  return (
    <div
      ref={frame}
      className={cn(styles.art, expanded && styles.expanded)}
      style={{ color: accent }}
    >
      <div
        className={cn(styles.disc, ready && "invisible")}
        style={{ backgroundColor: color }}
      />
      {shouldRender && (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 touch-pan-y motion-safe:transition-opacity",
            ready
              ? "cursor-grab opacity-100 active:cursor-grabbing"
              : "pointer-events-none opacity-0",
          )}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerMove={(event) => {
            if (!event.isPrimary || !drag.current) return;
            rotate(
              (event.clientX - drag.current.x) * 0.012,
              (event.clientY - drag.current.y) * 0.009,
            );
            drag.current = { x: event.clientX, y: event.clientY };
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
        >
          <CanvasBoundary onFailure={onFailure}>
            <DiscCanvas
              color={color}
              name={name}
              orbit={orbit}
              spinning={nearby && !reducedMotion && playing}
              onReady={onReady}
            />
          </CanvasBoundary>
        </div>
      )}
      {ready && (
        <div className="absolute inset-x-3 top-3 flex justify-between gap-2">
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Rotate left"
              onClick={() => rotate(-0.38)}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Rotate right"
              onClick={() => rotate(0.38)}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={expanded ? "Shrink 3D scene" : "Expand 3D scene"}
            onClick={onToggleExpanded}
          >
            {expanded ? (
              <Shrink aria-hidden="true" />
            ) : (
              <Expand aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
      {ready && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-3 text-center sm:pb-4">
          <span className="inline-block rounded-full border border-white/90 bg-[#fff9ff]/90 px-4 py-1.5 text-xs font-semibold">
            Drag to rotate
          </span>
        </div>
      )}
    </div>
  );
}
