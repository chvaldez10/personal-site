"use client";

import Image from "next/image";
import { ArrowUp, AudioLines, Check } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import type { Doc } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/buttons/button";
import { itunesPreviewUrl, itunesStoreUrl } from "@/lib/itunes/track";
import KpopRecordScene from "./KpopRecordScene";
import KpopSongPreview, { type PreviewStatus } from "./KpopSongPreview";
import KpopStage from "./KpopStage";
import concertStyles from "./kpop-concert.module.css";
import styles from "./kpop-player.module.css";

const stageColors = ["#ffb4da", "#c2afff", "#ffb39a"];

type Group = Pick<Doc<"kpopGroups">, "_id" | "name" | "songs">;
type Track = Group["songs"][number];

function Concert({
  stage,
  children,
}: {
  stage: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={concertStyles.page}>
      {stage}
      <section
        id="songs"
        aria-labelledby="songs-heading"
        tabIndex={-1}
        className={concertStyles.setlist}
      >
        {children}
      </section>
    </div>
  );
}

export default function KpopPlayer({
  groups,
  unavailable,
}: {
  groups: Group[];
  unavailable: boolean;
}) {
  if (groups.length > 0) return <ConcertPlayer groups={groups} />;

  return (
    <Concert stage={<KpopStage />}>
      <div className={concertStyles.empty}>
        <h2 id="songs-heading">Setlist</h2>
        <p className="text-sm text-gray-700">
          {unavailable
            ? "Song previews are temporarily unavailable."
            : "Songs I want to highlight will live here."}
        </p>
      </div>
    </Concert>
  );
}

function ConcertPlayer({ groups }: { groups: Group[] }) {
  const [selection, setSelection] = useState({
    groupId: groups[0]._id,
    trackId: groups[0].songs[0].trackId,
  });
  const [playback, setPlayback] = useState<{
    key: string;
    status: PreviewStatus;
  } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  const activeGroup =
    groups.find(({ _id }) => _id === selection.groupId) ?? groups[0];
  const song =
    activeGroup.songs.find(({ trackId }) => trackId === selection.trackId) ??
    activeGroup.songs[0];
  const color = stageColors[groups.indexOf(activeGroup) % stageColors.length];
  const storeUrl = itunesStoreUrl(song.storeUrl, song.trackId);
  const previewUrl = itunesPreviewUrl(song.previewUrl);
  const playerKey = `${activeGroup._id}-${song.trackId}-${song.previewUrl}`;
  const status = playback?.key === playerKey ? playback.status : "paused";
  const previewStatus = previewUrl ? status : "unavailable";
  const playing = previewStatus === "playing";

  function togglePreview() {
    const element = audio.current;
    if (!element) return;
    if (!element.paused) {
      element.pause();
      return;
    }
    void element.play().catch((error: unknown) => {
      if (audio.current !== element) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      setPlayback({ key: playerKey, status: "unavailable" });
    });
  }

  function selectTrack(group: Group, track: Track) {
    if (group._id === activeGroup._id && track.trackId === song.trackId) return;
    setPlayback(null);
    setSelection({ groupId: group._id, trackId: track.trackId });
  }

  return (
    <Concert
      stage={
        <KpopStage
          color={color}
          playback={
            storeUrl
              ? {
                  title: song.title,
                  status: previewStatus,
                  onToggle: togglePreview,
                }
              : undefined
          }
        />
      }
    >
      <div className={styles.player} data-expanded={expanded}>
        <div className="min-w-0">
          <KpopRecordScene
            name={activeGroup.name}
            color={color}
            playing={playing}
            expanded={expanded}
            onToggleExpanded={() => setExpanded((current) => !current)}
          />
          <div id="now-playing" tabIndex={-1} className={styles.nowPlaying}>
            <div aria-live="polite" aria-atomic="true" className="min-w-0">
              <p className={styles.playbackLabel}>
                <AudioLines size={16} aria-hidden="true" />
                {playing ? "Playing preview" : "Selected track"}
              </p>
              <h3 className={styles.trackTitle}>{song.title}</h3>
              <p className={styles.trackArtist}>
                {[song.artist, song.album].filter(Boolean).join(" · ")}
              </p>
            </div>
            {storeUrl && (
              <div className={styles.preview}>
                {previewUrl ? (
                  <KpopSongPreview
                    key={playerKey}
                    src={previewUrl}
                    title={song.title}
                    audioRef={audio}
                    unavailable={previewStatus === "unavailable"}
                    onPlaybackChange={(status) =>
                      setPlayback({ key: playerKey, status })
                    }
                  />
                ) : (
                  <p className="text-sm text-gray-600">Preview unavailable.</p>
                )}
                <div className={styles.attribution}>
                  <a
                    href={storeUrl}
                    className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-800"
                  >
                    <Image
                      src="/images/itunes-store-badge.svg"
                      width={140}
                      height={41}
                      alt={`Get ${song.title} on the iTunes Store`}
                      unoptimized
                    />
                  </a>
                  <p>Preview provided courtesy of iTunes.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.lineup}>
          <div className={styles.lineupHeading}>
            <h2 id="songs-heading">Setlist</h2>
            <a href="#now-playing" className={styles.playerLink}>
              Player <ArrowUp size={15} aria-hidden="true" />
            </a>
          </div>
          <fieldset className={styles.groups}>
            <legend className="sr-only">Groups</legend>
            {groups.map((group) => (
              <Button
                key={group._id}
                type="button"
                size="sm"
                variant="outline"
                aria-pressed={group._id === activeGroup._id}
                className={styles.group}
                onClick={() => {
                  if (group._id !== activeGroup._id)
                    selectTrack(group, group.songs[0]);
                }}
              >
                {group.name}
              </Button>
            ))}
          </fieldset>
          <ol
            className={styles.tracks}
            aria-label={`Tracks by ${activeGroup.name}`}
          >
            {activeGroup.songs.map((track, index) => {
              const selected = track.trackId === song.trackId;
              return (
                <li key={track.trackId}>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-pressed={selected}
                    className={styles.track}
                    onClick={() => selectTrack(activeGroup, track)}
                  >
                    <span aria-hidden="true" className={styles.trackNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 wrap-break-word">
                      <span className={styles.trackName}>{track.title}</span>
                      {track.album && (
                        <span className={styles.album}>{track.album}</span>
                      )}
                    </span>
                    {selected && (
                      <span className={styles.trackIcon} aria-hidden="true">
                        {playing ? <AudioLines /> : <Check />}
                      </span>
                    )}
                  </Button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Concert>
  );
}
