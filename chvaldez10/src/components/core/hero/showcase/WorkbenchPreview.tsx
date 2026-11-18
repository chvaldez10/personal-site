"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/buttons";
import ScenePreview, { type ScenePreviewProps } from "./ScenePreview";
import styles from "./showcase.module.css";

type Step = Extract<ScenePreviewProps, { kind: "workbench" }>["selected"];

const steps = [
  {
    id: "sketch",
    label: "Sketch",
    note: "I sketch the idea before I get attached to the details.",
  },
  {
    id: "build",
    label: "Build",
    note: "I build a version I can actually use, then improve it.",
  },
  {
    id: "test",
    label: "Test",
    note: "I test the details, learn from using it, and keep improving.",
  },
] as const;

export default function WorkbenchPreview({
  children,
  intro,
}: {
  children: ReactNode;
  intro: ReactNode;
}) {
  const [selected, setSelected] = useState<Step>("sketch");
  const note = steps.find((item) => item.id === selected)?.note;

  return (
    <div className={styles.station} data-step={selected}>
      <ScenePreview kind="workbench" selected={selected} intro={intro}>
        <div className={styles.workbenchControls}>
          <div className={styles.workbenchSteps}>
            <fieldset className={styles.propChoices}>
              <legend className="sr-only">Explore the workbench</legend>
              {steps.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={item.id === selected}
                  onClick={() => setSelected(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </fieldset>
            <p aria-live="polite" className={styles.note}>
              {note}
            </p>
          </div>
          {children}
        </div>
      </ScenePreview>
    </div>
  );
}
