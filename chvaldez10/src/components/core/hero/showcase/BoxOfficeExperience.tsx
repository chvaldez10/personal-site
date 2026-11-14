"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { sampleShows } from "../sampleShows";
import ScenePreview from "./ScenePreview";
import styles from "./showcase.module.css";

export default function BoxOfficeExperience() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [printCount, setPrintCount] = useState(0);
  const show = sampleShows[selectedIndex];

  function selectShow(index: number) {
    setSelectedIndex(index);
    setPrintCount((count) => count + 1);
  }

  return (
    <div className={styles.boxOffice}>
      <ScenePreview
        kind="box-office"
        show={selectedIndex}
        printCount={printCount}
      />
      <div className={styles.boxOfficeControls}>
        <fieldset className={styles.showChoices}>
          <legend>Choose a sample show</legend>
          <div>
            {sampleShows.map((option, index) => (
              <Button
                key={option.code}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={selectedIndex === index}
                onClick={() => selectShow(index)}
              >
                {option.name}
              </Button>
            ))}
          </div>
        </fieldset>
        <div className={styles.ticketWell}>
          <div key={printCount} className={styles.ticket}>
            <div>
              <span className={styles.ticketLabel}>
                {show.type} · Sample ticket
              </span>
              <strong>{show.name}</strong>
              <span>
                {show.venue} · Doors {show.doors}
              </span>
            </div>
            <span className={styles.stub} aria-label="General admission">
              <span aria-hidden="true" />
              <b>GA</b>
            </span>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setPrintCount((count) => count + 1)}
        >
          <Ticket aria-hidden="true" />
          Print a sample ticket
        </Button>
        <output className="sr-only">
          Sample ticket for {show.name} ready. Copy {printCount + 1}.
        </output>
      </div>
    </div>
  );
}
