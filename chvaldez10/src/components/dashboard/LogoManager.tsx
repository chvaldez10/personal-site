"use client";
import { useConvexAuth, usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import LogoUploadForm from "./LogoUploadForm";
import LogoList from "./LogoList";
import PaginatedListFooter from "@/components/ui/PaginatedListFooter";
import DashboardSessionStatus from "./DashboardSessionStatus";

export default function LogoManager() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  // Wait for browser authentication before reading private records.
  const {
    results: logos,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.brandLogos.pageForAdmin,
    isAuthenticated ? {} : "skip",
    { initialNumItems: 20 },
  );
  if (isLoading || !isAuthenticated)
    return <DashboardSessionStatus loading={isLoading} />;
  return (
    <div className="space-y-8">
      <LogoUploadForm />
      <div>
        <LogoList logos={status === "LoadingFirstPage" ? undefined : logos} />
        <PaginatedListFooter
          status={status}
          count={logos.length}
          itemLabel="logos"
          onLoadMore={() => loadMore(20)}
        />
      </div>
    </div>
  );
}
