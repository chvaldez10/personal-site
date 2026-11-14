"use client";

import { useState, type SubmitEvent } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { searchItunes } from "@/actions/searchItunes";
import { Button } from "@/components/ui/buttons/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ItunesTrack } from "@/lib/itunes/track";
import DashboardField from "./DashboardField";
import DashboardSessionStatus from "./DashboardSessionStatus";

type Group = Pick<Doc<"kpopGroups">, "_id" | "name" | "songs">;

function actionError(error: unknown, fallback: string) {
  return error instanceof ConvexError && typeof error.data === "string"
    ? error.data
    : fallback;
}

function GroupCard({ group }: { group: Group }) {
  const saveGroup = useMutation(api.kpop.saveGroup);
  const removeGroup = useMutation(api.kpop.removeGroup);
  const addSong = useMutation(api.kpop.addSong);
  const removeSong = useMutation(api.kpop.removeSong);
  const [editing, setEditing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<ItunesTrack[] | null>(null);
  const [error, setError] = useState("");

  async function update(operation: () => Promise<unknown>, fallback: string) {
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (cause) {
      setError(actionError(cause, fallback));
    } finally {
      setBusy(false);
    }
  }

  async function findSongs(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = String(
      new FormData(event.currentTarget).get("song") ?? "",
    ).trim();
    setSearching(true);
    setError("");
    setResults(null);
    try {
      const result = await searchItunes(`${group.name} ${title}`);
      if ("error" in result) setError(result.error);
      else setResults(result.tracks);
    } catch {
      setError("iTunes search is unavailable. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <Card className="border-orange-200 bg-white text-gray-950">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <h2 className="min-w-0 wrap-break-word text-xl font-semibold">
          {group.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || searching}
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Cancel rename" : "Rename"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={busy || searching}
            onClick={() => {
              if (
                window.confirm(
                  `Remove ${group.name} and all of its songs from the K-pop page?`,
                )
              ) {
                void update(
                  () => removeGroup({ id: group._id }),
                  "Could not remove the group.",
                );
              }
            }}
          >
            Remove group
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5" aria-busy={busy || searching}>
        {editing && (
          <form
            className="grid items-end gap-2 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              const name = String(
                new FormData(event.currentTarget).get("name") ?? "",
              );
              void update(async () => {
                await saveGroup({ id: group._id, name });
                setEditing(false);
                setResults(null);
              }, "Could not rename the group.");
            }}
          >
            <DashboardField
              label="Group name"
              name="name"
              defaultValue={group.name}
              maxLength={100}
              required
              disabled={busy}
            />
            <Button type="submit" disabled={busy}>
              Save name
            </Button>
          </form>
        )}
        {group.songs.length === 0 ? (
          <p className="text-sm text-gray-600">No songs added yet.</p>
        ) : (
          <ul
            aria-label={`Saved songs for ${group.name}`}
            className="divide-y divide-orange-100"
          >
            {group.songs.map((song) => (
              <li
                key={song.trackId}
                className="flex items-center justify-between gap-3 py-2"
              >
                <p className="min-w-0 wrap-break-word font-medium">
                  {song.title}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy || searching}
                  aria-label={`Remove ${song.title}`}
                  onClick={() =>
                    void update(
                      () =>
                        removeSong({ id: group._id, trackId: song.trackId }),
                      "Could not remove the song.",
                    )
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={findSongs}
          className="grid items-end gap-2 sm:grid-cols-[1fr_auto]"
        >
          <DashboardField
            label={`Find a song for ${group.name}`}
            name="song"
            placeholder="Song title"
            maxLength={99}
            required
            disabled={busy || searching}
          />
          <Button type="submit" variant="outline" disabled={busy || searching}>
            {searching ? "Searching…" : "Search iTunes"}
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {results?.length === 0 && (
          <output className="block text-sm text-gray-600">
            No songs with previews found. Try another title.
          </output>
        )}
        {results && results.length > 0 && (
          <ul
            aria-label="iTunes search results"
            className="divide-y divide-orange-100 rounded-lg border border-orange-100 px-3"
          >
            {results.map((song) => {
              const added = group.songs.some(
                ({ trackId }) => trackId === song.trackId,
              );
              return (
                <li
                  key={song.trackId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0 wrap-break-word">
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-gray-600">
                      {[song.artist, song.album].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={added || busy || searching}
                    aria-label={`${added ? "Added" : "Add"} ${song.title}`}
                    onClick={() =>
                      void update(
                        () => addSong({ id: group._id, song }),
                        "Could not add the song.",
                      )
                    }
                  >
                    {added ? "Added" : "Add"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function KpopManager() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const groups = useQuery(api.kpop.listGroups, isAuthenticated ? {} : "skip");
  const saveGroup = useMutation(api.kpop.saveGroup);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addGroup(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name") ?? "");
    setBusy(true);
    setError("");
    try {
      await saveGroup({ name });
      form.reset();
    } catch (cause) {
      setError(actionError(cause, "Could not add the group."));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || !isAuthenticated)
    return <DashboardSessionStatus loading={isLoading} />;

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-white text-gray-950">
        <CardContent className="pt-6">
          <form
            onSubmit={addGroup}
            className="grid items-end gap-2 sm:grid-cols-[1fr_auto]"
            aria-busy={busy}
          >
            <DashboardField
              label="New group name"
              name="name"
              placeholder="e.g. ILLIT"
              maxLength={100}
              required
              disabled={busy}
            />
            <Button type="submit" disabled={busy}>
              {busy ? "Adding…" : "Add group"}
            </Button>
          </form>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
      {groups === undefined && (
        <output className="block text-sm text-gray-600">
          Loading groups…
        </output>
      )}
      {groups?.length === 0 && (
        <p className="text-sm text-gray-600">
          Add a group to start featuring songs.
        </p>
      )}
      {groups?.map((group) => (
        <GroupCard key={group._id} group={group} />
      ))}
    </div>
  );
}
