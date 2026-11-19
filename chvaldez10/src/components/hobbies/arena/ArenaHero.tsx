"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/buttons/button";
import { CanvasBoundary, useWebGLPreview } from "@/components/ui/WebGLPreview";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { ArenaView } from "./ArenaCanvas";
import {
  arenaAspect,
  arenas,
  maxPortraitPan,
  type ArenaScene,
} from "./arena-config";
import styles from "./arena-hero.module.css";

const ArenaCanvas = lazy(() => import("./ArenaCanvas"));

type ArenaHeroProps = {
  scene: ArenaScene;
  title: string;
  color?: string;
  destination: { href: string; label: string; primary?: boolean };
  action?: {
    label: string;
    icon: ReactNode;
    className?: string;
    onClick: () => void;
  };
  status?: string;
  children?: ReactNode;
  scoreboard?: ReactNode;
};

export default function ArenaHero({
  scene,
  title,
  color,
  destination,
  action,
  status,
  children,
  scoreboard,
}: ArenaHeroProps) {
  const { frame, nearby, shouldRender, ready, onReady, onFailure } =
    useWebGLPreview({ trackVisibility: true });
  const [effects, setEffects] = useState(true);
  const { src, alt, framing } = arenas[scene];
  const posterStyle: CSSProperties & Record<`--arena-${string}`, number> = {
    scale: 1 / framing.zoom,
    "--arena-photo-aspect": arenaAspect,
    "--arena-center-x": framing.x,
    "--arena-center-y": framing.y,
    "--arena-portrait-pan": framing.portraitPan,
    "--arena-max-pan": maxPortraitPan,
  };
  const reducedMotion = useReducedMotion();
  const hintId = useId();
  const view = useRef<ArenaView>({ yaw: 0, pitch: 0 });
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
    <header className={cn(styles.hero, scene === "octagon" && styles.octagon)}>
      <div ref={frame} className={styles.stageViewport}>
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          fetchPriority="high"
          loading="eager"
          className={styles.arena}
          style={posterStyle}
        />
        <div
          aria-hidden="true"
          className={cn(styles.openingLight, ready && styles.openingComplete)}
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
                <ArenaCanvas
                  scene={scene}
                  src={src}
                  framing={framing}
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
        <div className={styles.masthead}>
          <Link href="/#hobbies" className={styles.back} prefetch={false}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to hobbies
          </Link>
          {scoreboard}
        </div>

        <div className={styles.stageBar}>
          <div className={styles.heroCopy}>
            <h1>
              {title}
              <span>.</span>
            </h1>
            {children}
            <div className={styles.actions}>
              {action && (
                <Button
                  type="button"
                  className={cn(
                    styles.stageButton,
                    styles.primary,
                    action.className,
                  )}
                  onClick={action.onClick}
                >
                  {action.icon}
                  {action.label}
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className={cn(
                  styles.stageButton,
                  destination.primary && styles.primary,
                )}
              >
                <a href={destination.href}>
                  <ArrowDown aria-hidden="true" />
                  {destination.label}
                </a>
              </Button>
            </div>
            {status && <output className={styles.status}>{status}</output>}
          </div>

          <fieldset
            className={cn(styles.controls, !ready && styles.controlsPending)}
            aria-describedby={hintId}
            disabled={!ready}
          >
            <legend className="sr-only">Arena controls</legend>
            <span id={hintId} className={styles.hint}>
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
