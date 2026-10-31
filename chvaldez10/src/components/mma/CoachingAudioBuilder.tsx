"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/buttons/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  voicePreviewText,
  type AudioRequest,
  type VoiceModelOption,
  type VoiceOption,
} from "@/lib/workouts/audio/schema";
import {
  buildWorkoutTimeline,
  compactSpokenWav,
  type TimelineCaption,
} from "@/lib/workouts/audio/timeline";

type AudioRound = {
  id: number;
  name: string;
  lengthMinutes: string;
  objective: string;
  coachingCue: string;
  techniqueReminder: string;
};

type Clip = { signature: string; src: string };
type PreparedTrack = {
  signature: string;
  src: string;
  rounds: AudioRound[];
  totalSeconds: number;
  captions: TimelineCaption[];
};

const errorSchema = z.object({ error: z.string() });
const audioCacheName = "shadowboxing-coaching-audio-v1";

function signature(request: AudioRequest) {
  return JSON.stringify(request);
}

type CoachingPrompt = {
  text: string;
  coachingCue: string;
  techniqueReminder: string;
  at: number;
};

function promptRequest(
  prompt: CoachingPrompt,
  modelId: string,
  voiceId: string,
): AudioRequest {
  return {
    kind: "round",
    modelId,
    voiceId,
    coachingCue: prompt.coachingCue,
    techniqueReminder: prompt.techniqueReminder,
  };
}

const sharedPrompts: CoachingPrompt[] = [
  {
    text: "Check your balance. Let your feet reset before the next exchange.",
    coachingCue:
      "Check your balance. Let your feet reset before the next exchange.",
    techniqueReminder: "",
    at: 0.16,
  },
  {
    text: "Finish this round with clean footwork. Stay balanced as you exit.",
    coachingCue:
      "Finish this round with clean footwork. Stay balanced as you exit.",
    techniqueReminder: "",
    at: 0.82,
  },
];

function transitionText(round: AudioRound, index: number) {
  const firstCue = round.coachingCue.trim();
  const reminder = round.techniqueReminder.trim();
  return [
    `Round ${index + 1}. ${round.name.trim()}.`,
    round.objective.trim(),
    firstCue,
    reminder,
  ]
    .filter(Boolean)
    .join(" ");
}

function transitionRequest(
  round: AudioRound,
  index: number,
  modelId: string,
  voiceId: string,
): AudioRequest {
  return {
    kind: "transition",
    modelId,
    voiceId,
    roundNumber: index + 1,
    name: round.name.trim(),
    objective: round.objective.trim(),
    coachingCue: round.coachingCue.trim(),
    techniqueReminder: round.techniqueReminder.trim(),
  };
}

