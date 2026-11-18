"use client";

import { Box, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/buttons/button";
import { CanvasBoundary, useWebGLPreview } from "@/components/ui/WebGLPreview";
import styles from "./showcase.module.css";

export type ScenePreviewProps =
  | { kind: "workbench"; selected: "sketch" | "build" | "test" }
  | { kind: "box-office"; show: number; printCount: number };

const ShowcaseCanvas = lazy(() => import("./ShowcaseCanvas"));

const viewActions = [
  { id: "left", label: "Look left", Icon: ChevronLeft },
  { id: "center", label: "Reset view", Icon: RotateCcw },
  { id: "right", label: "Look right", Icon: ChevronRight },
] as const;

export type WorkbenchViewAction = (typeof viewActions)[number]["id"];
export type WorkbenchLook = (action: WorkbenchViewAction) => void;

export default function ScenePreview({
  intro,
  children,
  ...props
}: ScenePreviewProps & { intro?: ReactNode; children?: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [canStart, setCanStart] = useState(false);
  const look = useRef<WorkbenchLook | null>(null);
  const registerLook = useCallback((handler: WorkbenchLook | null) => {
    look.current = handler;
  }, []);
  useEffect(() => {
    if (typeof requestIdleCallback === "function") {
      const start = requestIdleCallback(() => setCanStart(true), {
        timeout: 500,
      });
      return () => cancelIdleCallback(start);
    }

    const start = window.setTimeout(() => setCanStart(true), 150);
    return () => window.clearTimeout(start);
  }, []);

  const { frame, nearby, shouldRender, ready, failed, onReady, onFailure } =
    useWebGLPreview({ enabled: enabled && canStart, trackVisibility: true });
  const interactive = props.kind === "workbench" && ready;

  return (
    <div className={styles.scene}>
      {intro}
      <div
        ref={frame}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The workbench handles arrow keys and Home.
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? "application" : undefined}
        aria-label={
          interactive
            ? "3D workbench. Use arrow keys to look around and Home to reset."
            : undefined
        }
        className={styles.preview}
        data-scene={props.kind}
        data-ready={ready}
      >
        {props.kind === "box-office" && (
          <div className={styles.poster} aria-hidden="true" />
        )}
        {shouldRender && (
          <div className={styles.canvas} aria-hidden="true">
            <CanvasBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <ShowcaseCanvas
                  {...props}
                  frame={frame}
                  registerLook={registerLook}
                  nearby={nearby}
                  onReady={onReady}
                />
              </Suspense>
            </CanvasBoundary>
          </div>
        )}
      </div>
      <div className={styles.sceneTools}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={styles.sceneButton}
          aria-label={
            props.kind === "workbench"
              ? "3D workbench view"
              : "3D box office view"
          }
          aria-pressed={enabled && !failed}
          aria-disabled={failed}
          onClick={() => {
            if (failed) return;
            if (enabled) onReady(false);
            setEnabled(!enabled);
          }}
        >
          <Box aria-hidden="true" /> 3D view
        </Button>
        {interactive && (
          <fieldset className={styles.viewControls}>
            <legend className="sr-only">Workbench view controls</legend>
            {viewActions.map(({ id, label, Icon }) => (
              <Button
                key={id}
                type="button"
                size="icon"
                variant="ghost"
                aria-label={label}
                onClick={() => look.current?.(id)}
              >
                <Icon aria-hidden="true" />
              </Button>
            ))}
          </fieldset>
        )}
        <output className={styles.sceneStatus} data-hint={interactive}>
          {failed
            ? "3D view unavailable."
            : enabled && !ready
              ? "Loading 3D…"
              : interactive
                ? "Drag to look around"
                : ""}
        </output>
      </div>
      {children}
    </div>
  );
}
