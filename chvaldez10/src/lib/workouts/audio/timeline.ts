type TimelineRound = {
  lengthMinutes: number;
  transitionSrc: string;
  transitionText: string;
  cues: { src: string; text: string; at: number }[];
};

export type TimelineCaption = { start: number; end: number; text: string };

type PcmClip = { sampleRate: number; samples: Uint8Array };

function readPcmWav(buffer: ArrayBuffer): PcmClip {
  const view = new DataView(buffer);
  if (
    buffer.byteLength < 44 ||
    String.fromCharCode(...new Uint8Array(buffer, 0, 4)) !== "RIFF" ||
    String.fromCharCode(...new Uint8Array(buffer, 8, 4)) !== "WAVE"
  ) {
    throw new Error("The voice service returned an unsupported audio file.");
  }

  let sampleRate = 0;
  let channels = 0;
  let bitsPerSample = 0;
  let format = 0;
  let data: Uint8Array | null = null;
  for (let offset = 12; offset + 8 <= buffer.byteLength;) {
    const tag = String.fromCharCode(...new Uint8Array(buffer, offset, 4));
    const size = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (start + size > buffer.byteLength) break;
    if (tag === "fmt " && size >= 16) {
      format = view.getUint16(start, true);
      channels = view.getUint16(start + 2, true);
      sampleRate = view.getUint32(start + 4, true);
      bitsPerSample = view.getUint16(start + 14, true);
    }
    if (tag === "data") data = new Uint8Array(buffer, start, size);
    offset = start + size + (size % 2);
  }
  if (
    format !== 1 ||
    channels !== 1 ||
    bitsPerSample !== 16 ||
    sampleRate < 8_000 ||
    !data ||
    data.byteLength === 0 ||
    data.byteLength % 2 !== 0
  ) {
    throw new Error("The voice service returned an unsupported audio format.");
  }
  return { sampleRate, samples: data };
}

function wavHeader(sampleRate: number, dataBytes: number) {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const letters = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index++) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };
  letters(0, "RIFF");
  view.setUint32(4, dataBytes + 36, true);
  letters(8, "WAVE");
  letters(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  letters(36, "data");
  view.setUint32(40, dataBytes, true);
  return header;
}

// Shorten extended silence inside a spoken clip. The workout's scheduled
// silence is added later and is intentionally left alone.
export async function compactSpokenWav(blob: Blob): Promise<Blob> {
  const clip = readPcmWav(await blob.arrayBuffer());
  const sampleCount = clip.samples.byteLength / 2;
  const frameSamples = Math.max(1, Math.round(clip.sampleRate * 0.02));
  const view = new DataView(
    clip.samples.buffer,
    clip.samples.byteOffset,
    clip.samples.byteLength,
  );
  const levels: number[] = [];
  let loudest = 0;
  for (let start = 0; start < sampleCount; start += frameSamples) {
    const end = Math.min(start + frameSamples, sampleCount);
    let energy = 0;
    for (let sample = start; sample < end; sample++) {
      const value = view.getInt16(sample * 2, true);
      energy += value * value;
    }
    const level = Math.sqrt(energy / (end - start));
    levels.push(level);
    loudest = Math.max(loudest, level);
  }
  if (loudest < 80) return blob;

  const quietThreshold = Math.max(80, Math.min(250, loudest * 0.025));
  const minimumPause = Math.round(clip.sampleRate * 0.75);
  const edgePause = Math.round(clip.sampleRate * 0.12);
  const innerPause = Math.round(clip.sampleRate * 0.16);
  const kept: { start: number; end: number }[] = [];
  let segmentStart = 0;
  let quietStart = -1;
  for (let frame = 0; frame <= levels.length; frame++) {
    const quiet = frame < levels.length && levels[frame] < quietThreshold;
    if (quiet && quietStart < 0) quietStart = frame;
    if (!quiet && quietStart >= 0) {
      const start = quietStart * frameSamples;
      const end = Math.min(frame * frameSamples, sampleCount);
      if (end - start >= minimumPause) {
        const cutStart =
          start +
          (start === 0 ? 0 : end === sampleCount ? edgePause : innerPause);
        const cutEnd =
          end -
          (end === sampleCount ? 0 : start === 0 ? edgePause : innerPause);
        if (cutEnd > cutStart) {
          if (cutStart > segmentStart)
            kept.push({ start: segmentStart, end: cutStart });
          segmentStart = cutEnd;
        }
      }
      quietStart = -1;
    }
  }
  if (segmentStart === 0) return blob;
  if (segmentStart < sampleCount)
    kept.push({ start: segmentStart, end: sampleCount });

  const outputSamples = kept.reduce(
    (sum, range) => sum + range.end - range.start,
    0,
  );
  const parts: BlobPart[] = [wavHeader(clip.sampleRate, outputSamples * 2)];
  for (const range of kept) {
    parts.push(
      new Uint8Array(clip.samples.subarray(range.start * 2, range.end * 2)),
    );
  }
  return new Blob(parts, { type: "audio/wav" });
}

