"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Code2, PenLine, Rocket, Sparkles } from "lucide-react";
import styles from "./ProcessCardStack.module.css";

const stages = [
  {
    id: "sketch",
    label: "Sketch",
    icon: PenLine,
    title: "Start with the question.",
    description:
      "Find the shape of the idea before getting attached to the details.",
  },
  {
    id: "build",
    label: "Build",
    icon: Code2,
    title: "Make it work.",
    description:
      "Turn the plan into a usable interface, then keep refining it.",
  },
  {
    id: "ship",
    label: "Ship",
    icon: Rocket,
    title: "Put it in people's hands.",
    description:
      "Polish the experience, test the edges, and learn from real use.",
  },
] as const;

type Stage = (typeof stages)[number]["id"];

function SketchCard() {
  return (
    <span className={styles.sketchContent} aria-hidden="true">
      <span className={styles.cardEyebrow}>01 / the sketch</span>
      <span className={styles.sketchHeading}>What would make this easier?</span>
      <span className={styles.wireframeHero}>
        <span />
        <span />
      </span>
      <span className={styles.wireframeRow}>
        <span />
        <span />
        <span />
      </span>
      <span className={styles.stickyNote}>Start small. Make it useful.</span>
    </span>
  );
}

function BuildCard() {
  return (
    <span className={styles.buildContent} aria-hidden="true">
      <span className={styles.editorBar}>
        <span className={styles.editorDots}>
          <i />
          <i />
          <i />
        </span>
        <span>pulse.tsx</span>
      </span>
      <span className={styles.codeLines}>
        <span className={styles.codePurple}>function Focus() {"{"}</span>
        <span className={styles.codeMuted}> return (</span>
        <span className={styles.codeOrange}> &lt;Plan</span>
        <span className={styles.codeBlue}> simple</span>
        <span className={styles.codeBlue}> thoughtful</span>
        <span className={styles.codeBlue}> readyToShip</span>
        <span className={styles.codeOrange}> /&gt;</span>
        <span className={styles.codeMuted}> );</span>
        <span className={styles.codePurple}>{"}"}</span>
      </span>
      <span className={styles.buildStatus}>
        <i /> Preview running
      </span>
    </span>
  );
}

function ShipCard() {
  return (
    <span className={styles.shipContent} aria-hidden="true">
      <span className={styles.shipBar}>
        <span className={styles.shipLogo}>p</span>
        <strong>pulse</strong>
        <span className={styles.shipStatus}>ready</span>
      </span>
      <span className={styles.shipBody}>
        <span className={styles.cardEyebrow}>Your space to focus</span>
        <strong>Make room for what matters.</strong>
        <span className={styles.shipSubtext}>
          A little clarity for everything on your mind.
        </span>
        <span className={styles.shipCards}>
          <span>
            <small>Today</small>
            <b>3 priorities</b>
          </span>
          <span>
            <small>This week</small>
            <b>On track</b>
          </span>
        </span>
      </span>
    </span>
  );
}

const cards = {
  sketch: SketchCard,
  build: BuildCard,
  ship: ShipCard,
};

export default function ProcessCardStack() {
  const [activeStage, setActiveStage] = useState<Stage>("sketch");
  const sceneRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const current = stages.find((stage) => stage.id === activeStage) ?? stages[0];

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  function moveScene(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      sceneRef.current?.style.setProperty("--tilt-x", `${-y * 8}deg`);
      sceneRef.current?.style.setProperty("--tilt-y", `${x * 10}deg`);
      frameRef.current = null;
    });
  }

  function resetScene() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    sceneRef.current?.style.setProperty("--tilt-x", "0deg");
    sceneRef.current?.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <section
      aria-label="Interactive product process cards"
      className={styles.cardStack}
    >
      <div aria-hidden="true" className={styles.glow} />
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>
              <Sparkles aria-hidden="true" size={14} />
              The process
            </p>
            <p className={styles.headerTitle}>Take an idea for a spin.</p>
          </div>
          <span className={styles.counter}>
            {String(stages.indexOf(current) + 1).padStart(2, "0")} / 03
          </span>
        </div>

        <div
          className={styles.cardStage}
          onPointerMove={moveScene}
          onPointerLeave={resetScene}
        >
          <div className={styles.stageTexture} aria-hidden="true" />
          <div ref={sceneRef} className={styles.scene}>
            {stages.map(({ id, label }) => {
              const Card = cards[id];
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={`Explore ${label} stage`}
                  aria-pressed={activeStage === id}
                  data-active={activeStage === id}
                  onClick={() => setActiveStage(id)}
                  className={`${styles.card} ${styles[id]}`}
                >
                  <Card />
                </button>
              );
            })}
          </div>
          <span className={styles.stageHint} aria-hidden="true">
            Pick a card ↗
          </span>
        </div>

        <fieldset className={styles.controls}>
          <legend className="sr-only">Explore the product process</legend>
          {stages.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={activeStage === id}
              onClick={() => setActiveStage(id)}
              className={styles.stageButton}
            >
              <Icon aria-hidden="true" size={16} />
              {label}
            </button>
          ))}
        </fieldset>

        <div className={styles.caption} aria-live="polite">
          <p className={styles.captionTitle}>{current.title}</p>
          <p className={styles.captionDescription}>{current.description}</p>
        </div>
      </div>
    </section>
  );
}
