"use client";

import { useState } from "react";
import { Button } from "@/components/ui/buttons";
import ScenePreview, { type ScenePreviewProps } from "./ScenePreview";
import styles from "./showcase.module.css";

type Prop = Extract<ScenePreviewProps, { kind: "workbench" }>["selected"];

const props = [
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

export default function WorkbenchPreview() {
  const [selected, setSelected] = useState<Prop>("sketch");
  const note = props.find((item) => item.id === selected)?.note;

  return (
    <div className={styles.workbench}>
      <ScenePreview kind="workbench" selected={selected} />
      <div className={styles.workbenchControls}>
        <fieldset className={styles.propChoices}>
          <legend className="sr-only">Explore the workbench</legend>
          {props.map((item) => (
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
    </div>
  );
}
