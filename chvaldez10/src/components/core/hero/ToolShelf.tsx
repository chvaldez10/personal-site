"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/buttons/button";
import styles from "./studio.module.css";

const motionPreference = "(prefers-reduced-motion: reduce)";
const pixelsPerSecond = 30;

export default function ToolShelf({
  children,
  more,
  paused,
  playing,
  onPlayingChange,
}: {
  children: ReactNode;
  more: ReactNode;
  paused: boolean;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
}) {
  const shelfId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const direction = useRef(1);
  const stopMotion = useRef<(() => void) | null>(null);
  const [maximum, setMaximum] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const observer = new ResizeObserver(() => {
      setMaximum(Math.max(0, viewport.scrollWidth - viewport.clientWidth));
    });
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (
      !viewport ||
      !track ||
      maximum < 1 ||
      !playing ||
      paused ||
      hovered ||
      focused
    )
      return;

    const motion = window.matchMedia(motionPreference);
    const duration = (maximum / pixelsPerSecond) * 1000;
    let inView = false;
    let animation: Animation | null = null;

    function stop() {
      if (!animation || !viewport) return;
      const elapsed = animation.currentTime;
      const progress = animation.effect?.getComputedTiming().progress ?? 0;
      if (typeof elapsed === "number") {
        direction.current = Math.floor(elapsed / duration) % 2 ? -1 : 1;
      }
      // Keep the visible position when handing back to native scrolling.
      const position = viewport.scrollLeft + progress * maximum;
      animation.cancel();
      animation = null;
      delete viewport.dataset.moving;
      viewport.scrollLeft = position;
    }

    function syncMotion() {
      if (!inView || motion.matches || document.hidden) {
        stop();
        return;
      }
      if (animation || !viewport || !track) return;

      const position = Math.min(maximum, viewport.scrollLeft) / maximum;
      viewport.scrollLeft = 0;
      animation = track.animate(
        [
          { transform: "translateX(0px)" },
          { transform: `translateX(${-maximum}px)` },
        ],
        { duration, direction: "alternate", iterations: Infinity },
      );
      animation.currentTime =
        (direction.current === 1 ? position : 2 - position) * duration;
      viewport.dataset.moving = "true";
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.intersectionRatio >= 0.25;
        syncMotion();
      },
      { threshold: 0.25 },
    );
    observer.observe(viewport);
    stopMotion.current = stop;
    motion.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);
    return () => {
      stop();
      stopMotion.current = null;
      observer.disconnect();
      motion.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
    };
  }, [focused, hovered, maximum, paused, playing]);

  function pauseBrowsing() {
    stopMotion.current?.();
    onPlayingChange(false);
  }

  function browse(step: -1 | 1) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    pauseBrowsing();
    direction.current = step;
    viewport.scrollBy({
      left: step * viewport.clientWidth * 0.8,
      behavior: window.matchMedia(motionPreference).matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <>
      <div
        id={shelfId}
        ref={viewportRef}
        className={styles.shelfViewport}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            stopMotion.current?.();
            setHovered(true);
          }
        }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") pauseBrowsing();
        }}
        onWheel={(event) => {
          if (event.deltaX || event.shiftKey) pauseBrowsing();
        }}
        onFocusCapture={(event) => {
          stopMotion.current?.();
          const viewport = event.currentTarget;
          const bounds = viewport.getBoundingClientRect();
          const tool = event.target.getBoundingClientRect();
          const focusPadding = 4;
          if (tool.left < bounds.left + focusPadding) {
            viewport.scrollLeft += tool.left - bounds.left - focusPadding;
          } else if (tool.right > bounds.right - focusPadding) {
            viewport.scrollLeft += tool.right - bounds.right + focusPadding;
          }
          setFocused(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocused(false);
        }}
      >
        <div ref={trackRef} className={styles.shelfTrack}>
          {children}
        </div>
      </div>
      {(more || maximum > 0) && (
        <div className={styles.shelfFooter}>
          {more}
          {maximum > 0 && (
            <fieldset className={styles.shelfControls}>
              <legend className="sr-only">Tool shelf controls</legend>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Previous tools"
                aria-controls={shelfId}
                onClick={() => browse(-1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={styles.shelfMotionButton}
                aria-controls={shelfId}
                onClick={() =>
                  playing ? pauseBrowsing() : onPlayingChange(true)
                }
              >
                {playing ? (
                  <Pause aria-hidden="true" />
                ) : (
                  <Play aria-hidden="true" />
                )}
                {playing ? "Pause motion" : "Resume motion"}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Next tools"
                aria-controls={shelfId}
                onClick={() => browse(1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </fieldset>
          )}
        </div>
      )}
    </>
  );
}
