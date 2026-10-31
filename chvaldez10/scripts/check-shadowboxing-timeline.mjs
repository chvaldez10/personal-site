import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import {
  buildWorkoutTimeline,
  compactSpokenWav,
} from "../src/lib/workouts/audio/timeline.ts";

function clip(seconds, frequency) {
  const sampleRate = 24_000;
  const samples = Math.round(seconds * sampleRate);
  const bytes = Buffer.alloc(44 + samples * 2);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24);
  bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(samples * 2, 40);
  for (let index = 0; index < samples; index++) {
    bytes.writeInt16LE(
      Math.round(
        Math.sin((2 * Math.PI * frequency * index) / sampleRate) * 2000,
      ),
      44 + index * 2,
    );
  }
  return `data:audio/wav;base64,${bytes.toString("base64")}`;
}

const transition = clip(0.5, 440);
const cue = clip(0.25, 660);
const speechWithPause = Buffer.from(clip(2.1, 440).split(",")[1], "base64");
speechWithPause.fill(0, 44 + 0.3 * 24_000 * 2, 44 + 1.8 * 24_000 * 2);
const compactedSpeech = await compactSpokenWav(
  new Blob([speechWithPause], { type: "audio/wav" }),
);
const compactedSeconds = (compactedSpeech.size - 44) / (24_000 * 2);
assert.ok(
  compactedSeconds > 0.85 && compactedSeconds < 1,
  `long internal pause should become brief, got ${compactedSeconds}s`,
);
const speechWithShortPause = Buffer.from(
  clip(1.1, 440).split(",")[1],
  "base64",
);
speechWithShortPause.fill(0, 44 + 0.35 * 24_000 * 2, 44 + 0.75 * 24_000 * 2);
const shortPause = await compactSpokenWav(
  new Blob([speechWithShortPause], { type: "audio/wav" }),
);
assert.equal(
  shortPause.size,
  speechWithShortPause.length,
  "natural short pause remains",
);
const timeline = await buildWorkoutTimeline([
  {
    lengthMinutes: 1,
    transitionSrc: transition,
    transitionText: "Round one",
    cues: [
      { src: cue, text: "Stay balanced", at: 0.12 },
      { src: cue, text: "Check your guard", at: 0.47 },
      { src: cue, text: "Finish clean", at: 0.8 },
    ],
  },
  {
    lengthMinutes: 1,
    transitionSrc: transition,
    transitionText: "Round two",
    cues: [],
  },
]);
const bytes = Buffer.from(await timeline.audio.arrayBuffer());
assert.deepEqual(
  timeline.captions.map(({ start, text }) => [start, text]),
  [
    [0, "Round one"],
    [7.5, "Stay balanced"],
    [28.2, "Check your guard"],
    [48, "Finish clean"],
    [60, "Round two"],
  ],
);
assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
assert.equal(bytes.readUInt32LE(40), 120 * 24_000 * 2);
const sample = (seconds) =>
  bytes.readInt16LE(44 + Math.round(seconds * 24_000) * 2);
assert.notEqual(sample(0.001), 0, "round announcement starts immediately");
assert.equal(sample(5), 0, "quiet gap remains silent");
assert.notEqual(sample(7.501), 0, "first cue arrives early");
assert.notEqual(sample(28.201), 0, "mid-round cue is separate");
assert.equal(sample(30), 0, "silence follows the cue");
assert.notEqual(sample(48.001), 0, "late-round cue is separate");
assert.notEqual(
  sample(60.001),
  0,
  "next round announcement starts at transition",
);

const threeMinuteRound = await buildWorkoutTimeline([
  {
    lengthMinutes: 3,
    transitionSrc: transition,
    transitionText: "Movement round",
    cues: [
      { src: cue, text: "Move with balance", at: 0.12 },
      { src: cue, text: "Check your stance", at: 0.47 },
      { src: cue, text: "Finish with guard", at: 0.8 },
    ],
  },
]);
assert.deepEqual(
  threeMinuteRound.captions.map(({ start }) => start),
  [0, 21.6, 84.6, 144],
  "a three-minute round has three spaced coaching moments",
);

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
try {
  const page = await browser.newPage();
  await page.route("**/workout.wav", (route) =>
    route.fulfill({ status: 200, contentType: "audio/wav", body: bytes }),
  );
  await page.route("**/player", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: '<button id="start">Start</button><audio id="workout"></audio><script>fetch("/workout.wav").then(r => r.blob()).then(b => { document.querySelector("#workout").src = URL.createObjectURL(b) }); document.querySelector("#start").onclick = () => document.querySelector("#workout").play()</script>',
    }),
  );
  await page.goto("https://shadowboxing.test/player");
  await page.waitForFunction(
    () => document.querySelector("audio").readyState >= 2,
  );
  await page.locator("#start").click();
  await page.waitForFunction(
    () => document.querySelector("audio").currentTime > 0.1,
  );
  const duration = await page
    .locator("audio")
    .evaluate((audio) => audio.duration);
  assert.ok(
    Math.abs(duration - 120) < 0.01,
    `expected 120 seconds, got ${duration}`,
  );
  await page.locator("audio").evaluate((audio) => audio.pause());
  const paused = await page
    .locator("audio")
    .evaluate((audio) => audio.currentTime);
  await page.waitForTimeout(400);
  const stillPaused = await page
    .locator("audio")
    .evaluate((audio) => audio.currentTime);
  assert.ok(Math.abs(stillPaused - paused) < 0.05, "pause holds position");
  await page.locator("audio").evaluate((audio) => {
    audio.currentTime = 59.5;
    return audio.play();
  });
  await page.waitForFunction(
    () => document.querySelector("audio").currentTime >= 59.5,
  );
  const other = await browser.newPage();
  await other.goto("about:blank");
  await other.bringToFront();
  await page.waitForTimeout(1600);
  const backgroundTime = await page
    .locator("audio")
    .evaluate((audio) => audio.currentTime);
  assert.ok(
    backgroundTime > 60.5,
    `background playback stopped at ${backgroundTime}`,
  );
  console.log(
    "Continuous WAV: speech pause compaction, cue timing, transitions, playback controls, and background-tab playback passed in desktop Chrome.",
  );
} finally {
  await browser.close();
}
