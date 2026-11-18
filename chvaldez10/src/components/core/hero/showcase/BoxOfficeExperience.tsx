"use client";

import { useState } from "react";
import { ScanLine, Ticket } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { sampleShows } from "../sampleShows";
import ScenePreview from "./ScenePreview";
import styles from "./showcase.module.css";

export default function BoxOfficeExperience() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [printCount, setPrintCount] = useState(0);
  const [ticketState, setTicketState] = useState<
    "preview" | "printed" | "admitted" | "duplicate"
  >("preview");
  const show = sampleShows[selectedIndex];

  function selectShow(index: number) {
    if (index === selectedIndex) return;
    setSelectedIndex(index);
    setTicketState("preview");
  }

  function printTicket() {
    setPrintCount((count) => count + 1);
    setTicketState("printed");
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
        <div className={styles.ticketActions}>
          <Button type="button" onClick={printTicket}>
            <Ticket aria-hidden="true" />
            Print a sample ticket
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={ticketState === "preview"}
            onClick={() =>
              setTicketState(
                ticketState === "printed" ? "admitted" : "duplicate",
              )
            }
          >
            <ScanLine aria-hidden="true" />
            Scan ticket
          </Button>
        </div>
        <output className={styles.ticketStatus} data-state={ticketState}>
          {ticketState === "duplicate"
            ? "Already scanned. Print a fresh ticket to try again."
            : ticketState === "admitted"
              ? "Admitted. The ticket has been checked in."
              : ticketState === "printed"
                ? `Ticket ${printCount} for ${show.name} is ready to scan.`
                : "Print a ticket to try the check-in."}
        </output>
      </div>
    </div>
  );
}