export async function buildWorkoutTimeline(
  rounds: TimelineRound[],
): Promise<{ audio: Blob; captions: TimelineCaption[] }> {
  const totalSeconds = rounds.reduce(
    (sum, round) => sum + round.lengthMinutes * 60,
    0,
  );
  if (
    rounds.length === 0 ||
    rounds.length > 12 ||
    rounds.some(
      (round) =>
        !Number.isInteger(round.lengthMinutes) ||
        round.lengthMinutes < 1 ||
        round.lengthMinutes > 30,
    ) ||
    totalSeconds > 45 * 60
  ) {
    throw new Error(
      "Audio workouts support 1–12 rounds and up to 45 minutes total.",
    );
  }

  const clips = await Promise.all(
    rounds.flatMap((round) =>
      [round.transitionSrc, ...round.cues.map((cue) => cue.src)].map(
        async (src) => readPcmWav(await (await fetch(src)).arrayBuffer()),
      ),
    ),
  );
  const sampleRate = clips[0]?.sampleRate;
  if (!sampleRate || clips.some((clip) => clip.sampleRate !== sampleRate)) {
    throw new Error(
      "The voice clips use different audio formats. Prepare them again.",
    );
  }

  const placements: { offset: number; samples: Uint8Array; text: string }[] =
    [];
  let clipIndex = 0;
  let roundStart = 0;
  for (const round of rounds) {
    const roundSamples = round.lengthMinutes * 60 * sampleRate;
    const announcement = clips[clipIndex++];
    const announcementLength = announcement.samples.byteLength / 2;
    if (announcementLength >= roundSamples) {
      throw new Error("A round announcement is longer than its round.");
    }
    placements.push({
      offset: roundStart,
      samples: announcement.samples,
      text: round.transitionText,
    });

    let lastEnd = roundStart + announcementLength;
    for (const instruction of round.cues) {
      const cue = clips[clipIndex++];
      const cueLength = cue.samples.byteLength / 2;
      const earliest = lastEnd + 7 * sampleRate;
      const preferred = roundStart + Math.round(roundSamples * instruction.at);
      const latest = roundStart + roundSamples - cueLength - 2 * sampleRate;
      if (earliest > latest) {
        continue;
      }
      const offset = Math.min(Math.max(earliest, preferred), latest);
      placements.push({
        offset,
        samples: cue.samples,
        text: instruction.text,
      });
      lastEnd = offset + cueLength;
    }
    roundStart += roundSamples;
  }

  const totalSamples = totalSeconds * sampleRate;
  const silence = new Uint8Array(sampleRate * 2);
  const parts: BlobPart[] = [wavHeader(sampleRate, totalSamples * 2)];
  let cursor = 0;
  for (const placement of placements) {
    let gap = placement.offset - cursor;
    if (gap < 0)
      throw new Error("Coaching audio overlaps another instruction.");
    while (gap > 0) {
      const count = Math.min(gap, sampleRate);
      parts.push(silence.subarray(0, count * 2));
      gap -= count;
    }
    parts.push(new Uint8Array(placement.samples));
    cursor = placement.offset + placement.samples.byteLength / 2;
  }
  let remaining = totalSamples - cursor;
  while (remaining > 0) {
    const count = Math.min(remaining, sampleRate);
    parts.push(silence.subarray(0, count * 2));
    remaining -= count;
  }
  return {
    audio: new Blob(parts, { type: "audio/wav" }),
    captions: placements
      .filter((placement) => placement.text.trim())
      .map((placement) => ({
        start: placement.offset / sampleRate,
        end: (placement.offset + placement.samples.byteLength / 2) / sampleRate,
        text: placement.text,
      })),
  };
}
