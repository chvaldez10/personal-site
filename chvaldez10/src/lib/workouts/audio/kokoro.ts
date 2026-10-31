import type { VoiceOption } from "./schema";

export const kokoroModel = {
  id: "kokoro-82m",
  label: "Kokoro 82M (on device)",
  provider: "kokoro",
} as const;

export const kokoroVoices = [
  {
    id: "am_fenrir",
    label: "Fenrir",
    description: "American · energetic",
    provider: "kokoro",
  },
  {
    id: "am_michael",
    label: "Michael",
    description: "American · steady",
    provider: "kokoro",
  },
  {
    id: "am_puck",
    label: "Puck",
    description: "American · lively",
    provider: "kokoro",
  },
  {
    id: "bm_george",
    label: "George",
    description: "British · measured",
    provider: "kokoro",
  },
  {
    id: "af_bella",
    label: "Bella",
    description: "American · clear",
    provider: "kokoro",
  },
  {
    id: "af_heart",
    label: "Heart",
    description: "American · warm",
    provider: "kokoro",
  },
] as const satisfies readonly VoiceOption[];
