import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { googleSpeech, narrationText, segments } from "../scripts/generate-audio.mjs";

test("cleans QMD and splits narration without losing content", () => {
  const clean = narrationText("---\ntitle: Test\n---\n# Tytuł\n\nAkapit [z linkiem](https://example.com).\n");
  assert.equal(clean, "Tytuł\n\nAkapit z linkiem.");
  assert.deepEqual(segments("A".repeat(12), 5).map((part) => part.length), [5, 5, 2]);
});

test("Google Cloud TTS contract produces an MP3 file", async (t) => {
  const fixture = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=0.15", "-f", "mp3", "pipe:1"],
    { encoding: null },
  );
  assert.equal(fixture.status, 0, fixture.stderr?.toString());

  t.mock.method(globalThis, "fetch", async (url, request) => {
    const payload = JSON.parse(request.body);
    assert.equal(request.method, "POST");
    assert.equal(new URL(url).searchParams.get("key"), "test-key");
    assert.equal(payload.audioConfig.audioEncoding, "MP3");
    assert.equal(payload.voice.languageCode, "pl-PL");
    return Response.json({ audioContent: fixture.stdout.toString("base64") });
  });
  const audio = await googleSpeech("Próba syntezy", {
    apiKey: "test-key",
    endpoint: "https://texttospeech.googleapis.test/v1/text:synthesize",
  });
  assert.ok(audio.length > 100);
});
