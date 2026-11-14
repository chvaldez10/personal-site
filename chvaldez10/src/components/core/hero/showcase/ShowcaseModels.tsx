import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  CanvasTexture,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type MeshBasicMaterial,
} from "three";
import { sampleShows } from "../sampleShows";
import type { ScenePreviewProps } from "./ScenePreview";

type Vector = [number, number, number];

const ivory = "#fff0d6";
const ink = "#392c33";
const coral = "#ce5d44";
const wine = "#733245";
const peach = "#ebac75";
const gold = "#f5bd68";

function Block({
  size,
  at = [0, 0, 0],
  color,
}: {
  size: Vector;
  at?: Vector;
  color: string;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.82} />
    </mesh>
  );
}

function Label({
  text,
  color,
  at,
  width,
  height,
}: {
  text: string;
  color: string;
  at: Vector;
  width: number;
  height: number;
}) {
  const materialRef = useRef<MeshBasicMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = Math.round(512 * (height / width));
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = color;
    context.font = `bold ${Math.round(canvas.height * 0.68)}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width);

    const label = new CanvasTexture(canvas);
    label.colorSpace = SRGBColorSpace;
    material.map = label;
    material.opacity = 1;
    material.needsUpdate = true;
    invalidate();
    return () => {
      material.map = null;
      label.dispose();
    };
  }, [color, height, invalidate, text, width]);

  return (
    <mesh position={at}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={materialRef}
        opacity={0}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Laptop() {
  return (
    <>
      <Block size={[1.94, 0.09, 1.25]} color={ink} at={[0, 0.05, 0.16]} />
      <Block size={[1.69, 0.025, 1.05]} color="#77727c" at={[0, 0.105, 0.16]} />
      {[0, 1, 2, 3].map((row) => (
        <Block
          key={row}
          size={[1.38, 0.022, 0.083]}
          color={ink}
          at={[0, 0.126, -0.23 + row * 0.128]}
        />
      ))}
      <Block size={[0.52, 0.015, 0.27]} color="#aaa0a1" at={[0, 0.124, 0.5]} />
      <group position={[0, 0.14, -0.44]} rotation-x={-0.29}>
        <Block size={[1.94, 1.25, 0.09]} color={ink} at={[0, 0.6, 0]} />
        <Block size={[1.76, 1.07, 0.014]} color={ivory} at={[0, 0.64, 0.055]} />
        <Block
          size={[1.76, 0.14, 0.014]}
          color={peach}
          at={[0, 1.097, 0.069]}
        />
        <Block
          size={[0.36, 0.75, 0.014]}
          color="#dcba9e"
          at={[-0.6, 0.58, 0.069]}
        />
        <Block
          size={[1.08, 0.4, 0.014]}
          color="#fff9e9"
          at={[0.18, 0.69, 0.069]}
        />
        <Label
          text="✓"
          color={wine}
          at={[0.18, 0.69, 0.081]}
          width={0.5}
          height={0.36}
        />
        <Block
          size={[0.92, 0.025, 0.014]}
          color={coral}
          at={[0.1, 0.37, 0.069]}
        />
        <Block
          size={[0.65, 0.025, 0.014]}
          color="#d8b29a"
          at={[-0.04, 0.28, 0.069]}
        />
      </group>
    </>
  );
}

function Notebook() {
  return (
    <group rotation={[-0.24, 0.08, 0.12]}>
      <Block size={[1.19, 0.065, 1.44]} color={wine} at={[0, 0.19, 0]} />
      <Block size={[1.13, 0.08, 1.39]} color={ivory} at={[0.024, 0.25, 0]} />
      <Block size={[1.17, 0.028, 1.43]} color="#f7dfb8" at={[0, 0.298, 0]} />
      <Block size={[0.16, 0.02, 1.43]} color={coral} at={[-0.48, 0.321, 0]} />
      <Block
        size={[0.58, 0.009, 0.05]}
        color={wine}
        at={[0.12, 0.321, -0.39]}
      />
      <Block
        size={[0.35, 0.009, 0.02]}
        color={coral}
        at={[0.002, 0.32, -0.27]}
      />
      <Block size={[0.65, 0.009, 0.58]} color={ivory} at={[0.09, 0.32, 0.17]} />
      {[0.16, 0.28, 0.44, 0.33].map((height, index) => (
        <Block
          key={index}
          size={[0.065, 0.01, height]}
          color={coral}
          at={[-0.12 + index * 0.14, 0.329, 0.42 - height / 2]}
        />
      ))}
    </group>
  );
}

function Phone() {
  return (
    <group rotation={[-0.78, 0, -0.1]}>
      <Block size={[0.59, 1.02, 0.095]} color={wine} at={[0, 0.37, 0.14]} />
      <Block size={[0.52, 0.89, 0.016]} color={ivory} at={[0, 0.38, 0.194]} />
      <Block size={[0.36, 0.045, 0.015]} color={coral} at={[0, 0.674, 0.208]} />
      {[0.52, 0.35, 0.18].map((height) => (
        <group key={height}>
          <Block
            size={[0.38, 0.11, 0.014]}
            color="#e6c6ae"
            at={[0, height, 0.208]}
          />
          <Block
            size={[0.056, 0.056, 0.014]}
            color={wine}
            at={[-0.12, height, 0.221]}
          />
        </group>
      ))}
    </group>
  );
}

function BenchProp({
  children,
  position,
  rotation,
  lift,
}: {
  children: React.ReactNode;
  position: Vector;
  rotation: number;
  lift: number;
}) {
  const group = useRef<Group>(null);
  const positioned = useRef(false);
  const reducedMotion = useRef(false);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function update() {
      reducedMotion.current = media.matches;
      invalidate();
    }
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [invalidate]);

  useEffect(() => {
    // A lift change needs a first frame even when the canvas is idle.
    invalidate();
  }, [invalidate, lift]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const height = MathUtils.damp(
      group.current.position.y,
      lift,
      13,
      Math.min(delta, 0.035),
    );
    group.current.position.y =
      reducedMotion.current || !positioned.current ? lift : height;
    positioned.current = true;
    if (Math.abs(group.current.position.y - lift) > 0.001) invalidate();
  });

  return (
    <group ref={group} position={position} rotation-y={rotation}>
      {children}
    </group>
  );
}

export function WorkbenchModel({
  selected,
}: Pick<Extract<ScenePreviewProps, { kind: "workbench" }>, "selected">) {
  return (
    <>
      <Block size={[30, 0.18, 6.3]} color="#d6a576" at={[0, -0.078, 1.45]} />
      <Block size={[30, 0.12, 0.12]} color="#c18a61" at={[0, 0.045, -1.68]} />
      {[-1.16, -0.53, 0.13, 0.82, 1.51, 2.22, 3].map((depth) => (
        <mesh
          key={depth}
          rotation-x={-Math.PI / 2}
          position={[0, 0.013, depth]}
        >
          <planeGeometry args={[30, 0.009]} />
          <meshStandardMaterial color="#c18d62" />
        </mesh>
      ))}
      <group position={[-2.75, 0, -1.1]}>
        <mesh position-y={0.065} castShadow receiveShadow>
          <cylinderGeometry args={[0.33, 0.37, 0.11, 24]} />
          <meshStandardMaterial color="#60574c" />
        </mesh>
        <group rotation-z={-0.19}>
          <Block size={[0.08, 1.03, 0.08]} at={[0, 0.6, 0]} color="#60574c" />
        </group>
        <Block size={[0.57, 0.075, 0.08]} at={[0.48, 1.1, 0]} color="#60574c" />
        <mesh position={[0.76, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.29, 0.22, 24]} />
          <meshStandardMaterial color="#718074" />
        </mesh>
        <mesh position={[0.76, 0.936, 0]} rotation-x={Math.PI / 2}>
          <circleGeometry args={[0.235, 24]} />
          <meshBasicMaterial color="#fff0ce" />
        </mesh>
      </group>
      <Block
        size={[2.31, 0.021, 1.84]}
        color="#4e665d"
        at={[0.04, 0.026, 0.01]}
      />
      <gridHelper
        args={[1.74, 10, "#889888", "#889888"]}
        scale={[1.26, 1, 1]}
        position={[0.04, 0.038, 0.01]}
      />
      <BenchProp
        position={[-1.52, 0, 0.19]}
        rotation={0.23}
        lift={selected === "sketch" ? 0.14 : 0}
      >
        <Notebook />
      </BenchProp>
      <BenchProp
        position={[-0.12, 0, -0.45]}
        rotation={-0.05}
        lift={selected === "build" ? 0.13 : 0}
      >
        <Laptop />
      </BenchProp>
      <BenchProp
        position={[1.18, 0, 0.36]}
        rotation={-0.12}
        lift={selected === "test" ? 0.12 : 0}
      >
        <Phone />
      </BenchProp>
      <group position={[1.79, 0.02, -0.69]}>
        <mesh position-y={0.29} castShadow receiveShadow>
          <cylinderGeometry args={[0.31, 0.25, 0.56, 24]} />
          <meshStandardMaterial color={coral} />
        </mesh>
        <mesh position-y={0.58} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[0.272, 0.028, 8, 24]} />
          <meshStandardMaterial color="#ffe3c6" />
        </mesh>
        <mesh position-y={0.572} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.253, 24]} />
          <meshStandardMaterial color="#6b3931" />
        </mesh>
        <mesh position={[0.31, 0.31, 0]} castShadow>
          <torusGeometry args={[0.16, 0.045, 8, 16]} />
          <meshStandardMaterial color={coral} />
        </mesh>
      </group>
      <group position={[-0.35, 0.06, 0.89]} rotation-y={-0.24}>
        <Block size={[0.89, 0.054, 0.054]} color={gold} />
        <Block size={[0.13, 0.056, 0.056]} color="#da737e" at={[-0.49, 0, 0]} />
        <Block size={[0.11, 0.032, 0.032]} color={ink} at={[0.49, 0, 0]} />
      </group>
      <group position={[-1.65, 0.039, 1.04]} rotation-y={0.12}>
        <Block size={[1.37, 0.033, 0.19]} color={gold} />
        {Array.from({ length: 13 }, (_, tick) => {
          const depth = tick % 4 === 0 ? 0.095 : 0.055;
          return (
            <Block
              key={tick}
              size={[0.012, 0.002, depth]}
              color={wine}
              at={[-0.6 + tick * 0.1, 0.018, 0.074 - depth / 2]}
            />
          );
        })}
      </group>
    </>
  );
}

const marqueeBulbs = [-1.68, -1.26, -0.84, -0.42, 0, 0.42, 0.84, 1.26, 1.68];
const showColors = [gold, "#ee9ba5", "#9dc4b6"];

function PrintedTicket({
  color,
  printCount,
}: {
  color: string;
  printCount: number;
}) {
  const ticket = useRef<Group>(null);
  const elapsed = useRef(0);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    elapsed.current =
      printCount > 0 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 1;
    invalidate();
  }, [invalidate, printCount]);

  useFrame((_, delta) => {
    if (!ticket.current) return;
    elapsed.current = Math.min(
      elapsed.current + Math.min(delta, 0.045) * 1.75,
      1,
    );
    const progress = MathUtils.smoothstep(elapsed.current, 0, 1);
    ticket.current.position.set(
      0.85,
      -0.05 - progress * 0.075,
      1.02 + progress * 0.38,
    );
    ticket.current.rotation.x = -0.13 + progress * 0.15;
    if (elapsed.current < 1) invalidate();
  });

  return (
    <group ref={ticket}>
      <Block size={[0.72, 0.028, 0.57]} color={ivory} />
      <Block size={[0.14, 0.012, 0.57]} color={color} at={[-0.28, 0.019, 0]} />
      {[0.09, 0.16, 0.21].map((offset) => (
        <Block
          key={offset}
          size={[0.28, 0.01, 0.019]}
          color={wine}
          at={[0.04, 0.02, offset - 0.22]}
        />
      ))}
    </group>
  );
}

export function BoxOfficeModel({
  show,
  printCount,
}: Pick<
  Extract<ScenePreviewProps, { kind: "box-office" }>,
  "show" | "printCount"
>) {
  const color = showColors[show];

  return (
    <>
      <Block size={[4.65, 0.17, 2.75]} color="#bf866c" at={[0, -0.79, 0.04]} />
      <Block size={[3.82, 2.46, 1.46]} color="#b75b54" at={[0, 0.49, -0.1]} />
      <Block size={[3.48, 0.64, 0.15]} color={wine} at={[0, -0.35, 0.68]} />
      {[-1.49, -1.33, -1.17, 1.17, 1.33, 1.49].map((x) => (
        <Block
          key={x}
          size={[0.035, 0.51, 0.025]}
          color="#ac6170"
          at={[x, -0.35, 0.77]}
        />
      ))}
      <Block size={[3.33, 1.15, 0.097]} color="#5e3c48" at={[0, 0.85, 0.66]} />
      <Block size={[3.08, 0.95, 0.042]} color="#8e666b" at={[0, 0.85, 0.72]} />
      <Block size={[0.092, 1.15, 0.12]} color={peach} at={[0.46, 0.85, 0.78]} />
      <Block size={[3.35, 0.09, 0.17]} color={peach} at={[0, 1.42, 0.75]} />
      <mesh position={[0.98, 0.93, 0.753]} rotation-z={-0.56}>
        <planeGeometry args={[0.14, 0.85]} />
        <meshBasicMaterial
          color="#ffe8e2"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
      <Block size={[1.42, 0.62, 0.075]} color={ink} at={[-0.56, 0.85, 0.79]} />
      <Block
        size={[1.27, 0.48, 0.011]}
        color={color}
        at={[-0.56, 0.85, 0.836]}
      />
      <Label
        text="NOW SHOWING"
        color={ink}
        at={[-0.56, 0.93, 0.848]}
        width={1.08}
        height={0.18}
      />
      <Label
        text={sampleShows[show].name}
        color={wine}
        at={[-0.56, 0.76, 0.85]}
        width={1.1}
        height={0.15}
      />
      <Block size={[3.98, 0.15, 0.53]} color={peach} at={[0, 0.22, 0.79]} />
      <Block size={[0.87, 0.19, 0.48]} color={ink} at={[0.85, 0.005, 0.96]} />
      <Block
        size={[0.76, 0.052, 0.015]}
        color="#241b23"
        at={[0.85, -0.018, 1.207]}
      />
      <PrintedTicket color={color} printCount={printCount} />
      <Block size={[4.22, 0.77, 1.92]} color={coral} at={[0, 1.86, -0.04]} />
      <Block size={[4.35, 0.14, 2.02]} color={wine} at={[0, 2.24, -0.04]} />
      <Block size={[3.68, 0.43, 0.055]} color={wine} at={[0, 1.9, 0.95]} />
      <Label
        text="SHOWPASS BOX OFFICE"
        color={ivory}
        at={[0, 1.91, 0.991]}
        width={3.23}
        height={0.31}
      />
      {marqueeBulbs.map((x) => (
        <mesh key={x} position={[x, 1.57, 0.938]}>
          <sphereGeometry args={[0.054, 10, 8]} />
          <meshStandardMaterial
            color={gold}
            emissive={gold}
            emissiveIntensity={0.65}
          />
        </mesh>
      ))}
    </>
  );
}
