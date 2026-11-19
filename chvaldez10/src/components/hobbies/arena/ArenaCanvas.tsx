"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  Color,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  type ShaderMaterial,
} from "three";
import {
  arenaAspect,
  maxPortraitPan,
  type ArenaFraming,
  type ArenaScene,
} from "./arena-config";

class ArenaTextureLoader extends TextureLoader {
  override load(...args: Parameters<TextureLoader["load"]>) {
    const texture = super.load(...args);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }
}

export type ArenaView = { yaw: number; pitch: number };

const pixelBudget = 950_000;
const vertexShader = `
  varying vec2 screenUV;

  void main() {
    screenUV = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const lighting: Record<ArenaScene, string> = {
  concert: `
    vec3 pink = mix(vec3(1.0, 0.11, 0.33), tint, 0.34);
    vec3 violet = vec3(0.33, 0.20, 1.0);
    float a = beam(p, vec2(0.552, 0.647), 0.03 + sin(cue * 0.53) * 0.70);
    float b = beam(p, vec2(0.656, 0.676), -0.46 + sin(cue * 0.40 + 2.3) * 0.66);
    float c = beam(p, vec2(0.760, 0.675), -0.20 + sin(cue * 0.46 + 4.2) * 0.50);
    float d = beam(p, vec2(0.822, 0.681), -0.38 + sin(cue * 0.37 + 1.3) * 0.42);
    scene += (pink * (a + d) + violet * (b + c)) * 0.27;

    float mask = smoothstep(0.24, 0.35, p.y)
      * (1.0 - smoothstep(0.40, 0.51, p.y))
      * smoothstep(0.41, 0.69, p.x);
    vec3 fogLight = mix(pink, violet, 0.38 + 0.18 * sin(cue * 0.61));
    scene = fog(p, scene, fogLight * 0.41, mask * 0.54);
  `,
  octagon: `
    vec3 amber = vec3(1.0, 0.46, 0.14);
    vec3 cool = vec3(0.47, 0.74, 1.0);
    float a = beam(p, vec2(0.115, 0.808), 0.32 + sin(cue * 0.44) * 0.58);
    float b = beam(p, vec2(0.888, 0.809), -0.32 + sin(cue * 0.48 + 1.8) * 0.58);
    float c = beam(p, vec2(0.305, 0.713), 0.47 + sin(cue * 0.41 + 0.7) * 0.65);
    float d = beam(p, vec2(0.708, 0.716), -0.44 + sin(cue * 0.51 + 2.5) * 0.62);
    scene += (amber * (a + b) + cool * (c + d)) * 0.25;

    float mask = smoothstep(0.45, 0.55, p.y)
      * (1.0 - smoothstep(0.58, 0.72, p.y))
      * (1.0 - smoothstep(0.17, 0.39, abs(p.x - 0.5)));
    vec3 fogLight = mix(cool, amber, 0.22 + 0.14 * sin(cue * 0.56));
    scene = fog(p, scene, fogLight * 0.36, mask * 0.52);
  `,
};

const arenaShader = (lightingCue: string) => `
  uniform sampler2D arena;
  uniform vec2 viewCenter;
  uniform vec2 viewSize;
  uniform vec2 angle;
  uniform vec3 tint;
  uniform float cue;
  uniform bool effects;
  varying vec2 screenUV;

  mat2 rotate(float radians) {
    float a = cos(radians);
    float b = sin(radians);
    return mat2(a, b, -b, a);
  }

  float hash(vec2 p) {
    vec3 n = fract(vec3(p.xyx) * 0.1031);
    n += dot(n, n.yzx + 33.33);
    return fract((n.x + n.y) * n.z);
  }

  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 t = fract(p);
    t = t * t * (3.0 - 2.0 * t);
    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), t.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), t.x),
      t.y
    );
  }

  float beam(vec2 p, vec2 source, float sweep) {
    vec2 offset = (p - source) * vec2(1.5, 1.0);
    vec2 axis = vec2(sin(sweep), -cos(sweep));
    float distanceAlongBeam = dot(offset, axis);
    float spread = 0.002 + max(0.0, distanceAlongBeam) * 0.10;
    float edge = abs(dot(offset, vec2(-axis.y, axis.x)));
    float cone = 1.0 - smoothstep(0.0, spread, edge);
    return cone * smoothstep(0.0, 0.008, distanceAlongBeam)
      * (1.0 - smoothstep(0.07, 0.35, distanceAlongBeam));
  }

  vec3 fog(vec2 p, vec3 scene, vec3 light, float mask) {
    if (mask <= 0.0) return scene;
    float cloud = noise(p * vec2(12.0, 46.0) - vec2(cue * 0.27, cue * 0.08));
    float detail = noise(p * vec2(27.0, 74.0) - vec2(cue * 0.44, cue * 0.11));
    float haze = smoothstep(0.22, 0.87, cloud * 0.72 + detail * 0.28);
    return mix(scene, light, mask * haze);
  }

  void main() {
    vec3 ray = vec3((screenUV - 0.5) * viewSize, 1.0);
    ray.yz = rotate(-angle.y) * ray.yz;
    ray.xz = rotate(-angle.x) * ray.xz;
    vec2 p = viewCenter + (ray.xy / ray.z) / vec2(1.5, 1.0);
    vec3 scene = texture2D(arena, p).rgb;

    if (effects) {
      ${lightingCue}
    }

    gl_FragColor = vec4(scene, 1.0);
    #include <colorspace_fragment>
  }
