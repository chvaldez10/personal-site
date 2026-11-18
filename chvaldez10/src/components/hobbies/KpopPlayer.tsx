"use client";

import Image from "next/image";
import { Music2 } from "lucide-react";
import { useState } from "react";
import type { Doc } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/buttons/button";
import { itunesStoreUrl } from "@/lib/itunes/track";
import { cn } from "@/lib/utils";
import KpopSongPreview from "./KpopSongPreview";
import KpopRecordScene from "./KpopRecordScene";

const palettes = [
  { shell: "#f7c9dc", accent: "#9c2759", disc: "#ffb4da" },
  { shell: "#dcd6ff", accent: "#574297", disc: "#b8a3ff" },
  { shell: "#ffdbc4", accent: "#9a4727", disc: "#ffa98b" },
];

type Group = Pick<Doc<"kpopGroups">, "_id" | "name" | "songs">;

export default function KpopPlayer({ groups }: { groups: Group[] }) {
  const [selection, setSelection] = useState({
    groupId: groups[0]._id,
    trackId: groups[0].songs[0].trackId,
  });
  const activeGroup =
    groups.find(({ _id }) => _id === selection.groupId) ?? groups[0];
  const song =
    activeGroup.songs.find(({ trackId }) => trackId === selection.trackId) ??
    activeGroup.songs[0];
  const palette = palettes[groups.indexOf(activeGroup) % palettes.length];
  const storeUrl = itunesStoreUrl(song.storeUrl, song.trackId);
  const playerKey = `${activeGroup._id}-${song.trackId}-${song.previewUrl}`;
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "grid min-w-0 overflow-hidden rounded-[2rem] border border-[#e8cfdc] bg-white shadow-[0_22px_65px_-35px_#76375970]",
        !expanded && "lg:grid-cols-[1.08fr_1fr]",
      )}
    >
      <div
        className="min-w-0 p-3 sm:p-4"
        style={{ backgroundColor: palette.shell }}
      >
        <KpopRecordScene
          name={activeGroup.name}
          color={palette.disc}
          accent={palette.accent}
          playing={playingKey === playerKey}
          expanded={expanded}
          onToggleExpanded={() => setExpanded((current) => !current)}
        />
        <div className="rounded-[1.35rem] bg-white/80 px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold text-[#6d425d]">Selected track</p>
          <h3 className="mt-1 text-2xl font-black leading-tight tracking-tight text-[#261729] wrap-break-word sm:text-3xl">
            {song.title}
          </h3>
          <p className="mt-1 text-sm text-[#594251] wrap-break-word">
            {[song.artist, song.album].filter(Boolean).join(" · ")}
          </p>
          {storeUrl && (
            <div className="mt-4 space-y-3">
              <KpopSongPreview
                key={playerKey}
                src={song.previewUrl}
                title={song.title}
                onPlaybackChange={(playing) =>
                  setPlayingKey(playing ? playerKey : null)
                }
              />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
                <p className="text-xs text-[#594251]">
                  Preview provided courtesy of iTunes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0 px-5 py-6 sm:p-8">
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="mb-3 text-sm font-semibold text-[#594251]">
            Groups
          </legend>
          {groups.map((group) => (
            <Button
              key={group._id}
              type="button"
              size="sm"
              variant="outline"
              aria-pressed={group._id === activeGroup._id}
              className="h-auto min-h-9 max-w-full whitespace-normal rounded-full border-[#e9d5e2] py-1.5 text-[#59364d] wrap-break-word hover:bg-pink-50 aria-pressed:border-[#713758] aria-pressed:bg-[#713758] aria-pressed:text-white"
              onClick={() => {
                if (group._id !== activeGroup._id) {
                  setPlayingKey(null);
                  setSelection({
                    groupId: group._id,
                    trackId: group.songs[0].trackId,
                  });
                }
              }}
            >
              {group.name}
            </Button>
          ))}
        </fieldset>
        <h3 className="mb-3 mt-8 text-2xl font-black tracking-tight text-[#261729] wrap-break-word">
          {activeGroup.name}
        </h3>
        <ul className="space-y-2" aria-label={`Tracks by ${activeGroup.name}`}>
          {activeGroup.songs.map((track) => {
            const selected = track.trackId === song.trackId;
            return (
              <li key={track.trackId}>
                <Button
                  type="button"
                  variant="ghost"
                  aria-pressed={selected}
                  className="h-auto min-h-16 w-full justify-start gap-3 whitespace-normal rounded-xl border border-transparent px-3 py-2.5 text-left hover:bg-[#fff3f8] aria-pressed:border-[#e7b6ce] aria-pressed:bg-[#fceaf3]"
                  onClick={() => {
                    if (selected) return;
                    setPlayingKey(null);
                    setSelection({
                      groupId: activeGroup._id,
                      trackId: track.trackId,
                    });
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f6e5ef] text-[#8c2c5e]"
                  >
                    <Music2 />
                  </span>
                  <span className="min-w-0 wrap-break-word">
                    <span className="block text-base font-bold text-[#261729]">
                      {track.title}
                    </span>
                    {track.album && (
                      <span className="block text-xs text-[#594251]">
                        {track.album}
                      </span>
                    )}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
