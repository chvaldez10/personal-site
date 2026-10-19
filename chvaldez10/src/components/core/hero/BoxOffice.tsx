"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";
import styles from "./CurrentWorkExperience.module.css";

const sampleShows = [
  {
    name: "The Electric Hour",
    type: "Live music",
    venue: "The Grand Hall",
    doors: "7:00 PM",
    code: "01",
  },
  {
    name: "After Hours",
    type: "Comedy night",
    venue: "The Velvet Room",
    doors: "8:30 PM",
    code: "02",
  },
  {
    name: "The Night Market",
    type: "Community event",
    venue: "Market Square",
    doors: "6:00 PM",
    code: "03",
  },
] as const;

export default function BoxOffice() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [printCount, setPrintCount] = useState(0);
  const show = sampleShows[selectedIndex];

  function selectShow(index: number) {
    setSelectedIndex(index);
    setPrintCount((count) => count + 1);
  }

  return (
    <div className={styles.booth}>
      <div className={styles.boothCrown} aria-hidden="true">
        <span>WINDOW 01</span>
        <span>OPEN TONIGHT</span>
      </div>

      <div className={styles.window}>
        <div className={styles.windowReflection} aria-hidden="true" />
        <div className={styles.scanBeam} aria-hidden="true" />
        <div className={styles.scanDisplay} aria-hidden="true">
          <span className={styles.scanPattern} />
          <span className={styles.scanLine} />
          <span className={styles.scanLabel}>LIVE SCAN</span>
        </div>
        <div className={styles.windowInner}>
          <div className={styles.boardHeading}>
            <span className={styles.openLight} aria-hidden="true" />
            <span>NOW SHOWING</span>
            <span className={styles.boardNumber}>NO. {show.code}</span>
          </div>
          <div className={styles.boardContent} key={show.code}>
            <p>{show.type}</p>
            <h3>{show.name}</h3>
            <div className={styles.boardRule} aria-hidden="true" />
            <span>{show.venue}</span>
            <span>DOORS {show.doors}</span>
          </div>
          <div className={styles.windowFooter} aria-hidden="true">
            <span>✦</span>
            <span>LIVE ENTRY SCAN</span>
            <span>✦</span>
          </div>
        </div>
      </div>

      <div className={styles.counter}>
        <div className={styles.counterTop}>
          <span className={styles.counterLabel}>Choose a show</span>
          <span className={styles.counterIndex}>{show.code} / 03</span>
        </div>
        <fieldset className={styles.showChoices}>
          <legend className={styles.srOnly}>Choose a sample show</legend>
          {sampleShows.map((option, index) => (
            <button
              key={option.code}
              type="button"
              className={styles.showChoice}
              aria-pressed={selectedIndex === index}
              onClick={() => selectShow(index)}
            >
              <span>{option.code}</span>
              <span>{option.name}</span>
            </button>
          ))}
        </fieldset>
        <div className={styles.counterActions}>
          <button
            type="button"
            className={styles.printButton}
            onClick={() => setPrintCount((count) => count + 1)}
          >
            <Ticket size={17} aria-hidden="true" />
            Print a sample ticket
          </button>
          <span>No purchase here</span>
        </div>
      </div>

      <div className={styles.ticketSlot} aria-hidden="true">
        <span />
      </div>
      <div className={styles.ticketWell}>
        <div
          key={show.code + "-" + printCount}
          className={styles.ticket}
          aria-label={"Sample ticket for " + show.name}
        >
          <div className={styles.ticketMain}>
            <span className={styles.ticketEyebrow}>
              SHOWPASS / SAMPLE TICKET
            </span>
            <strong>{show.name}</strong>
            <span>{show.venue}</span>
            <div className={styles.ticketDetails}>
              <span>DOORS {show.doors}</span>
              <span>GENERAL ADMISSION</span>
            </div>
          </div>
          <div className={styles.ticketStub}>
            <span>{show.code}</span>
            <span className={styles.barcode} aria-hidden="true" />
          </div>
        </div>
      </div>
      <output className={styles.srOnly}>
        Sample ticket for {show.name} ready. Copy {printCount + 1}.
      </output>
    </div>
  );
}
