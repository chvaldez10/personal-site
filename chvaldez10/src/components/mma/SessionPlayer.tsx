import type { RefObject } from "react";
import { Button } from "@/components/ui/buttons/button";
import type { TimelineCaption } from "@/lib/workouts/audio/timeline";
import type { WorkoutRound } from "@/lib/workouts/draft";

export type PreparedTrack = {
  signature: string;
  src: string;
  rounds: WorkoutRound[];
  totalSeconds: number;
  captions: TimelineCaption[];
};

type SessionPlayerProps = {
  track: PreparedTrack | null;
  currentTrack: PreparedTrack | null;
  rounds: WorkoutRound[];
  elapsed: number;
  playing: boolean;
  started: boolean;
  preparing: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  onPlay: (restart?: boolean) => void;
  onStop: () => void;
  onElapsedChange: (seconds: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onStartedChange: (started: boolean) => void;
  onComplete: () => void;
  onError: () => void;
};

function clock(seconds: number) {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
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

export default function SessionPlayer({
  track,
  currentTrack,
  rounds,
  elapsed,
  playing,
  started,
  preparing,
  audioRef,
  onPlay,
  onStop,
  onElapsedChange,
  onPlayingChange,
  onStartedChange,
  onComplete,
  onError,
}: SessionPlayerProps) {
  const displayedTrack = track && started ? track : currentTrack;
  const displayRounds = displayedTrack?.rounds ?? rounds;
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

  return (
    <div className="mt-6 rounded-2xl border border-orange-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-orange-700 uppercase">
            Session player
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
          aria-label="Time remaining in session"
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
            onClick={() => onPlay(true)}
            disabled={!currentTrack || preparing}
            className="min-h-12 px-6"
          >
            Start
          </Button>
        ) : playing ? (
          <Button
            type="button"
            onClick={() => audioRef.current?.pause()}
            className="min-h-12 px-6"
          >
            Pause
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => onPlay()}
            disabled={!track}
            className="min-h-12 px-6"
          >
            Resume
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => onPlay(true)}
          disabled={!(started ? track : currentTrack) || preparing}
          className="min-h-12"
        >
          Restart
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onStop}
          disabled={!started}
          className="min-h-12"
        >
          Stop
        </Button>
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-600">
        Keep this tab open while practicing. Start playback before locking your
        phone; headphone and lock-screen controls depend on your browser.
      </p>
      {track && (
        <audio
          ref={audioRef}
          src={track.src}
          preload="auto"
          onTimeUpdate={(event) =>
            onElapsedChange(event.currentTarget.currentTime)
          }
          onPlay={() => {
            onPlayingChange(true);
            onStartedChange(true);
            if ("mediaSession" in navigator)
              navigator.mediaSession.playbackState = "playing";
          }}
          onPause={() => {
            onPlayingChange(false);
            if ("mediaSession" in navigator)
              navigator.mediaSession.playbackState = "paused";
          }}
          onEnded={() => {
            onPlayingChange(false);
            onStartedChange(false);
            onElapsedChange(track.totalSeconds);
            onComplete();
          }}
          onError={onError}
          aria-label="Shadowboxing session audio"
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
  );
}