function clock(seconds: number) {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function captions(text: string) {
  const transcript = text.replaceAll(/\s+/g, " ").trim();
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(
    `WEBVTT\n\n00:00:00.000 --> 00:05:00.000\n${transcript}\n`,
  )}`;
}

function timedCaptions(items: TimelineCaption[]) {
  const time = (seconds: number) => {
    const milliseconds = Math.round(seconds * 1000);
    const hours = Math.floor(milliseconds / 3_600_000);
    const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
    const remainder = Math.floor((milliseconds % 60_000) / 1000);
    const fraction = milliseconds % 1000;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}.${String(fraction).padStart(3, "0")}`;
  };
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(
    `WEBVTT\n\n${items.map((item) => `${time(item.start)} --> ${time(item.end)}\n${item.text.replaceAll(/\s+/g, " ").replaceAll("-->", "→")}\n`).join("\n")}`,
  )}`;
}

async function audioDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Audio could not be read."));
    reader.onerror = () => reject(new Error("Audio could not be read."));
    reader.readAsDataURL(blob);
  });
}

async function compactAudioSource(src: string): Promise<string> {
  try {
    const original = await (await fetch(src)).blob();
    const compacted = await compactSpokenWav(original);
    return compacted.size < original.size ? audioDataUrl(compacted) : src;
  } catch {
    return src;
  }
}

async function cachedAudio(request: AudioRequest): Promise<string> {
  let cache: Cache | undefined;
  let cacheKey: Request | undefined;
  if ("caches" in window && crypto.subtle) {
    try {
      const encoded = new TextEncoder().encode(signature(request));
      const digest = await crypto.subtle.digest("SHA-256", encoded);
      const hash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      cacheKey = new Request(
        `${location.origin}/hobbies/mma?audio-cache=${hash}`,
      );
      cache = await caches.open(audioCacheName);
      const saved = await cache.match(cacheKey);
      if (saved) {
        const original = await saved.blob();
        let compacted = original;
        try {
          compacted = await compactSpokenWav(original);
        } catch {
          // Keep a usable cached clip rather than spending another request.
        }
        if (compacted.size < original.size) {
          try {
            await cache.put(
              cacheKey,
              new Response(compacted, {
                headers: { "Content-Type": "audio/wav" },
              }),
            );
          } catch {
            // The compacted clip can still be used without updating storage.
          }
        }
        return audioDataUrl(compacted);
      }
    } catch {
      cache = undefined;
    }
  }

  const response = await fetch("/api/workouts/audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: signature(request),
  });
  if (!response.ok) {
    const parsed = errorSchema.safeParse(
      await response.json().catch(() => null),
    );
    throw new Error(
      parsed.success
        ? parsed.data.error
        : "Coaching audio could not be generated. Try again.",
    );
  }
  const blob = await response.blob();
  if (blob.type !== "audio/wav")
    throw new Error("The voice service returned invalid audio.");
  let compacted = blob;
  try {
    compacted = await compactSpokenWav(blob);
  } catch {
    // Playback can still use the original voice clip.
  }
  if (cache && cacheKey) {
    try {
      await cache.put(
        cacheKey,
        new Response(compacted, { headers: { "Content-Type": "audio/wav" } }),
      );
    } catch {
      // Audio can still be previewed if browser storage is unavailable.
    }
  }
  return audioDataUrl(compacted);
}

export default function CoachingAudioBuilder({
  rounds,
  generatedRounds,
  models,
  voices,
}: {
  rounds: AudioRound[];
  generatedRounds: AudioRound[];
  models: VoiceModelOption[];
  voices: VoiceOption[];
}) {
  const [modelId, setModelId] = useState(models[0]?.id ?? "");
  const [voiceId, setVoiceId] = useState(voices[0]?.id ?? "");
  const [preview, setPreview] = useState<Clip | null>(null);
  const [clips, setClips] = useState<Record<string, Clip>>({});
  const [source, setSource] = useState<"edited" | "generated">("edited");
  const [track, setTrack] = useState<PreparedTrack | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [busy, setBusy] = useState<"preview" | "rounds" | null>(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedModel = models.some((model) => model.id === modelId)
    ? modelId
    : (models[0]?.id ?? "");
  const selectedVoice = voices.some((voice) => voice.id === voiceId)
    ? voiceId
    : (voices[0]?.id ?? "");
  const previewRequest: AudioRequest = {
    kind: "preview",
    modelId: selectedModel,
    voiceId: selectedVoice,
  };
  const currentPreview =
    preview?.signature === signature(previewRequest) ? preview : null;
  const activeRounds = source === "generated" ? generatedRounds : rounds;
  const planSignature = JSON.stringify({
    scheduleVersion: 5,
    activeRounds,
    selectedModel,
    selectedVoice,
  });
  const readyCount = activeRounds.filter((round, index) => {
    if (!round.name.trim() || !round.objective.trim()) return false;
    const announcement = transitionRequest(
      round,
      index,
      selectedModel,
      selectedVoice,
    );
    return Boolean(
      clips[signature(announcement)] &&
      sharedPrompts.every((prompt) =>
        Boolean(
          clips[signature(promptRequest(prompt, selectedModel, selectedVoice))],
        ),
      ),
    );
  }).length;
  const validRounds =
    activeRounds.length > 0 &&
    activeRounds.length <= 12 &&
    activeRounds.every(
      (round) =>
        round.name.trim() &&
        round.objective.trim() &&
        Number.isInteger(Number(round.lengthMinutes)) &&
        Number(round.lengthMinutes) >= 1 &&
        Number(round.lengthMinutes) <= 30,
    ) &&
    activeRounds.reduce((sum, round) => sum + Number(round.lengthMinutes), 0) <=
      45;
  const currentTrack = track?.signature === planSignature ? track : null;
  const displayedTrack = track && started ? track : currentTrack;
  const displayRounds = displayedTrack?.rounds ?? activeRounds;
  const displayedElapsed = displayedTrack ? elapsed : 0;
  let roundStart = 0;
  let activeIndex = 0;
  for (const [index, round] of displayRounds.entries()) {
    const end = roundStart + Number(round.lengthMinutes) * 60;
    if (displayedElapsed < end || index === displayRounds.length - 1) {
      activeIndex = index;
      break;
    }
    roundStart = end;
  }
  const activeRound = displayRounds[activeIndex];
  const roundRemaining = activeRound
    ? Number(activeRound.lengthMinutes) * 60 - (displayedElapsed - roundStart)
    : 0;
  const nextInstruction = displayedTrack?.captions.find(
    (item) => item.start > displayedElapsed + 0.5,
  );

  useEffect(() => {
    return () => {
      if (track) URL.revokeObjectURL(track.src);
    };
  }, [track]);

  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    if (typeof MediaMetadata !== "undefined") {
      session.metadata = new MediaMetadata({
        title: "Shadowboxing workout",
        artist: `${track.rounds.length} rounds · MMA coach`,
        album: "Shadowboxing Training",
      });
    }
    const play = () => {
      void audioRef.current
        ?.play()
        .catch(() =>
          setError("Playback was blocked. Tap Resume to try again."),
        );
    };
    const pause = () => audioRef.current?.pause();
    const stop = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      setElapsed(0);
      setStarted(false);
    };
    for (const [action, handler] of [
      ["play", play],
      ["pause", pause],
      ["stop", stop],
    ] as const) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        /* Optional on this browser. */
      }
    }
    return () => {
      for (const action of ["play", "pause", "stop"] as const) {
        try {
          session.setActionHandler(action, null);
        } catch {
          /* Optional on this browser. */
        }
      }
      session.metadata = null;
    };
  }, [track]);

  useEffect(() => {
    const sync = () => setElapsed(audioRef.current?.currentTime ?? 0);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  async function previewVoice() {
    if (busy || !selectedModel || !selectedVoice) return;
    setBusy("preview");
    setError("");
    setNotice("");
    try {
      const src = currentPreview
        ? await compactAudioSource(currentPreview.src)
        : await cachedAudio(previewRequest);
      setPreview({ signature: signature(previewRequest), src });
      setNotice("Voice preview is ready.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Voice preview failed. Try again.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function prepareAudio() {
    if (busy || !selectedModel || !selectedVoice || !validRounds || playing)
      return;
    setBusy("rounds");
    setError("");
    setNotice("");
    const prepared = { ...clips };
    try {
      const snapshot = activeRounds.map((round) => ({ ...round }));
      const timelineRounds: {
        lengthMinutes: number;
        transitionSrc: string;
        transitionText: string;
        cues: { src: string; text: string; at: number }[];
      }[] = [];
      for (const [index, round] of snapshot.entries()) {
        setProgress(`Preparing round ${index + 1} of ${snapshot.length}…`);
        const announcement = transitionRequest(
          round,
          index,
          selectedModel,
          selectedVoice,
        );
        const requests = sharedPrompts.map((prompt) =>
          promptRequest(prompt, selectedModel, selectedVoice),
        );
        for (const request of [announcement, ...requests]) {
          const key = signature(request);
          if (prepared[key]) {
            const src = await compactAudioSource(prepared[key].src);
            if (src !== prepared[key].src) {
              prepared[key] = { signature: key, src };
              setClips({ ...prepared });
            }
            continue;
          }
          prepared[key] = { signature: key, src: await cachedAudio(request) };
          setClips({ ...prepared });
        }
        timelineRounds.push({
          lengthMinutes: Number(round.lengthMinutes),
          transitionSrc: prepared[signature(announcement)].src,
          transitionText: transitionText(round, index),
          cues: [
            sharedPrompts[0],
            { ...sharedPrompts[0], at: 0.5 },
            sharedPrompts[1],
          ].map((prompt) => ({
            src: prepared[
              signature(promptRequest(prompt, selectedModel, selectedVoice))
            ].src,
            text: prompt.text,
            at: prompt.at,
          })),
        });
      }
      setProgress("Assembling one continuous workout track…");
      const timeline = await buildWorkoutTimeline(timelineRounds);
      audioRef.current?.pause();
      setPlaying(false);
      setStarted(false);
      setElapsed(0);
      setTrack({
        signature: planSignature,
        src: URL.createObjectURL(timeline.audio),
        rounds: snapshot,
        captions: timeline.captions,
        totalSeconds: timelineRounds.reduce(
          (sum, round) => sum + round.lengthMinutes * 60,
          0,
        ),
      });
      setNotice(
        "Workout audio is ready. Put on your headphones, then tap Start.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? `${failure.message} Saved clips remain available; try again to continue.`
          : "Audio preparation stopped. Try again to continue.",
      );
    } finally {
      setProgress("");
      setBusy(null);
    }
  }

  async function play(restart = false) {
    const audio = audioRef.current;
    if (!audio || !(started ? track : currentTrack)) return;
    if (restart) {
      audio.currentTime = 0;
      setElapsed(0);
    }
    document
      .querySelectorAll<HTMLAudioElement>("#coaching-audio audio")
      .forEach((sample) => {
        if (sample !== audio) sample.pause();
      });
    setError("");
    try {
      await audio.play();
      setStarted(true);
    } catch {
      setError(
        "Playback was blocked. Tap Start or Resume again while this page is open.",
      );
    }
  }

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setElapsed(0);
    setStarted(false);
  }

  return (
    <section
      id="coaching-audio"
      aria-labelledby="coaching-audio-heading"
      className="scroll-mt-24 rounded-2xl border border-orange-200 bg-(--brand-secondary-100) p-6 shadow-sm sm:p-8"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.16em] text-orange-700 uppercase">
          Coaching audio
        </p>
        <h3
          id="coaching-audio-heading"
          className="mt-2 text-xl font-bold text-gray-900"
        >
          Hear your round cues
        </h3>
        <p className="mt-2 text-sm leading-6 text-gray-700">
          Choose a workout and one coach voice. Prepare the complete audio
          before training. Each round starts with its objective and coaching
          cue, followed by spaced technique reminders. The same short voice
          clips are reused across rounds to save requests.
        </p>
      </div>

      {models.length && voices.length ? (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="workout-source" className="text-gray-800">
                Workout
              </Label>
              <Select
                id="workout-source"
                value={source}
                onValueChange={(value) => {
                  if (value === "edited" || value === "generated")
                    setSource(value);
                }}
                disabled={busy !== null || playing}
                options={[
                  { value: "edited", label: "Current edited workout" },
                  ...(generatedRounds.length
                    ? [{ value: "generated", label: "Last AI workout" }]
                    : []),
                ]}
                wrapperClassName="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="voice-model" className="text-gray-800">
                Voice model
              </Label>
              <Select
                id="voice-model"
                value={selectedModel}
                onValueChange={setModelId}
                disabled={busy !== null || playing}
                options={models.map((model) => ({
                  value: model.id,
                  label: model.label,
                }))}
                wrapperClassName="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="coach-voice" className="text-gray-800">
                Coach voice
              </Label>
              <Select
                id="coach-voice"
                value={selectedVoice}
                onValueChange={setVoiceId}
                disabled={busy !== null || playing}
                options={voices.map((voice) => ({
                  value: voice.id,
                  label: voice.label,
                }))}
                wrapperClassName="mt-2"
              />
              <p className="mt-2 text-sm text-gray-600">
                {
                  voices.find((voice) => voice.id === selectedVoice)
                    ?.description
                }
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={previewVoice}
              disabled={busy !== null || playing}
              className="min-h-11 border-orange-300 bg-white text-orange-900 hover:bg-orange-50 hover:text-orange-900 focus-visible:ring-orange-600"
            >
              {busy === "preview" ? "Preparing preview…" : "Preview voice"}
            </Button>
            <Button
              type="button"
              onClick={prepareAudio}
              disabled={busy !== null || !validRounds || playing}
              className="min-h-11 bg-orange-700 text-white hover:bg-orange-800 focus-visible:ring-orange-600"
            >
              {busy === "rounds"
                ? "Preparing audio…"
                : currentTrack
                  ? "Prepare again"
                  : "Prepare workout audio"}
            </Button>
            <span className="text-sm text-gray-700">
              {readyCount} of {activeRounds.length} rounds cached
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-gray-600">
            A fresh three-round plan uses up to five voice requests. Unchanged
            clips are reused; previewing or switching voices and models uses
            more requests.
          </p>
          {currentPreview && (
            <div className="mt-5 max-w-md">
              <p className="mb-2 text-sm font-semibold text-gray-900">
                Voice sample
              </p>
              <audio
                controls
                src={currentPreview.src}
                className="w-full"
                aria-label="Coach voice sample"
              >
                <track
                  kind="captions"
                  src={captions(voicePreviewText)}
                  srcLang="en"
                  label="English"
                />
              </audio>
            </div>
          )}
          {!validRounds && (
            <p className="mt-3 text-sm text-orange-900">
              Complete each round name, objective, and duration first. Audio
              workouts support 1–12 rounds and up to 45 minutes total.
            </p>
          )}
          <output className="mt-3 block text-sm text-gray-700">
            {progress || notice}
          </output>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="mt-6 rounded-2xl border border-orange-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-orange-700 uppercase">
                  Workout player
                </p>
                <h4 className="mt-2 text-lg font-bold text-gray-900">
                  {started
                    ? playing
                      ? "Training"
                      : "Paused"
                    : currentTrack
                      ? "Ready to train"
                      : "Prepare audio to start"}
                </h4>
              </div>
              <p
                className="font-mono text-2xl font-semibold tabular-nums text-gray-900"
                aria-label="Time remaining in workout"
              >
                {clock((displayedTrack?.totalSeconds ?? 0) - displayedElapsed)}
              </p>
            </div>
            {activeRound && displayedTrack && (
              <div className="mt-5 rounded-xl bg-(--brand-secondary-100) p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-gray-900">
                    Round {activeIndex + 1} of {displayRounds.length}:{" "}
                    {activeRound.name}
                  </p>
                  <p
                    className="font-mono text-lg font-semibold tabular-nums text-orange-900"
                    aria-label="Time remaining in round"
                  >
                    {clock(roundRemaining)}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {activeRound.objective}
                </p>
                {nextInstruction && (
                  <p className="mt-3 text-sm font-medium text-orange-800">
                    Next coaching instruction in{" "}
                    {clock(nextInstruction.start - displayedElapsed)}
                  </p>
                )}
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {!started ? (
                <Button
                  type="button"
                  onClick={() => void play(true)}
                  disabled={!currentTrack || busy !== null}
                  className="min-h-12 bg-orange-700 px-6 text-white hover:bg-orange-800 focus-visible:ring-orange-600"
                >
                  Start
                </Button>
              ) : playing ? (
                <Button
                  type="button"
                  onClick={() => audioRef.current?.pause()}
                  className="min-h-12 bg-orange-700 px-6 text-white hover:bg-orange-800 focus-visible:ring-orange-600"
                >
                  Pause
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => void play()}
                  disabled={!track}
                  className="min-h-12 bg-orange-700 px-6 text-white hover:bg-orange-800 focus-visible:ring-orange-600"
                >
                  Resume
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => void play(true)}
                disabled={!(started ? track : currentTrack) || busy !== null}
                className="min-h-12 border-orange-300 bg-white text-orange-900 hover:bg-orange-50 hover:text-orange-900 focus-visible:ring-orange-600"
              >
                Restart
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stop}
                disabled={!started}
                className="min-h-12 border-orange-300 bg-white text-orange-900 hover:bg-orange-50 hover:text-orange-900 focus-visible:ring-orange-600"
              >
                Stop
              </Button>
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Keep this tab open while training. Start playback before locking
              your phone; headphone and lock-screen controls depend on your
              browser.
            </p>
            {track && (
              <audio
                ref={audioRef}
                src={track.src}
                preload="auto"
                onTimeUpdate={(event) =>
                  setElapsed(event.currentTarget.currentTime)
                }
                onPlay={() => {
                  setPlaying(true);
                  setStarted(true);
                  if ("mediaSession" in navigator)
                    navigator.mediaSession.playbackState = "playing";
                }}
                onPause={() => {
                  setPlaying(false);
                  if ("mediaSession" in navigator)
                    navigator.mediaSession.playbackState = "paused";
                }}
                onEnded={() => {
                  setPlaying(false);
                  setStarted(false);
                  setElapsed(track.totalSeconds);
                  setNotice("Workout complete.");
                }}
                onError={() =>
                  setError(
                    "This browser could not play the workout track. Prepare it again or try another browser.",
                  )
                }
                aria-label="Shadowboxing workout audio"
              >
                <track
                  kind="captions"
                  src={timedCaptions(track.captions)}
                  srcLang="en"
                  label="English"
                />
              </audio>
            )}
          </div>
          {readyCount > 0 && (
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {activeRounds.map((round, index) => {
                const request = transitionRequest(
                  round,
                  index,
                  selectedModel,
                  selectedVoice,
                );
                const clip = clips[signature(request)];
                if (!clip) return null;
                return (
                  <li
                    key={round.id}
                    className="rounded-xl border border-orange-200 bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      Round {index + 1}: {round.name.trim() || "Untitled round"}
                    </p>
                    <audio
                      controls
                      src={clip.src}
                      aria-label={`Round ${index + 1} coaching introduction`}
                      className="mt-3 w-full"
                    >
                      <track
                        kind="captions"
                        src={captions(transitionText(round, index))}
                        srcLang="en"
                        label="English"
                      />
                    </audio>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      ) : (
        <p className="mt-5 text-sm leading-6 text-gray-700">
          Voice models are unavailable. Check the server API key and model
          access, then refresh this page.
        </p>
      )}
    </section>
  );
}
