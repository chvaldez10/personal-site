import type { PaginationStatus } from "convex/react";
import { Button } from "@/components/ui/buttons/button";

export default function PaginatedListFooter({
  status,
  count,
  itemLabel,
  onLoadMore,
}: {
  status: PaginationStatus;
  count: number;
  itemLabel: string;
  onLoadMore: () => void;
}) {
  if (status === "LoadingFirstPage" || count === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <output className="text-sm text-gray-600">
        {status === "LoadingMore"
          ? "Loading more…"
          : `${count} ${itemLabel} loaded.`}
      </output>
      {status !== "Exhausted" && (
        <Button
          type="button"
          variant="outline"
          disabled={status !== "CanLoadMore"}
          onClick={onLoadMore}
        >
          {status === "LoadingMore" ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}
