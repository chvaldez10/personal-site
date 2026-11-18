import type { TimelineCaption } from "./timeline";

function captionTime(seconds: number) {
  const milliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const wholeSeconds = Math.floor((milliseconds % 60_000) / 1000);
  const fraction = milliseconds % 1000;
  const time = [hours, minutes, wholeSeconds].map((part) =>
    String(part).padStart(2, "0"),
  );
  return `${time.join(":")}.${String(fraction).padStart(3, "0")}`;
}

export function captionTrackSource(items: TimelineCaption[]) {
  const cues = items.map(({ start, end, text }) => {
    const transcript = text
      .replaceAll(/\s+/g, " ")
      .replaceAll("-->", "→")
      .trim();
    return `${captionTime(start)} --> ${captionTime(end)}\n${transcript}\n`;
  });
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(`WEBVTT\n\n${cues.join("\n")}`)}`;
}

export function clipCaptionSource(text: string) {
  return captionTrackSource([{ start: 0, end: 300, text }]);
}
