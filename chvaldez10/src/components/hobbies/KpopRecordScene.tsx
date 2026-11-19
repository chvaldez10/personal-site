"use client";

import { Box, ChevronLeft, ChevronRight, Expand, Shrink } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/buttons/button";
import { CanvasBoundary, useWebGLPreview } from "@/components/ui/WebGLPreview";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import styles from "./kpop-player.module.css";

const DiscCanvas = lazy(() => import("./KpopDiscCanvas"));
const initialOrbit = { yaw: 0.12, pitch: 0.17 };

export default function KpopRecordScene({
  name,
  color,
  playing,
  expanded,
  onToggleExpanded,
}: {
  name: string;
  color: string;
  playing: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const { frame, nearby, shouldRender, ready, failed, onReady, onFailure } =
    useWebGLPreview({ enabled, trackVisibility: true });
  const reducedMotion = useReducedMotion();
  const [orbit, setOrbit] = useState(initialOrbit);
  const nextOrbit = useRef(initialOrbit);
  const animationFrame = useRef<number | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const loading = enabled && !ready && !failed;

  function rotate(yaw: number, pitch = 0) {
    const current = nextOrbit.current;
    nextOrbit.current = {
      yaw: current.yaw + yaw,
      pitch: Math.max(-0.62, Math.min(0.62, current.pitch + pitch)),
    };
    if (animationFrame.current !== null) return;
    animationFrame.current = requestAnimationFrame(() => {
      animationFrame.current = null;
      setOrbit(nextOrbit.current);
    });
  }

  useEffect(
    () => () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    },
    [],
  );

  return (
    <div
      ref={frame}
      className={cn(styles.art, expanded && styles.expanded)}
      style={{ color }}
      data-playing={playing}
    >
      <div
        className={cn(styles.recordDisplay, ready && "invisible")}
        aria-hidden="true"
      >
        <div className={styles.sleeve}>
          <span>{name}</span>
        </div>
        <div className={styles.disc} />
      </div>
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
            <Suspense fallback={null}>
              <DiscCanvas
                color={color}
                name={name}
                orbit={orbit}
                spinning={nearby && !reducedMotion && playing}
                onReady={onReady}
              />
            </Suspense>
          </CanvasBoundary>
        </div>
      )}

      <div className={styles.sceneControls}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={styles.sceneButton}
          aria-pressed={enabled && !failed}
          aria-disabled={failed}
          onClick={() => {
            if (failed) return;
            if (enabled && expanded) onToggleExpanded();
            setEnabled(!enabled);
          }}
        >
          <Box aria-hidden="true" />
          3D view
        </Button>
        {ready && (
          <div className="flex gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className={styles.sceneButton}
              aria-label="Rotate left"
              onClick={() => rotate(-0.38)}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className={styles.sceneButton}
              aria-label="Rotate right"
              onClick={() => rotate(0.38)}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className={styles.sceneButton}
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
      </div>
      <output className={styles.sceneHint}>
        {failed
          ? "3D view unavailable."
          : loading
            ? "Loading 3D view…"
            : ready
              ? "Drag to rotate"
              : ""}
      </output>
    </div>
  );
}
