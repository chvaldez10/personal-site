"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Clock = {
  phase: "Ready" | "Work" | "Paused" | "Complete";
  round: number;
  total: number;
  time: string;
};

const ReadClock = createContext<Clock | null>(null);
export const UpdateOctagonClock = createContext<(clock: Clock | null) => void>(
  () => {},
);

export function OctagonClockProvider({ children }: { children: ReactNode }) {
  const [clock, setClock] = useState<Clock | null>(null);
  return (
    <UpdateOctagonClock.Provider value={setClock}>
      <ReadClock.Provider value={clock}>{children}</ReadClock.Provider>
    </UpdateOctagonClock.Provider>
  );
}

export function OctagonClock() {
  const clock = useContext(ReadClock);
  return (
    <div className="pointer-events-none absolute top-3 left-3 grid gap-0.5 rounded-lg border border-orange-200/20 bg-[#30262b]/95 px-3 py-2 text-[#fff3df] sm:top-4 sm:left-4">
      <p className="text-[0.68rem] font-bold tracking-wider uppercase">
        {clock ? `Round ${clock.round} / ${clock.total}` : "Corner timer"}
      </p>
      <p className="font-mono text-xl leading-none font-semibold text-orange-200 tabular-nums">
        {clock?.time ?? "–:––"}
      </p>
      <output className="text-xs">
        {clock?.phase ?? "Awaiting session"}
      </output>
    </div>
  );
}
