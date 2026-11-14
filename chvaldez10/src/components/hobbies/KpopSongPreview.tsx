"use client";

import { useState } from "react";

export default function KpopSongPreview({
  src,
  title,
  onPlaybackChange,
}: {
  src: string;
  title: string;
  onPlaybackChange: (playing: boolean) => void;
}) {
  const [unavailable, setUnavailable] = useState(false);

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
      aria-label={`Preview ${title}`}
      className="block w-full max-w-80"
      controls
      controlsList="nodownload"
      preload="none"
      src={src}
      onPlaying={() => onPlaybackChange(true)}
      onPause={() => onPlaybackChange(false)}
      onEnded={() => onPlaybackChange(false)}
      onWaiting={() => onPlaybackChange(false)}
      onError={() => {
        onPlaybackChange(false);
        setUnavailable(true);
      }}
    />
  );
}
