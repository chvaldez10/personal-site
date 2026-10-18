"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MakersBench.module.css";

type BenchObject =
  "sketch" | "build" | "prototype" | "ruler" | "mug" | "pencil";

const notes: Record<BenchObject, { title: string; description: string }> = {
  sketch: {
    title: "Start with a sketch",
    description:
      "Find the shape of an idea before getting attached to the details.",
  },
  build: {
    title: "Make it work",
    description: "Turn the useful parts into a thoughtful, working experience.",
  },
  prototype: {
    title: "Put it in someone's hands",
    description:
      "Test the small details, learn from real use, and keep improving.",
  },
  ruler: {
    title: "Check the details",
    description: "Good constraints make ideas sharper and more useful.",
  },
  mug: {
    title: "Make room to think",
    description: "A short pause can make the next decision clearer.",
  },
  pencil: {
    title: "Keep refining",
    description: "Small revisions can make the biggest difference.",
  },
};

function Ruler() {
  return (
    <svg viewBox="0 0 145 24" aria-hidden="true">
      <defs>
        <linearGradient id="ruler" x2="0" y2="1">
          <stop stopColor="#e5aa61" />
          <stop offset="1" stopColor="#c47a37" />
        </linearGradient>
      </defs>
      <rect
        width="145"
        height="24"
        rx="3"
        fill="url(#ruler)"
        stroke="#9b5829"
      />
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={index}
          d={`M${9 + index * 11} 0v${index % 5 === 0 ? 13 : 8}`}
          stroke="#8c4d2d"
          strokeWidth="1.3"
        />
      ))}
    </svg>
  );
}

function Mug() {
  return (
    <svg viewBox="-12 -11 115 70" aria-hidden="true">
      <ellipse cx="47" cy="31" rx="55" ry="12" fill="#784326" opacity=".16" />
      <circle
        cx="45"
        cy="23"
        r="34"
        fill="#f7f0df"
        stroke="#d5bd9f"
        strokeWidth="5"
      />
      <circle cx="45" cy="23" r="25" fill="#8a563a" />
      <path
        d="M79 10c23-7 23 31 0 26"
        fill="none"
        stroke="#e8d6bd"
        strokeWidth="8"
      />
      <path
        d="M32 24c6-8 17-7 23 0-7 8-17 8-23 0Z"
        fill="#d7b591"
        opacity=".8"
      />
    </svg>
  );
}

function Pencil() {
  return (
    <svg viewBox="0 -18 195 45" aria-hidden="true">
      <rect width="178" height="9" rx="3" fill="#eea34e" />
      <path d="M178 0l17 4.5L178 9Z" fill="#e9c59d" />
      <path d="M195 4.5l-5-1.4v2.8Z" fill="#4d3c32" />
      <rect x="9" width="7" height="9" fill="#e8c1b0" />
      <path d="M14 0v9" stroke="#b77765" />
    </svg>
  );
}

