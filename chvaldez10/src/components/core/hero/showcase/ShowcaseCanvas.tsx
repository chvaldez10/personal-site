"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import { MathUtils, type PerspectiveCamera } from "three";
import { BoxOfficeModel, WorkbenchModel } from "./ShowcaseModels";
import type { ScenePreviewProps } from "./ScenePreview";

type SceneProps = ScenePreviewProps & {
  frame: RefObject<HTMLDivElement | null>;
  nearby: boolean;
  onReady: (ready: boolean) => void;
  exploring: boolean;
};

function CameraMotion({ kind, frame, nearby, onReady, exploring }: SceneProps) {
  const invalidate = useThree((state) => state.invalidate);
  const canvas = useThree((state) => state.gl.domElement);
  const motion = useRef({
    pointer: 0,
    pointerY: 0,
    orbit: 0,
    elevation: 0,
    scroll: 0,
    angle: 0,
    lift: 0,
    reduced: false,
  });
  const firstFrame = useRef(true);

  useEffect(() => {
    const element = frame.current;
    if (!element || !nearby) return;

    const state = motion.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const workbench = kind === "workbench";
    let drag: { id: number; x: number; y: number } | undefined;

    function adjustView(horizontal: number, vertical: number) {
      state.orbit = MathUtils.clamp(state.orbit + horizontal, -1.05, 0.48);
      state.elevation = MathUtils.clamp(state.elevation + vertical, -2.8, 2.2);
      invalidate();
    }

    function start(event: PointerEvent) {
      if (
        !element ||
        drag ||
        !event.isPrimary ||
        event.button !== 0 ||
        (event.pointerType !== "mouse" && !exploring) ||
        (event.target instanceof Element && event.target.closest("button"))
      )
        return;

      drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      state.pointer = 0;
      state.pointerY = 0;
      element.setPointerCapture(event.pointerId);
      invalidate();
    }

    function move(event: PointerEvent) {
      if (drag?.id === event.pointerId && element) {
        const scale = 240 / element.clientHeight;
        adjustView(
          (drag.x - event.clientX) * scale * 0.006,
          (event.clientY - drag.y) * scale * 0.025,
        );
        drag.x = event.clientX;
        drag.y = event.clientY;
        return;
      }
      if (event.pointerType !== "mouse" || state.reduced || !element) return;
      const bounds = element.getBoundingClientRect();
      state.pointer = (event.clientX - bounds.left) / bounds.width - 0.5;
      state.pointerY = (bounds.top - event.clientY) / bounds.height + 0.5;
      invalidate();
    }

    function resetPointer() {
      state.pointer = 0;
      state.pointerY = 0;
      invalidate();
    }

    function end(event: PointerEvent) {
      if (drag?.id === event.pointerId) drag = undefined;
    }

    function useKeys(event: KeyboardEvent) {
      if (!exploring) return;
      switch (event.key) {
        case "ArrowLeft":
          adjustView(-0.12, 0);
          break;
        case "ArrowRight":
          adjustView(0.12, 0);
          break;
        case "ArrowUp":
          adjustView(0, 0.35);
          break;
        case "ArrowDown":
          adjustView(0, -0.35);
          break;
        case "Home":
          state.orbit = 0;
          state.elevation = 0;
          invalidate();
          break;
        default:
          return;
      }
      event.preventDefault();
    }

    function scroll() {
      if (!element || state.reduced) return;
      const bounds = element.getBoundingClientRect();
      state.scroll = MathUtils.clamp(
        (bounds.top + bounds.height / 2) / window.innerHeight - 0.5,
        -0.65,
        0.65,
      );
      invalidate();
    }

    function updatePreference() {
      state.reduced = media.matches;
      state.pointer = 0;
      state.pointerY = 0;
      if (state.reduced) invalidate();
      else scroll();
    }

    updatePreference();
    media.addEventListener("change", updatePreference);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", resetPointer);
    if (workbench) {
      element.addEventListener("pointerdown", start);
      element.addEventListener("lostpointercapture", end);
      element.addEventListener("keydown", useKeys);
    }
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      state.pointer = 0;
      state.pointerY = 0;
      media.removeEventListener("change", updatePreference);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", resetPointer);
      element.removeEventListener("pointerdown", start);
      element.removeEventListener("lostpointercapture", end);
      element.removeEventListener("keydown", useKeys);
      if (drag && element.hasPointerCapture(drag.id)) {
        element.releasePointerCapture(drag.id);
      }
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    };
  }, [exploring, frame, invalidate, kind, nearby]);

  useEffect(() => {
    function hide() {
      onReady(false);
    }
    function reveal() {
      firstFrame.current = true;
      invalidate();
    }
    canvas.addEventListener("webglcontextlost", hide);
    canvas.addEventListener("webglcontextrestored", reveal);
    return () => {
      canvas.removeEventListener("webglcontextlost", hide);
      canvas.removeEventListener("webglcontextrestored", reveal);
    };
  }, [canvas, invalidate, onReady]);

  useFrame(({ camera, size }, delta) => {
    const state = motion.current;
    const workbench = kind === "workbench";
    const offset = state.scroll;
    const still = firstFrame.current || state.reduced || !nearby || exploring;
    const angle =
      state.orbit +
      (exploring ? -0.26 : 0) +
      (still ? 0 : state.pointer * 0.3 + offset * 0.36);
    const lift =
      state.elevation +
      (exploring ? 0.65 : 0) +
      (still ? 0 : offset * 0.95 + (workbench ? state.pointerY * 0.7 : 0));

    const step = Math.min(delta, 0.035);
    state.angle = state.reduced
      ? angle
      : MathUtils.damp(state.angle, angle, 8, step);
    state.lift = state.reduced
      ? lift
      : MathUtils.damp(state.lift, lift, 8, step);

    const aspect = size.width / size.height;
    const restingDistance = Math.max(
      workbench ? 8.65 : 9.15,
      (workbench ? 9.3 : 8.3) / aspect,
    );
    const distance =
      restingDistance + Math.abs(state.lift) * (workbench ? 0.4 : 0.75);
    const orbit = (workbench ? 0.43 : 0.38) + state.angle;
    camera.position.set(
      Math.sin(orbit) * distance,
      (workbench ? 4.05 : 2.85) + state.lift,
      Math.cos(orbit) * distance,
    );
    camera.lookAt(0, workbench ? 0.33 : 0.82, 0);

    if (firstFrame.current) {
      firstFrame.current = false;
      onReady(true);
      invalidate();
    }

    if (Math.abs(state.angle - angle) + Math.abs(state.lift - lift) > 0.001) {
      invalidate();
    }
  });

  return null;
}

const camera = {
  fov: 34,
  near: 0.1,
  far: 40,
} satisfies Partial<PerspectiveCamera>;

export default function ShowcaseCanvas(props: SceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={camera}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      resize={{ scroll: false }}
      shadows="percentage"
    >
      <hemisphereLight args={["#fffaf4", "#b8876c", 2]} />
      <directionalLight
        position={[-3, 8, 4]}
        intensity={2.2}
        color="#fff2da"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={3}
        shadow-normalBias={0.026}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[4, 2, -4]} intensity={1} color="#ffd5c8" />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.88} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
      <CameraMotion {...props} />
      {props.kind === "workbench" ? (
        <WorkbenchModel selected={props.selected} />
      ) : (
        <BoxOfficeModel show={props.show} printCount={props.printCount} />
      )}
    </Canvas>
  );
}
