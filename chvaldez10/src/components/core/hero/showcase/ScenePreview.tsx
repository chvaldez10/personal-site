"use client";

import dynamic from "next/dynamic";
import { CanvasBoundary, useWebGLPreview } from "@/components/ui/WebGLPreview";
import styles from "./showcase.module.css";

export type ScenePreviewProps =
  | { kind: "workbench"; selected: "sketch" | "build" | "test" }
  | { kind: "box-office"; show: number; printCount: number };

const ShowcaseCanvas = dynamic(() => import("./ShowcaseCanvas"), {
  ssr: false,
});

export default function ScenePreview(props: ScenePreviewProps) {
  const { frame, nearby, shouldRender, ready, onReady, onFailure } =
    useWebGLPreview({ rootMargin: "240px 0px", trackVisibility: true });
  const interactive = props.kind === "workbench" && ready;

  return (
    <div
      ref={frame}
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The workbench handles arrow keys and Home.
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "application" : undefined}
      aria-label={
        interactive
          ? "3D workbench. Use arrow keys to rotate and Home to reset."
          : undefined
      }
      className={styles.preview}
      data-scene={props.kind}
      data-ready={ready}
    >
      <div className={styles.poster} aria-hidden="true" />
      {shouldRender && (
        <div className={styles.canvas} aria-hidden="true">
          <CanvasBoundary onFailure={onFailure}>
            <ShowcaseCanvas
              {...props}
              frame={frame}
              nearby={nearby}
              onReady={onReady}
            />
          </CanvasBoundary>
        </div>
      )}
    </div>
  );
}
