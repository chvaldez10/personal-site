import { Pause, Play } from "lucide-react";
import ArenaHero from "./arena/ArenaHero";
import type { PreviewStatus } from "./KpopSongPreview";
import styles from "./kpop-concert.module.css";

type StagePlayback = {
  title: string;
  status: PreviewStatus;
  onToggle: () => void;
};

export default function KpopStage({
  color,
  playback,
}: {
  color?: string;
  playback?: StagePlayback;
}) {
  const previewActive =
    playback?.status === "playing" || playback?.status === "loading";
  const action =
    playback && playback.status !== "unavailable"
      ? {
          label: previewActive ? "Pause preview" : "Play preview",
          icon: previewActive ? (
            <Pause aria-hidden="true" />
          ) : (
            <Play aria-hidden="true" />
          ),
          className: styles.play,
          onClick: playback.onToggle,
        }
      : undefined;

  const status =
    playback?.status === "unavailable"
      ? "Preview unavailable"
      : playback?.status === "loading"
        ? "Loading preview…"
        : undefined;

  return (
    <ArenaHero
      scene="concert"
      title="K-pop"
      color={color}
      destination={{ href: "#songs", label: "Setlist" }}
      action={action}
      status={status}
    >
      {playback && <p className={styles.currentTrack}>{playback.title}</p>}
    </ArenaHero>
  );
}
