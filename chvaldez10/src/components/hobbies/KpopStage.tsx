"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/buttons/button";
import { CanvasBoundary, useWebGLPreview } from "@/components/ui/WebGLPreview";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { PreviewStatus } from "./KpopSongPreview";
import type { StageView } from "./KpopStageCanvas";
import styles from "./kpop-concert.module.css";

const StageCanvas = lazy(() => import("./KpopStageCanvas"));
const arena = "/images/kpop-arena.webp";

type StagePlayback = {
  title: string;
  status: PreviewStatus;
  onToggle: () => void;
};

export default function KpopStage({
  color = "#ffb4da",
  playback,
}: {
  color?: string;
  playback?: StagePlayback;
}) {
  const { frame, nearby, shouldRender, ready, onReady, onFailure } =
    useWebGLPreview({ trackVisibility: true });
  const [effects, setEffects] = useState(true);
  const reducedMotion = useReducedMotion();
  const previewActive =
    playback?.status === "playing" || playback?.status === "loading";
  const view = useRef<StageView>({ yaw: 0, pitch: 0 });
  const requestFrame = useRef<(() => void) | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const onFrameRequest = useCallback((invalidate: (() => void) | null) => {
    requestFrame.current = invalidate;
  }, []);

  function turn(yaw: number, pitch = 0) {
    view.current.yaw = Math.max(-1, Math.min(1, view.current.yaw + yaw));
    view.current.pitch = Math.max(-1, Math.min(1, view.current.pitch + pitch));
    requestFrame.current?.();
  }

  function reset() {
    view.current = { yaw: 0, pitch: 0 };
    requestFrame.current?.();
  }

  function handleLookKeys(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowLeft":
        turn(-0.5);
        break;
      case "ArrowRight":
        turn(0.5);
        break;
      case "ArrowUp":
        turn(0, 0.5);
        break;
      case "ArrowDown":
        turn(0, -0.5);
        break;
      case "Home":
        reset();
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <header className={styles.hero}>
      <div ref={frame} className={styles.stageViewport}>
        <Image
          src={arena}
          alt=""
          fill
          unoptimized
          fetchPriority="high"
          loading="eager"
          className={styles.arena}
        />
        {shouldRender && (
          <div
            aria-hidden="true"
            className={cn(styles.scene, ready && styles.sceneReady)}
            onPointerDown={(event) => {
              if (!event.isPrimary || event.button !== 0) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerMove={(event) => {
              if (!event.isPrimary || !drag.current) return;
              const { x, y } = drag.current;
              turn((x - event.clientX) / 170, (event.clientY - y) / 150);
              drag.current = { x: event.clientX, y: event.clientY };
            }}
            onLostPointerCapture={() => {
              drag.current = null;
            }}
          >
            <CanvasBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <StageCanvas
                  src={arena}
                  color={color}
                  view={view}
                  onFrameRequest={onFrameRequest}
                  effects={effects}
                  animate={nearby && effects && !reducedMotion}
                  onReady={onReady}
                  onFailure={onFailure}
                />
              </Suspense>
            </CanvasBoundary>
          </div>
        )}
      </div>

      <div className={styles.heroContent}>
        <Link href="/#hobbies" className={styles.back} prefetch={false}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to hobbies
        </Link>

        <div className={styles.stageBar}>
          <div className={styles.heroCopy}>
            <h1>
              K-pop<span>.</span>
            </h1>
            {playback && (
              <p className={styles.currentTrack}>{playback.title}</p>
            )}
            <div className={styles.actions}>
              {playback && playback.status !== "unavailable" && (
                <Button
                  type="button"
                  size="lg"
                  className={styles.play}
                  onClick={playback.onToggle}
                >
                  {previewActive ? (
                    <Pause aria-hidden="true" />
                  ) : (
                    <Play aria-hidden="true" />
                  )}
                  {previewActive ? "Pause preview" : "Play preview"}
                </Button>
              )}
              <Button
                asChild
                size="lg"
                variant="outline"
                className={styles.stageButton}
              >
                <a href="#songs">
                  Setlist <ArrowDown aria-hidden="true" />
                </a>
              </Button>
            </div>
            {(playback?.status === "unavailable" ||
              playback?.status === "loading") && (
              <output className={styles.previewStatus}>
                {playback.status === "unavailable"
                  ? "Preview unavailable"
                  : "Loading preview…"}
              </output>
            )}
          </div>

          <fieldset
            className={cn(styles.controls, !ready && styles.controlsPending)}
            aria-describedby="stage-look-help"
            disabled={!ready}
          >
            <legend className="sr-only">Stage controls</legend>
            <span id="stage-look-help" className={styles.stageHint}>
              Drag to look around
              <span className="sr-only">
                . You can also focus a view button and use the arrow keys.
              </span>
            </span>
            <div className={styles.actions}>
              <div className={styles.look}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Look left"
                  onClick={() => turn(-0.5)}
                  onKeyDown={handleLookKeys}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Center view"
                  onClick={reset}
                  onKeyDown={handleLookKeys}
                >
                  <RotateCcw aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Look right"
                  onClick={() => turn(0.5)}
                  onKeyDown={handleLookKeys}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className={styles.stageButton}
                aria-pressed={effects}
                onClick={() => setEffects((active) => !active)}
              >
                <Lightbulb aria-hidden="true" />
                Effects
              </Button>
            </div>
          </fieldset>
        </div>
      </div>
    </header>
  );
}
