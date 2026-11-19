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
    <div className="grid min-w-28 shrink-0 justify-items-end gap-1 rounded-xl border border-orange-100/35 bg-[#241b17]/95 px-3 py-2 text-right text-orange-50 sm:min-w-36 sm:px-4 sm:py-3">
      <p className="text-[0.68rem] font-bold tracking-wider uppercase">
        {clock ? `Round ${clock.round} / ${clock.total}` : "Corner timer"}
      </p>
      <p className="font-mono text-2xl leading-none font-semibold text-orange-200 tabular-nums sm:text-3xl">
        {clock?.time ?? "–:––"}
      </p>
      <output className="text-xs">{clock?.phase ?? "Awaiting session"}</output>
    </div>
  );
}
