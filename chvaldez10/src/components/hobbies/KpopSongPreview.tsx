"use client";

import type { Ref } from "react";

export type PreviewStatus = "paused" | "loading" | "playing" | "unavailable";

export default function KpopSongPreview({
  src,
  title,
  audioRef,
  unavailable,
  onPlaybackChange,
}: {
  src: string;
  title: string;
  audioRef: Ref<HTMLAudioElement>;
  unavailable: boolean;
  onPlaybackChange: (status: PreviewStatus) => void;
}) {
  if (unavailable) {
    return (
      <output className="block text-sm text-gray-600">
        Preview unavailable.
      </output>
    );
  }

  return (
    // oxlint-disable-next-line jsx-a11y/media-has-caption -- This is an audio-only music preview.
    <audio
      ref={audioRef}
      aria-label={`Preview ${title}`}
      className="block w-full max-w-80"
      controls
      controlsList="nodownload"
      preload="none"
      src={src}
      onPlay={() => onPlaybackChange("loading")}
      onPlaying={() => onPlaybackChange("playing")}
      onPause={() => onPlaybackChange("paused")}
      onEnded={() => onPlaybackChange("paused")}
      onWaiting={(event) => {
        if (!event.currentTarget.paused) onPlaybackChange("loading");
      }}
      onError={() => onPlaybackChange("unavailable")}
    />
  );
}
