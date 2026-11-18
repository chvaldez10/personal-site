"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import { MathUtils, PerspectiveCamera } from "three";
import { BoxOfficeModel, WorkbenchModel } from "./ShowcaseModels";
import type {
  ScenePreviewProps,
  WorkbenchLook,
  WorkbenchViewAction,
} from "./ScenePreview";

type SceneProps = ScenePreviewProps & {
  frame: RefObject<HTMLDivElement | null>;
  registerLook: (handler: WorkbenchLook | null) => void;
  nearby: boolean;
  onReady: (ready: boolean) => void;
};

function CameraMotion({
  kind,
  frame,
  registerLook,
  nearby,
  onReady,
}: SceneProps) {
  const invalidate = useThree((state) => state.invalidate);
  const canvas = useThree((state) => state.gl.domElement);
  const motion = useRef({
    targetYaw: 0,
    targetPitch: 0,
    yaw: 0,
    pitch: 0,
    reduced: false,
  });
  const firstFrame = useRef(true);
  const revealFrame = useRef<number | null>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element || !nearby || kind !== "workbench") return;

    const state = motion.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let drag: { id: number; x: number; y: number; scale: number } | undefined;

    function adjustView(horizontal: number, vertical: number) {
      state.targetYaw = MathUtils.clamp(
        state.targetYaw + horizontal,
        -0.48,
        0.48,
      );
      state.targetPitch = MathUtils.clamp(
        state.targetPitch + vertical,
        -0.22,
        0.18,
      );
      invalidate();
    }

    function lookAround(action: WorkbenchViewAction) {
      if (action === "center") {
        state.targetYaw = 0;
        state.targetPitch = 0;
        invalidate();
      } else {
        adjustView(action === "left" ? -0.15 : 0.15, 0);
      }
    }

    function start(event: PointerEvent) {
      if (
        !element ||
        element.dataset.ready !== "true" ||
        drag ||
        !event.isPrimary ||
        event.button !== 0
      ) {
        return;
      }

      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        scale: 240 / Math.max(1, element.clientHeight),
      };
      element.setPointerCapture(event.pointerId);
    }

    function move(event: PointerEvent) {
      if (drag?.id !== event.pointerId) return;
      adjustView(
        (drag.x - event.clientX) * drag.scale * 0.006,
        event.pointerType === "touch"
          ? 0
          : (event.clientY - drag.y) * drag.scale * 0.004,
      );
      drag.x = event.clientX;
      drag.y = event.clientY;
    }

    function end(event: PointerEvent) {
      if (drag?.id === event.pointerId) drag = undefined;
    }

    function useKeys(event: KeyboardEvent) {
      if (element?.dataset.ready !== "true") return;
      switch (event.key) {
        case "ArrowLeft":
          lookAround("left");
          break;
        case "ArrowRight":
          lookAround("right");
          break;
        case "ArrowUp":
          adjustView(0, 0.08);
          break;
        case "ArrowDown":
          adjustView(0, -0.08);
          break;
        case "Home":
          lookAround("center");
          break;
        default:
          return;
      }
      event.preventDefault();
    }

    function updatePreference() {
      state.reduced = media.matches;
      invalidate();
    }

    updatePreference();
    registerLook(lookAround);
    media.addEventListener("change", updatePreference);
    element.addEventListener("pointerdown", start);
    element.addEventListener("pointermove", move);
    element.addEventListener("lostpointercapture", end);
    element.addEventListener("keydown", useKeys);
    return () => {
      registerLook(null);
      media.removeEventListener("change", updatePreference);
      element.removeEventListener("pointerdown", start);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("lostpointercapture", end);
      element.removeEventListener("keydown", useKeys);
      if (drag && element.hasPointerCapture(drag.id)) {
        element.releasePointerCapture(drag.id);
      }
    };
  }, [frame, invalidate, kind, registerLook, nearby]);

  useEffect(() => {
    function cancelReveal() {
      if (revealFrame.current === null) return;
      cancelAnimationFrame(revealFrame.current);
      revealFrame.current = null;
    }

    function hide() {
      cancelReveal();
      onReady(false);
    }
    function reveal() {
      firstFrame.current = true;
      invalidate();
    }
    canvas.addEventListener("webglcontextlost", hide);
    canvas.addEventListener("webglcontextrestored", reveal);
    return () => {
      cancelReveal();
      canvas.removeEventListener("webglcontextlost", hide);
      canvas.removeEventListener("webglcontextrestored", reveal);
    };
  }, [canvas, invalidate, onReady]);

  useFrame(({ camera, size }, delta) => {
    const state = motion.current;
    const workbench = kind === "workbench";
    const still = firstFrame.current || state.reduced || !nearby;
    const step = Math.min(delta, 0.035);
    state.yaw = still
      ? state.targetYaw
      : MathUtils.damp(state.yaw, state.targetYaw, 11, step);
    state.pitch = still
      ? state.targetPitch
      : MathUtils.damp(state.pitch, state.targetPitch, 11, step);

    const aspect = size.width / size.height;
    const zoom = Math.min(1.04, aspect / 1.62);
    // Lift the desk above the stacked controls in a tall viewport.
    const offsetY = Math.round(
      Math.max(0, size.height - size.width / 1.35) * 0.54,
    );
    if (
      workbench &&
      camera instanceof PerspectiveCamera &&
      (camera.fov !== 43 ||
        camera.zoom !== zoom ||
        camera.view?.width !== size.width ||
        camera.view?.height !== size.height ||
        camera.view?.offsetY !== offsetY)
    ) {
      camera.fov = 43;
      camera.zoom = zoom;
      camera.setViewOffset(
        size.width,
        size.height,
        0,
        offsetY,
        size.width,
        size.height,
      );
    }
    if (workbench) {
      camera.position.set(0, 2.15, 3.45);
      camera.rotation.set(-0.43 + state.pitch, -state.yaw, 0, "YXZ");
    } else {
      const distance = Math.max(9.15, 8.3 / aspect);
      camera.position.set(
        Math.sin(0.38) * distance,
        2.85,
        Math.cos(0.38) * distance,
      );
      camera.lookAt(0, 0.82, 0);
    }

    if (firstFrame.current) {
      firstFrame.current = false;
      revealFrame.current = requestAnimationFrame(() => {
        revealFrame.current = null;
        onReady(true);
      });
      invalidate();
    }

    if (
      nearby &&
      Math.abs(state.yaw - state.targetYaw) +
        Math.abs(state.pitch - state.targetPitch) >
        0.001
    ) {
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
      dpr={1}
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
        shadow-mapSize={[512, 512]}
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