`;

type StageProps = {
  scene: ArenaScene;
  src: string;
  framing: ArenaFraming;
  color?: string;
  view: RefObject<ArenaView>;
  onFrameRequest: (invalidate: (() => void) | null) => void;
  effects: boolean;
  animate: boolean;
  onReady: (ready: boolean) => void;
  onFailure: () => void;
};

function frameArena(framing: ArenaFraming, width: number, height: number) {
  const ratio = Math.max(1, width) / Math.max(1, height);
  const viewWidth = framing.zoom * Math.min(ratio, arenaAspect);
  const viewHeight = viewWidth / ratio;
  const centerX =
    framing.x +
    Math.min(
      maxPortraitPan,
      framing.portraitPan * Math.max(0, arenaAspect - ratio),
    );
  const centerY = 1 - framing.y;

  // Leave room for the tilted frustum at the edges of the photograph.
  const yawLimit =
    Math.atan((0.97 - centerX) * arenaAspect) - Math.atan(viewWidth / 2);
  const pitchLimit = Math.atan(centerY - 0.03) - Math.atan(viewHeight / 2);
  return {
    center: new Vector2(centerX, centerY),
    size: new Vector2(viewWidth, viewHeight),
    yaw: Math.max(0, Math.min(0.26, yawLimit)),
    pitch: Math.max(0, Math.min(0.18, pitchLimit)),
    dpr: Math.min(1, Math.sqrt(pixelBudget / Math.max(1, width * height))),
  };
}

function Arena({
  scene,
  src,
  framing,
  color = "#ffb4da",
  view,
  onFrameRequest,
  effects,
  animate,
  onReady,
  onFailure,
  onDprChange,
}: StageProps & { onDprChange: (dpr: number) => void }) {
  const texture = useLoader(ArenaTextureLoader, src);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const { width, height } = useThree((state) => state.size);
  const cameraFrame = useMemo(
    () => frameArena(framing, width, height),
    [framing, width, height],
  );
  const fragmentShader = useMemo(() => arenaShader(lighting[scene]), [scene]);
  const tint = useMemo(() => new Color(color), [color]);
  const shown = useRef(false);
  const uniforms = useMemo(
    () => ({
      arena: { value: texture },
      viewCenter: { value: new Vector2() },
      viewSize: { value: new Vector2() },
      angle: { value: new Vector2() },
      tint: { value: new Color() },
      cue: { value: 1.4 },
      effects: { value: true },
    }),
    [texture],
  );
  const material = useRef<ShaderMaterial & { uniforms: typeof uniforms }>(null);

  useEffect(() => {
    onFrameRequest(invalidate);
    return () => onFrameRequest(null);
  }, [invalidate, onFrameRequest]);

  useEffect(() => {
    onDprChange(cameraFrame.dpr);
  }, [cameraFrame.dpr, onDprChange]);

  useEffect(() => {
    invalidate();
  }, [cameraFrame, effects, invalidate, tint]);

  useEffect(() => {
    const element = gl.domElement;
    element.addEventListener("webglcontextlost", onFailure);
    return () => element.removeEventListener("webglcontextlost", onFailure);
  }, [gl, onFailure]);

  useFrame((_, delta) => {
    const current = material.current?.uniforms;
    if (!current) return;
    current.viewCenter.value.copy(cameraFrame.center);
    current.viewSize.value.copy(cameraFrame.size);
    current.angle.value.set(
      view.current.yaw * cameraFrame.yaw,
      view.current.pitch * cameraFrame.pitch,
    );
    current.tint.value.copy(tint);
    current.effects.value = effects;
    if (animate) current.cue.value += Math.min(delta, 0.05);

    if (!shown.current) {
      shown.current = true;
      onReady(true);
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function ArenaCanvas(props: StageProps) {
  const [dpr, setDpr] = useState(0.85);

  return (
    <Canvas
      aria-hidden="true"
      dpr={dpr}
      frameloop={props.animate ? "always" : "demand"}
      gl={{ alpha: false, antialias: false, depth: false, stencil: false }}
    >
      <Arena {...props} onDprChange={setDpr} />
    </Canvas>
  );
}
