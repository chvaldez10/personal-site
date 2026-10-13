"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/buttons/button";

type InquiryStatus = "new" | "contacted" | "closed";
const statuses: InquiryStatus[] = ["new", "contacted", "closed"];

export default function TutoringInquiryManager() {
  const { isAuthenticated } = useConvexAuth();
  const [status, setStatus] = useState<InquiryStatus>("new");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inquiries = useQuery(
    api.tutoringInquiries.listForOwner,
    isAuthenticated ? { status } : "skip",
  );
  const setInquiryStatus = useMutation(api.tutoringInquiries.setStatus);
  const removeInquiry = useMutation(api.tutoringInquiries.remove);

  async function update(
    id: NonNullable<typeof inquiries>[number]["_id"],
    nextStatus: InquiryStatus,
  ) {
    setBusyId(id);
    setError("");
    try {
      await setInquiryStatus({ id, status: nextStatus });
    } catch {
      setError("Could not update the inquiry. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: NonNullable<typeof inquiries>[number]["_id"]) {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    setBusyId(id);
    setError("");
    try {
      await removeInquiry({ id });
    } catch {
      setError("Could not delete the inquiry. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="tutoring-inquiries-title">
      <div>
        <h2 id="tutoring-inquiries-title" className="text-xl font-semibold">
          Tutoring inquiries
        </h2>
        <p className="text-sm text-muted-foreground">
          The newest 100 inquiries in each status.
        </p>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Filter inquiries">
        {statuses.map((item) => (
          <Button
            key={item}
            type="button"
            variant={status === item ? "default" : "outline"}
            onClick={() => setStatus(item)}
            className="capitalize"
          >
            {item}
          </Button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {inquiries === undefined ? (
        <p>Loading inquiries…</p>
      ) : inquiries.length === 0 ? (
        <p>No {status} inquiries.</p>
      ) : (
        <ul className="grid gap-4">
          {inquiries.map((inquiry) => (
            <li
              key={inquiry._id}
              className="rounded-xl border bg-background p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{inquiry.contactName}</h3>
                  <a className="underline" href={`mailto:${encodeURIComponent(inquiry.email)}`}>
                    {inquiry.email}
                  </a>
                </div>
                <time
                  className="text-sm text-muted-foreground"
                  dateTime={new Date(inquiry._creationTime).toISOString()}
                >
                  {new Date(inquiry._creationTime).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-3 text-sm font-medium">
                Grade {inquiry.grade} ·{" "}
                {inquiry.subject === "both"
                  ? "Math and science"
                  : inquiry.subject}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {inquiry.message}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {statuses
                  .filter((item) => item !== inquiry.status)
                  .map((item) => (
                    <Button
                      key={item}
                      type="button"
                      variant="outline"
                      disabled={busyId === inquiry._id}
                      onClick={() => void update(inquiry._id, item)}
                      className="capitalize"
                    >
                      Mark {item}
                    </Button>
                  ))}
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busyId === inquiry._id}
                  onClick={() => void remove(inquiry._id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
