"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/buttons";
import styles from "./showcase.module.css";

export type ScenePreviewProps =
  | { kind: "workbench"; selected: "sketch" | "build" | "test" }
  | { kind: "box-office"; show: number; printCount: number };

const ShowcaseCanvas = dynamic(() => import("./ShowcaseCanvas"), {
  ssr: false,
});

let supportsWebGL: boolean | undefined;

function canRenderScene() {
  if (supportsWebGL === undefined) {
    const context = document.createElement("canvas").getContext("webgl2");
    supportsWebGL = context !== null;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  }
  return supportsWebGL;
}

class CanvasBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function ScenePreview(props: ScenePreviewProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exploring, setExploring] = useState(false);
  const instructions = useId();
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
      className={styles.preview}
      data-scene={props.kind}
      data-ready={ready && !failed}
      data-exploring={interactive && exploring}
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
              exploring={interactive && exploring}
            />
          </CanvasBoundary>
        </div>
      )}
      {interactive && (
        <div className={styles.sceneControls}>
          {exploring && (
            <span className={styles.dragHint}>Drag to look around</span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={styles.exploreBench}
            aria-pressed={exploring}
            aria-describedby={instructions}
            onClick={() => setExploring((active) => !active)}
            onKeyDown={(event) => {
              if (exploring && event.key === "Escape") setExploring(false);
            }}
          >
            {exploring ? "Done" : "Explore 3D"}
          </Button>
          <span id={instructions} className="sr-only">
            Activate, then drag the workbench or use the arrow keys to change
            your view. Press Home to reset the view or Escape to finish.
          </span>
        </div>
      )}
    </div>
  );
}
