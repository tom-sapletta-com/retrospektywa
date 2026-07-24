import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { googleSpeech } from "./generate-audio.mjs";

const hasCredentials = Boolean(
  process.env.GOOGLE_TTS_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_TTS_ACCESS_TOKEN,
);

if (!hasCredentials) {
  console.log("Google Cloud TTS live test: SKIPPED (brak credentials). Uruchamiam test kontraktu w npm test.");
  process.exit(0);
}

const output = resolve(process.argv[2] ?? "outputs/google-tts-live-test.mp3");
const audio = await googleSpeech(
  "To jest krótki test syntezy mowy dla projektu Retrospektywa.",
);
await mkdir(resolve(output, ".."), { recursive: true });
await writeFile(output, audio);
const probe = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration,format_name", "-of", "json", output],
  { encoding: "utf8" },
);
if (probe.status !== 0) throw new Error(probe.stderr);
console.log(`Google Cloud TTS live test: PASS ${output} ${probe.stdout.trim()}`);
