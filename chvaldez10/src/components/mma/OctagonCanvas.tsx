"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { CanvasTexture, DoubleSide, RepeatWrapping } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const radius = 3.25;
const wallHeight = 1.65;
const corners = Array.from({ length: 8 }, (_, index) => {
  const angle = ((index + 0.5) * Math.PI) / 4;
  return { x: Math.sin(angle) * radius, z: Math.cos(angle) * radius };
});
const cameraSettings = {
  position: [8.2, 7.5, 10.7] as [number, number, number],
  fov: 36,
};

function Camera({ onReady }: { onReady: (ready: boolean) => void }) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const canvas = gl.domElement;
    camera.lookAt(0, 0.55, 0);
    invalidate();
    const reveal = () => onReady(true);
    const hide = () => onReady(false);
    const frame = requestAnimationFrame(reveal);
    canvas.addEventListener("webglcontextlost", hide);
    canvas.addEventListener("webglcontextrestored", reveal);
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", hide);
      canvas.removeEventListener("webglcontextrestored", reveal);
    };
  }, [camera, gl, invalidate, onReady]);

  useEffect(() => {
    const canvas = gl.domElement;
    const preview = canvas.closest("[data-octagon]");
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0.55, 0);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.65;
    controls.minPolarAngle = 0.48;
    controls.maxPolarAngle = 1.29;
    controls.update();
    const redraw = () => invalidate();
    controls.addEventListener("change", redraw);

    function rotate(event: Event) {
      if (!(event instanceof KeyboardEvent)) return;
      switch (event.key) {
        case "ArrowLeft":
          controls.rotateLeft(0.15);
          break;
        case "ArrowRight":
          controls.rotateLeft(-0.15);
          break;
        case "ArrowUp":
          controls.rotateUp(0.13);
          break;
        case "ArrowDown":
          controls.rotateUp(-0.13);
          break;
        case "Home":
          camera.position.set(...cameraSettings.position);
          controls.update();
          break;
        default:
          return;
      }
      event.preventDefault();
    }

    preview?.addEventListener("keydown", rotate);
    return () => {
      controls.removeEventListener("change", redraw);
      controls.dispose();
      preview?.removeEventListener("keydown", rotate);
    };
  }, [camera, gl, invalidate]);
  return null;
}

function Cage() {
  const [meshTile] = useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    if (context) {
      context.strokeStyle = "#40353a";
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(64, 64);
      context.moveTo(64, 0);
      context.lineTo(0, 64);
      context.stroke();
    }
    const texture = new CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(12, 8);
    return texture;
  });

  useEffect(() => () => meshTile.dispose(), [meshTile]);

  return (
    <group>
      <mesh position-y={-0.17} receiveShadow castShadow>
        <cylinderGeometry
          args={[radius + 0.11, radius + 0.11, 0.32, 8, 1, false, -Math.PI / 8]}
        />
        <meshStandardMaterial color="#524048" />
      </mesh>
      <mesh position-y={0.014} receiveShadow>
        <cylinderGeometry
          args={[radius, radius, 0.08, 8, 1, false, -Math.PI / 8]}
        />
        <meshStandardMaterial color="#bb9d91" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.059} receiveShadow>
        <ringGeometry args={[1.43, 1.48, 8, 1, Math.PI / 8]} />
        <meshStandardMaterial color="#f7dfce" />
      </mesh>
      {corners.map((corner, index) => {
        const next = corners[(index + 1) % corners.length];
        const dx = next.x - corner.x;
        const dz = next.z - corner.z;
        const width = Math.hypot(dx, dz);
        const color =
          index < 2 || index > 6
            ? "#b6564d"
            : index > 2 && index < 6
              ? "#4d6d76"
              : "#494047";
        return (
          <group key={index}>
            <mesh
              position={[corner.x, wallHeight / 2 + 0.075, corner.z]}
              castShadow
            >
              <boxGeometry args={[0.16, wallHeight + 0.16, 0.16]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <group
              position={[
                corner.x + dx / 2,
                wallHeight / 2 + 0.075,
                corner.z + dz / 2,
              ]}
              rotation-y={Math.atan2(-dz, dx)}
            >
              <mesh>
                <planeGeometry args={[width, wallHeight]} />
                <meshBasicMaterial
                  map={meshTile}
                  color="#5b4950"
                  opacity={0.56}
                  transparent
                  depthWrite={false}
                  side={DoubleSide}
                />
              </mesh>
              {[-wallHeight / 2, wallHeight / 2].map((height) => (
                <mesh key={height} position-y={height}>
                  <boxGeometry args={[width, 0.085, 0.085]} />
                  <meshStandardMaterial color="#4a3c43" />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}
      {[0, 1, 2].map((step) => (
        <mesh
          key={step}
          position={[0.65, -0.37 + step * 0.11, 4.05 - step * 0.24]}
          castShadow
        >
          <boxGeometry args={[0.94, 0.11, 0.76 - step * 0.14]} />
          <meshStandardMaterial color="#60525a" />
        </mesh>
      ))}
    </group>
  );
}

export default function OctagonCanvas(props: {
  onReady: (ready: boolean) => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={cameraSettings}
      shadows="percentage"
    >
      <hemisphereLight args={["#fff6e9", "#877480", 2.3]} />
      <directionalLight
        position={[-4, 8, 4]}
        color="#ffebcf"
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-normalBias={0.025}
      />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.44} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#d6bfb2" roughness={1} />
      </mesh>
      <Camera {...props} />
      <Cage />
    </Canvas>
  );
}