function Sketchbook() {
  return (
    <svg viewBox="0 0 260 290" aria-hidden="true">
      <rect
        x="23"
        y="12"
        width="224"
        height="268"
        rx="8"
        fill="#835d49"
        opacity=".22"
      />
      <rect
        x="14"
        y="7"
        width="224"
        height="266"
        rx="8"
        fill="#f7f0df"
        stroke="#d7c5a8"
        strokeWidth="4"
      />
      <path d="M42 8v264" stroke="#d9a99d" strokeWidth="2" />
      {Array.from({ length: 11 }, (_, index) => (
        <g key={index} transform={`translate(28 ${23 + index * 23})`}>
          <circle r="4" fill="#d6c6ae" />
          <path
            d="M-5-5c-10-10-10 10 0 9"
            fill="none"
            stroke="#997d6e"
            strokeWidth="2.5"
          />
        </g>
      ))}
      <path
        d="M60 46h107M60 55h64"
        stroke="#ba806d"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="59"
        y="77"
        width="137"
        height="120"
        rx="6"
        fill="#fffaf0"
        stroke="#cebea6"
        strokeWidth="2"
      />
      <path
        d="M72 169l36-46 35 28 35-51"
        fill="none"
        stroke="#dc8b6d"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="108" cy="123" r="8" fill="#f0bd8d" />
      <circle cx="178" cy="100" r="8" fill="#e9a49b" />
      <path
        d="M72 183h104M60 218h136M60 232h107M60 246h82"
        stroke="#c8b8a2"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M183 20h37v55l-18-13-19 13Z" fill="#edae88" opacity=".9" />
      <path
        d="M188 36h23M188 45h17"
        stroke="#ba695b"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Laptop() {
  return (
    <svg viewBox="0 0 350 285" aria-hidden="true">
      <path
        d="M42 8h265a13 13 0 0 1 13 13v192H29V21A13 13 0 0 1 42 8Z"
        fill="#424047"
        stroke="#24262b"
        strokeWidth="4"
      />
      <rect x="41" y="20" width="267" height="181" rx="4" fill="#f7eee0" />
      <rect x="41" y="20" width="267" height="20" fill="#efe0ce" />
      <circle cx="54" cy="30" r="3" fill="#e99680" />
      <circle cx="65" cy="30" r="3" fill="#e6ba7b" />
      <circle cx="76" cy="30" r="3" fill="#9bbaad" />
      <rect x="57" y="52" width="71" height="132" rx="3" fill="#e9d7c1" />
      <path
        d="M68 70h43M68 83h32M68 103h43M68 116h25M68 137h36"
        stroke="#b69b84"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="144" y="54" width="146" height="86" rx="5" fill="#fff9ef" />
      <circle cx="184" cy="96" r="25" fill="#edaa85" />
      <path
        d="M167 105l13-16 11 9 11-17"
        fill="none"
        stroke="#fff5e6"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M222 74h50M222 87h41M222 100h49M222 113h31"
        stroke="#c5af9b"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M145 155h95M145 168h133M145 181h110"
        stroke="#d5baa1"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M30 213h290l30 49c2 5-3 10-9 10H9c-6 0-11-5-9-10Z"
        fill="#d5d1cc"
        stroke="#9b9794"
        strokeWidth="3"
      />
      <path d="M32 222h286l17 30H15Z" fill="#a9a6a4" />
      {Array.from({ length: 5 }, (_, row) => (
        <path
          key={row}
          d={`M${35 - row * 4} ${226 + row * 5}H${315 + row * 4}`}
          stroke="#777778"
          strokeWidth="2.5"
          strokeDasharray="16 4"
        />
      ))}
      <path d="M141 254h68l5 10h-78Z" fill="#c9c5c1" stroke="#a9a5a1" />
    </svg>
  );
}

function Prototype() {
  return (
    <svg viewBox="0 0 178 300" aria-hidden="true">
      <ellipse cx="91" cy="284" rx="69" ry="11" fill="#7b5142" opacity=".2" />
      <path
        d="M65 252h52l24 31H40Z"
        fill="#d0aa81"
        stroke="#a77a59"
        strokeWidth="3"
      />
      <rect
        x="32"
        y="4"
        width="114"
        height="260"
        rx="21"
        fill="#51464a"
        stroke="#322c31"
        strokeWidth="4"
      />
      <rect x="39" y="12" width="100" height="244" rx="16" fill="#fff8ed" />
      <path d="M72 13h35v7a8 8 0 0 1-8 8H80a8 8 0 0 1-8-8Z" fill="#51464a" />
      <path
        d="M52 50h48M52 62h66"
        stroke="#786759"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect x="51" y="84" width="76" height="84" rx="13" fill="#f4d1b8" />
      <circle cx="89" cy="125" r="27" fill="#fff4e8" />
      <path
        d="M69 131l12-12 9 9 18-19"
        fill="none"
        stroke="#d87864"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 190h67M52 202h50M52 221h67"
        stroke="#d1b39e"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="91" cy="242" r="3" fill="#d4b8a3" />
    </svg>
  );
}

const benchObjects = [
  {
    id: "sketch",
    label: "Explore the sketchbook",
    className: styles.sketchbook,
    depth: 0.45,
    Illustration: Sketchbook,
    badge: "01 / Sketch",
  },
  {
    id: "build",
    label: "Explore the laptop",
    className: styles.laptop,
    depth: 0.8,
    Illustration: Laptop,
    badge: "02 / Build",
  },
  {
    id: "prototype",
    label: "Explore the finished prototype",
    className: styles.prototype,
    depth: 1.15,
    Illustration: Prototype,
    badge: "03 / Test",
  },
  {
    id: "ruler",
    label: "Explore the ruler",
    className: styles.ruler,
    depth: 0.6,
    Illustration: Ruler,
  },
  {
    id: "mug",
    label: "Explore the mug",
    className: styles.mug,
    depth: 0.35,
    Illustration: Mug,
  },
  {
    id: "pencil",
    label: "Explore the pencil",
    className: styles.pencil,
    depth: 0.75,
    Illustration: Pencil,
  },
] as const;

export default function MakersBench() {
  const [selected, setSelected] = useState<BenchObject>("sketch");
  const [preview, setPreview] = useState<BenchObject | null>(null);
  const active = preview ?? selected;
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    if (!scene || !stage) return;
    const sceneElement = scene;
    const stageElement = stage;
    const objects = stageElement.querySelectorAll<HTMLButtonElement>("button");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    function animate() {
      currentX += (targetX - currentX) * 0.24;
      currentY += (targetY - currentY) * 0.24;
      stageElement.style.transform = `translate3d(${(currentX * 0.35).toFixed(2)}px, ${(currentY * 0.35).toFixed(2)}px, 0)`;
      objects.forEach((object) => {
        const distance = Number(object.dataset.depth ?? 1);
        object.style.translate = `${(currentX * distance).toFixed(2)}px ${(currentY * distance).toFixed(2)}px`;
      });

      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.1) {
        frame = requestAnimationFrame(animate);
      } else {
        frame = 0;
        currentX = targetX;
        currentY = targetY;
        if (targetX === 0 && targetY === 0) {
          stageElement.style.transform = "none";
          objects.forEach((object) => {
            object.style.translate = "none";
          });
        }
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(animate);
    }

    function onPointerMove(event: globalThis.PointerEvent) {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      const hoveredButton =
        event.target instanceof Element ? event.target.closest("button") : null;
      if (hoveredButton && stageElement.contains(hoveredButton)) {
        cancelAnimationFrame(frame);
        frame = 0;
        targetX = currentX;
        targetY = currentY;
        return;
      }
      const bounds = sceneElement.getBoundingClientRect();
      const inside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;
      if (!inside && targetX === 0 && targetY === 0 && !frame) return;
      targetX = inside
        ? ((event.clientX - bounds.left) / bounds.width - 0.5) * 20
        : 0;
      targetY = inside
        ? ((event.clientY - bounds.top) / bounds.height - 0.5) * 14
        : 0;
      schedule();
    }

    function resetMotion() {
      targetX = 0;
      targetY = 0;
      if (reducedMotion.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        currentX = 0;
        currentY = 0;
        stageElement.style.transform = "none";
        objects.forEach((object) => {
          object.style.translate = "none";
        });
      } else {
        schedule();
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", resetMotion);
    reducedMotion.addEventListener("change", resetMotion);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", resetMotion);
      reducedMotion.removeEventListener("change", resetMotion);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.benchExperience} ref={sceneRef}>
      <div className={styles.wall} aria-hidden="true" />
      <div className={styles.table} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.dust} aria-hidden="true" />
      <div className={styles.stage} ref={stageRef}>
        {benchObjects.map(
          ({ id, label, className, depth, Illustration, ...item }) => (
            <button
              key={id}
              type="button"
              className={`${styles.object} ${className} ${selected === id && active === id ? styles.selected : ""}`}
              data-depth={depth}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setPreview(id);
              }}
              onPointerLeave={() => setPreview(null)}
              onFocus={() => setPreview(id)}
              onBlur={() => setPreview(null)}
              onClick={() => setSelected(id)}
              aria-label={label}
              aria-pressed={selected === id}
            >
              <Illustration />
              {"badge" in item && (
                <span className={styles.objectLabel}>{item.badge}</span>
              )}
            </button>
          ),
        )}
      </div>
      <div className={styles.caption} aria-live="polite">
        <span className={styles.captionIndex}>On the bench</span>
        <strong>{notes[active].title}</strong>
        <p>{notes[active].description}</p>
      </div>
    </div>
  );
}
