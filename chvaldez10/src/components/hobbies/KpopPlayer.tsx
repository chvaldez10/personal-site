"use client";

import Image from "next/image";
import { ArrowUp, AudioLines, Check } from "lucide-react";
import { useState } from "react";
import type { Doc } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/buttons/button";
import { itunesStoreUrl } from "@/lib/itunes/track";
import KpopRecordScene from "./KpopRecordScene";
import KpopSongPreview from "./KpopSongPreview";
import styles from "./kpop-player.module.css";

const stageColors = ["#ffb4da", "#c2afff", "#ffb39a"];

type Group = Pick<Doc<"kpopGroups">, "_id" | "name" | "songs">;
type Track = Group["songs"][number];

export default function KpopPlayer({ groups }: { groups: Group[] }) {
  const [selection, setSelection] = useState({
    groupId: groups[0]._id,
    trackId: groups[0].songs[0].trackId,
  });
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const activeGroup =
    groups.find(({ _id }) => _id === selection.groupId) ?? groups[0];
  const song =
    activeGroup.songs.find(({ trackId }) => trackId === selection.trackId) ??
    activeGroup.songs[0];
  const color = stageColors[groups.indexOf(activeGroup) % stageColors.length];
  const storeUrl = itunesStoreUrl(song.storeUrl, song.trackId);
  const playerKey = `${activeGroup._id}-${song.trackId}-${song.previewUrl}`;
  const playing = playingKey === playerKey;

  function selectTrack(group: Group, track: Track) {
    if (group._id === activeGroup._id && track.trackId === song.trackId) return;
    setPlayingKey(null);
    setSelection({ groupId: group._id, trackId: track.trackId });
  }

  return (
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
              <KpopSongPreview
                key={playerKey}
                src={song.previewUrl}
                title={song.title}
                onPlaybackChange={(active) =>
                  setPlayingKey((current) =>
                    active ? playerKey : current === playerKey ? null : current,
                  )
                }
              />
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
  );
}
