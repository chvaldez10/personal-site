"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { canRenderScene, CanvasBoundary } from "@/components/ui/WebGLPreview";
import styles from "./showcase.module.css";

export type ScenePreviewProps =
  | { kind: "workbench"; selected: "sketch" | "build" | "test" }
  | { kind: "box-office"; show: number; printCount: number };

const ShowcaseCanvas = dynamic(() => import("./ShowcaseCanvas"), {
  ssr: false,
});

export default function ScenePreview(props: ScenePreviewProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const interactive = props.kind === "workbench" && ready && !failed;

  useEffect(() => {
    const element = frame.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearby(entry.isIntersecting);
        if (entry.isIntersecting && canRenderScene()) setLoaded(true);
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
      data-ready={ready && !failed}
    >
      <div className={styles.poster} aria-hidden="true" />
      {loaded && !failed && (
        <div className={styles.canvas} aria-hidden="true">
          <CanvasBoundary onFailure={() => setFailed(true)}>
            <ShowcaseCanvas
              {...props}
              frame={frame}
              nearby={nearby}
              onReady={setReady}
            />
          </CanvasBoundary>
        </div>
      )}
    </div>
  );
}
