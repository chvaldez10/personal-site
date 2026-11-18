"use client";

import dynamic from "next/dynamic";
import { CanvasBoundary, useWebGLPreview } from "@/components/ui/WebGLPreview";
import { OctagonClock } from "./OctagonClock";

const OctagonCanvas = dynamic(() => import("./OctagonCanvas"), { ssr: false });

export default function OctagonPreview() {
  const { frame, shouldRender, ready, onReady, onFailure } = useWebGLPreview({
    rootMargin: "200px",
  });

  return (
    <div ref={frame} className="absolute inset-0" data-octagon>
      {shouldRender && (
        <div
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The scene handles arrow keys and Home.
          tabIndex={ready ? 0 : -1}
          aria-hidden={!ready}
          role="application"
          aria-label="3D octagon. Use arrow keys to rotate and Home to reset."
          className={`absolute inset-0 cursor-grab bg-[#ead7c8] transition-opacity duration-300 active:cursor-grabbing focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orange-700 motion-reduce:transition-none [&_canvas]:[touch-action:pan-y_pinch-zoom]! ${ready ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <CanvasBoundary onFailure={onFailure}>
            <OctagonCanvas onReady={onReady} />
          </CanvasBoundary>
        </div>
      )}
      <OctagonClock />
    </div>
  );
}
