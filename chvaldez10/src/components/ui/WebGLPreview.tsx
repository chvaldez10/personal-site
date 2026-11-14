"use client";

import { Component, type ReactNode } from "react";

let supportsWebGL: boolean | undefined;

export function canRenderScene() {
  if (supportsWebGL === undefined) {
    const context = document.createElement("canvas").getContext("webgl2");
    supportsWebGL = context !== null;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  }
  return supportsWebGL;
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
