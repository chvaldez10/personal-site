import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "remove expired image upload tickets",
  { hours: 1 },
  internal.imageRecords.cleanupExpired,
  {},
);

export default crons;
