"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/buttons/button";
import WorkoutSelectField from "./WorkoutSelectField";
import SessionPlayer, {
  type PreparedTrack,
} from "@/components/mma/SessionPlayer";
import {
  audioRequestText,
  type AudioRequest,
  type VoiceModelOption,
  type VoiceOption,
} from "@/lib/workouts/audio/schema";
import { clipCaptionSource } from "@/lib/workouts/audio/captions";
import {
  buildWorkoutTimeline,
  type TimelineRound,
} from "@/lib/workouts/audio/timeline";
import {
  cachedAudio,
  compactAudioSource,
  signature,
} from "@/lib/workouts/audio/clips.client";
import {
  summarizeWorkoutRounds,
  type WorkoutRound,
} from "@/lib/workouts/draft";
import { MAX_SESSION_MINUTES, MAX_WORKOUT_ROUNDS } from "@/lib/workouts/limits.mjs";

type Clip = { signature: string; src: string };

const sharedPrompts = [
  {
    text: "Check your balance. Let your feet reset before the next exchange.",
    positions: [0.16, 0.5],
  },
  {
    text: "Finish this round with clean footwork. Stay balanced as you exit.",
    positions: [0.82],
  },
];

function transitionRequest(
  round: WorkoutRound,
  index: number,
  modelId: string,
  voiceId: string,
): Extract<AudioRequest, { kind: "transition" }> {
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

export default function CoachingAudioBuilder({
  rounds,
  generatedRounds,
  models,
  voices,
}: {
  rounds: WorkoutRound[];
  generatedRounds: WorkoutRound[];
  models: VoiceModelOption[];
  voices: VoiceOption[];
}) {
  const [modelId, setModelId] = useState(models[0]?.id ?? "");
  const [voiceId, setVoiceId] = useState(voices[0]?.id ?? "");
  const [preview, setPreview] = useState<Clip | null>(null);
  const [clips, setClips] = useState<Record<string, string>>({});
  const [source, setSource] = useState<"edited" | "generated">("edited");
  const [track, setTrack] = useState<PreparedTrack | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [busy, setBusy] = useState<"preview" | "rounds" | null>(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const model = models.find((option) => option.id === modelId) ?? models[0];
  const selectedModel = model?.id ?? "";
  const selectedProvider = model?.provider ?? "";
  const availableVoices = voices.filter(
    (voice) => voice.provider === selectedProvider,
  );
  const voice =
    availableVoices.find((option) => option.id === voiceId) ??
    availableVoices[0];
  const selectedVoice = voice?.id ?? "";
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
  const transitions = activeRounds.map((round, index) =>
    transitionRequest(round, index, selectedModel, selectedVoice),
  );
  const cueRequests = sharedPrompts.map(({ text, positions }) => ({
    positions,
    request: {
      kind: "round",
      modelId: selectedModel,
      voiceId: selectedVoice,
      coachingCue: text,
      techniqueReminder: "",
    } satisfies AudioRequest,
  }));
  const sharedCuesReady = cueRequests.every(
    ({ request }) => clips[signature(request)],
  );
  const readyCount = sharedCuesReady
    ? transitions.filter(
        (request) =>
          request.name && request.objective && clips[signature(request)],
      ).length
    : 0;
  const { lengths, plannedMinutes, hasRequiredText } =
    summarizeWorkoutRounds(activeRounds);
  const validRounds =
    lengths !== null &&
    hasRequiredText &&
    activeRounds.length <= MAX_WORKOUT_ROUNDS &&
    plannedMinutes <= MAX_SESSION_MINUTES;
  const currentTrack = track?.signature === planSignature ? track : null;

  useEffect(() => {
    return () => {
      if (track) URL.revokeObjectURL(track.src);
    };
  }, [track]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setElapsed(0);
    setStarted(false);
  }, []);

  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    if (typeof MediaMetadata !== "undefined") {
      session.metadata = new MediaMetadata({
        title: "Shadowboxing practice",
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
  }, [track, stop]);

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
        : await cachedAudio(previewRequest, selectedProvider, setProgress);
      setPreview({ signature: signature(previewRequest), src });
      setNotice("Voice preview is ready.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Voice preview failed. Try again.",
      );
    } finally {
      setProgress("");
      setBusy(null);
    }
  }

  async function prepareAudio() {
    if (
      busy ||
      !selectedModel ||
      !selectedVoice ||
      !validRounds ||
      !lengths ||
      playing
    )
      return;
    setBusy("rounds");
    setError("");
    setNotice("");
    const prepared = { ...clips };
    async function prepareClip(request: AudioRequest) {
      const key = signature(request);
      const cached = prepared[key];
      const src = cached
        ? await compactAudioSource(cached)
        : await cachedAudio(request, selectedProvider, setProgress);
      if (src !== cached) {
        prepared[key] = src;
        setClips({ ...prepared });
      }
      return src;
    }

    try {
      const snapshot = activeRounds.map((round) => ({ ...round }));
      const timelineRounds: TimelineRound[] = [];
      const cues: TimelineRound["cues"] = [];

      for (const [index, announcement] of transitions.entries()) {
        setProgress(`Preparing round ${index + 1} of ${snapshot.length}…`);
        const transitionSrc = await prepareClip(announcement);
        if (index === 0) {
          // The timed reminders are identical across rounds, including their clips.
          for (const { request, positions } of cueRequests) {
            const src = await prepareClip(request);
            const text = audioRequestText(request);
            for (const at of positions) cues.push({ src, text, at });
          }
        }
        timelineRounds.push({
          lengthMinutes: lengths[index],
          transitionSrc,
          transitionText: audioRequestText(announcement),
          cues,
        });
      }
      setProgress("Assembling one continuous practice track…");
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
        totalSeconds: plannedMinutes * 60,
      });
      setNotice(
        "Session audio is ready. Put on your headphones, then tap Start.",
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
    sectionRef.current
      ?.querySelectorAll<HTMLAudioElement>("audio")
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

  return (
    <section
      ref={sectionRef}
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
          Choose a short session and one coach voice. Prepare the audio before
          you start. Each round begins with its objective and coaching cue,
          followed by spaced technique reminders. The same short voice clips are
          reused across rounds to save requests.
        </p>
      </div>

      {models.length && voices.length ? (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <WorkoutSelectField
              label="Session"
              id="workout-source"
              value={source}
              onValueChange={(value) => {
                if (value === "edited" || value === "generated")
                  setSource(value);
              }}
              disabled={busy !== null || playing}
              options={[
                { value: "edited", label: "Current edited session" },
                ...(generatedRounds.length
                  ? [{ value: "generated", label: "Last AI session" }]
                  : []),
              ]}
            />
            <WorkoutSelectField
              label="Voice model"
              id="voice-model"
              value={selectedModel}
              onValueChange={(value) => {
                setModelId(value);
                const provider = models.find(
                  (model) => model.id === value,
                )?.provider;
                setVoiceId(
                  voices.find((voice) => voice.provider === provider)?.id ?? "",
                );
              }}
              disabled={busy !== null || playing}
              options={models.map((model) => ({
                value: model.id,
                label: model.label,
              }))}
            />
            <WorkoutSelectField
              label="Coach voice"
              id="coach-voice"
              value={selectedVoice}
              onValueChange={setVoiceId}
              disabled={busy !== null || playing}
              options={availableVoices.map((voice) => ({
                value: voice.id,
                label: voice.label,
              }))}
            >
              <p className="mt-2 text-sm text-gray-600">{voice?.description}</p>
            </WorkoutSelectField>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={previewVoice}
              disabled={busy !== null || playing}
            >
              {busy === "preview" ? "Preparing preview…" : "Preview voice"}
            </Button>
            <Button
              type="button"
              onClick={prepareAudio}
              disabled={busy !== null || !validRounds || playing}
            >
              {busy === "rounds"
                ? "Preparing audio…"
                : currentTrack
                  ? "Prepare again"
                  : "Prepare session audio"}
            </Button>
            <span className="text-sm text-gray-700">
              {readyCount} of {activeRounds.length} rounds cached
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-gray-600">
            {selectedProvider === "kokoro"
              ? "Kokoro downloads on first use, then generates speech on this device. Preparation may take longer on a phone; cached clips are reused."
              : "A fresh three-round plan uses up to five voice requests. Unchanged clips are reused; previewing or switching voices and models uses more requests."}
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
                  src={clipCaptionSource(audioRequestText(previewRequest))}
                  srcLang="en"
                  label="English"
                />
              </audio>
            </div>
          )}
          {!validRounds && (
            <p className="mt-3 text-sm text-orange-900">
              Complete each round name, objective, and duration first. Audio
              sessions support 1–{MAX_WORKOUT_ROUNDS} rounds and up to{" "}
              {MAX_SESSION_MINUTES} minutes total.
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
          <SessionPlayer
            track={track}
            currentTrack={currentTrack}
            rounds={activeRounds}
            elapsed={elapsed}
            playing={playing}
            started={started}
            preparing={busy !== null}
            audioRef={audioRef}
            onPlay={(restart) => void play(restart)}
            onStop={stop}
            onElapsedChange={setElapsed}
            onPlayingChange={setPlaying}
            onStartedChange={setStarted}
            onComplete={() => setNotice("Session complete.")}
            onError={() =>
              setError(
                "This browser could not play the session track. Prepare it again or try another browser.",
              )
            }
          />
          {readyCount > 0 && (
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {activeRounds.map((round, index) => {
                const request = transitions[index];
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
                      src={clip}
                      aria-label={`Round ${index + 1} coaching introduction`}
                      className="mt-3 w-full"
                    >
                      <track
                        kind="captions"
                        src={clipCaptionSource(audioRequestText(request))}
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
          Voice models are unavailable in this browser. Refresh this page and
          try again.
        </p>
      )}
    </section>
  );
}
