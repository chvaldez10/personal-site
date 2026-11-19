"use client";

import { useSyncExternalStore } from "react";

const preference = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(preference);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getPreference() {
  return window.matchMedia(preference).matches;
}

function getServerPreference() {
  return true;
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getPreference, getServerPreference);
}
