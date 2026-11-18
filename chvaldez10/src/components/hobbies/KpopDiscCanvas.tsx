"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  DoubleSide,
  SRGBColorSpace,
  type Group,
} from "three";

const vertexShader = `
  varying vec2 discPosition;
  void main() {
    discPosition = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 tint;
  varying vec2 discPosition;
  void main() {
    float radius = length(discPosition);
    float angle = atan(discPosition.y, discPosition.x);
    vec3 spectrum = 0.5 + 0.5 * cos(angle * 2.0 + radius * 2.0 + vec3(0.0, 2.1, 4.2));
    float reflection = pow(0.5 + 0.5 * cos(angle * 3.0 - radius * 2.0), 5.0);
    float grooves = 0.5 + 0.5 * sin(radius * 280.0);
    vec3 surface = mix(tint * 0.85, spectrum, 0.38);
    surface = mix(surface, vec3(1.0), 0.32 * reflection + 0.05 * grooves);
    surface *= 1.0 - 0.22 * smoothstep(1.34, 1.42, radius);
    gl_FragColor = vec4(surface, 1.0);
    #include <colorspace_fragment>
  }
`;

function Disc({
  color,
  spinning,
  onReady,
}: {
  color: string;
  spinning: boolean;
  onReady: (ready: boolean) => void;
}) {
  const disc = useRef<Group>(null);
  const uniforms = useMemo(
    () => ({ tint: { value: new Color(color) } }),
    [color],
  );

  useEffect(() => {
    onReady(true);
    return () => onReady(false);
  }, [onReady]);

  useFrame((_, delta) => {
    if (spinning && disc.current)
      disc.current.rotation.z -= Math.min(delta, 0.04) * 0.9;
  });

  return (
    <group
      rotation={[0.18, -0.32, -0.18]}
      position={[0.92, 0.32, 0.7]}
      scale={0.83}
    >
      <group ref={disc}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.017]}>
          <cylinderGeometry args={[1.47, 1.47, 0.055, 64, 1, true]} />
          <meshStandardMaterial
            color="#b2a1c4"
            metalness={0.55}
            roughness={0.26}
            side={DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, -0.035]}>
          <ringGeometry args={[0.17, 1.47, 64]} />
          <meshStandardMaterial
            color="#86708e"
            metalness={0.35}
            roughness={0.35}
            side={DoubleSide}
          />
        </mesh>
        <mesh>
          <ringGeometry args={[0.38, 1.45, 64]} />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
          />
        </mesh>
        <mesh position={[0, 0, 0.014]}>
          <ringGeometry args={[0.17, 0.38, 64]} />
          <meshStandardMaterial
            color="#eed7fb"
            metalness={0.38}
            roughness={0.28}
          />
        </mesh>
        <mesh position={[0, 0, 0.019]}>
          <ringGeometry args={[0.38, 0.41, 64]} />
          <meshBasicMaterial color="#fff0ff" />
        </mesh>
      </group>
    </group>
  );
}

function JewelCase({ color, name }: { color: string; name: string }) {
  const cover = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const gradient = context.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#fff2fa");
    gradient.addColorStop(0.46, color);
    gradient.addColorStop(1, "#775493");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    context.strokeStyle = "#ffffffaa";
    context.lineWidth = 3;
    context.strokeRect(22, 22, 468, 468);
    context.fillStyle = "#321b43";
    context.font = "900 67px system-ui";
    context.fillText(name, 42, 112, 417);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, [color, name]);

  useEffect(() => () => cover?.dispose(), [cover]);

  return (
    <group position={[-0.84, -0.12, -0.36]} rotation={[-0.13, 0.4, 0.24]}>
      <mesh>
        <boxGeometry args={[2.72, 2.47, 0.24]} />
        <meshStandardMaterial
          color="#3a2549"
          roughness={0.36}
          metalness={0.22}
        />
      </mesh>
      <mesh position={[0.06, 0, 0.13]}>
        <boxGeometry args={[2.48, 2.36, 0.045]} />
        <meshStandardMaterial
          map={cover}
          color={cover ? "#ffffff" : color}
          roughness={0.36}
        />
      </mesh>
      <mesh position={[-1.21, 0, 0.15]}>
        <boxGeometry args={[0.2, 2.46, 0.07]} />
        <meshStandardMaterial color="#5a386a" roughness={0.24} />
      </mesh>
      {[0.43, 0.67, 0.91].map((radius) => (
        <mesh
          key={radius}
          position={[-0.08, -0.25, 0.16]}
          scale={[1, 0.62, 1]}
          rotation={[0, 0, Math.PI / 7]}
        >
          <torusGeometry args={[radius, 0.022, 8, 40]} />
          <meshStandardMaterial color="#fff0fd" roughness={0.27} />
        </mesh>
      ))}
      <mesh position={[-0.63, 0.2, 0.173]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.2, 0.035]} />
        <meshStandardMaterial color="#fff8ff" roughness={0.28} />
      </mesh>
    </group>
  );
}

function Stage({
  orbit,
  name,
  ...props
}: Parameters<typeof Disc>[0] & {
  name: string;
  orbit: { yaw: number; pitch: number };
}) {
  const scale = useThree(({ size }) =>
    Math.min(1, size.width / (1.3 * Math.max(1, size.height))),
  );
  return (
    <group rotation={[orbit.pitch, orbit.yaw, -0.035]} scale={scale}>
      <JewelCase color={props.color} name={name} />
      <Disc {...props} />
    </group>
  );
}

export default function KpopDiscCanvas(props: Parameters<typeof Stage>[0]) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.9], fov: 33 }}
      dpr={1}
      frameloop={props.spinning ? "always" : "demand"}
    >
      <ambientLight intensity={1.45} />
      <directionalLight position={[-2, 4, 4]} intensity={2.6} />
      <directionalLight position={[3, -2, 1]} color="#b9a1ff" intensity={1.7} />
      <Stage {...props} />
    </Canvas>
  );
}
