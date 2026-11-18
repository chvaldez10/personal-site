"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";

let supportsWebGL: boolean | undefined;

function canRenderScene() {
  if (supportsWebGL !== undefined) return supportsWebGL;
  try {
    const context = document.createElement("canvas").getContext("webgl2");
    supportsWebGL = context !== null;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    supportsWebGL = false;
  }
  return supportsWebGL;
}

export function useWebGLPreview({
  rootMargin = "0px",
  trackVisibility = false,
} = {}) {
  const frame = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      const frameId = requestAnimationFrame(() => {
        setNearby(true);
        setLoaded(canRenderScene());
      });
      return () => cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearby(entry.isIntersecting);
        if (entry.isIntersecting) {
          setLoaded(canRenderScene());
          if (!trackVisibility) observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, trackVisibility]);

  return {
    frame,
    nearby,
    shouldRender: loaded && !failed,
    ready: ready && !failed,
    onReady: setReady,
    onFailure: () => setFailed(true),
  };
}

export class CanvasBoundary extends Component<
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
