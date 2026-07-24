import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { copyFile, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function narrationText(raw) {
  return raw
    .replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "")
    .replace(/```\{?mermaid\}?[\s\S]*?```/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)(?:\{[^}]*\})?/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*\|.*\|\s*$/gm, "")
    .replace(/[#>*_`[\]]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function segments(value, limit = 3400) {
  const result = [];
  let current = "";
  for (const paragraph of value.split(/\n\n+/).map((part) => part.trim()).filter(Boolean)) {
    const pieces = [];
    let remainder = paragraph;
    while (remainder.length > limit) {
      const window = remainder.slice(0, limit + 1);
      const breakAt = window.lastIndexOf(" ");
      const end = breakAt > Math.floor(limit * 0.6) ? breakAt : limit;
      pieces.push(remainder.slice(0, end).trim());
      remainder = remainder.slice(end).trimStart();
    }
    if (remainder) pieces.push(remainder);
    for (const piece of pieces) {
      const candidate = current ? `${current}\n\n${piece}` : piece;
      if (candidate.length <= limit) {
        current = candidate;
      } else {
        if (current) result.push(current);
        current = piece;
      }
    }
  }
  if (current) result.push(current);
  return result;
}

async function responseBuffer(response, label) {
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1200);
    throw new Error(`${label}: ${response.status} ${detail}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function openAiSpeech(input, config = {}) {
  const key = config.apiKey ?? process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Brak OPENAI_API_KEY.");
  const response = await fetch(config.endpoint ?? "https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: config.model ?? process.env.OPENAI_AUDIO_MODEL ?? "gpt-4o-mini-tts",
      voice: config.voice ?? process.env.OPENAI_AUDIO_VOICE ?? "marin",
      input,
      instructions:
        config.instructions ??
        process.env.OPENAI_AUDIO_INSTRUCTIONS ??
        "Mów po polsku spokojnym, precyzyjnym głosem narratora technologicznego.",
      response_format: "mp3",
    }),
  });
  return responseBuffer(response, "OpenAI Audio");
}

export async function elevenLabsSpeech(input, config = {}) {
  const key = config.apiKey ?? process.env.ELEVENLABS_API_KEY;
  const voice = config.voice ?? process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) throw new Error("Brak ELEVENLABS_API_KEY lub ELEVENLABS_VOICE_ID.");
  const endpoint = config.endpoint ??
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({
      text: input,
      model_id: config.model ?? process.env.ELEVENLABS_AUDIO_MODEL ?? "eleven_multilingual_v2",
    }),
  });
  return responseBuffer(response, "ElevenLabs");
}

export async function googleSpeech(input, config = {}) {
  const apiKey = config.apiKey ?? process.env.GOOGLE_TTS_API_KEY ?? process.env.GOOGLE_API_KEY;
  const accessToken = config.accessToken ?? process.env.GOOGLE_TTS_ACCESS_TOKEN;
  if (!apiKey && !accessToken) {
    throw new Error("Brak GOOGLE_TTS_API_KEY/GOOGLE_API_KEY lub GOOGLE_TTS_ACCESS_TOKEN.");
  }

  const endpoint = new URL(
    config.endpoint ??
    process.env.GOOGLE_TTS_ENDPOINT ??
    "https://texttospeech.googleapis.com/v1/text:synthesize",
  );
  if (apiKey) endpoint.searchParams.set("key", apiKey);
  const headers = { "content-type": "application/json" };
  if (accessToken) headers.authorization = `Bearer ${accessToken}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      input: { text: input },
      voice: {
        languageCode: config.languageCode ?? process.env.GOOGLE_TTS_LANGUAGE ?? "pl-PL",
        name: config.voice ?? process.env.GOOGLE_TTS_VOICE ?? "pl-PL-Standard-F",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: Number(config.speakingRate ?? process.env.GOOGLE_TTS_SPEAKING_RATE ?? 1),
      },
    }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 1200);
    throw new Error(`Google Cloud TTS: ${response.status} ${detail}`);
  }
  const body = await response.json();
  if (typeof body.audioContent !== "string" || !body.audioContent) {
    throw new Error("Google Cloud TTS: odpowiedź nie zawiera audioContent.");
  }
  return Buffer.from(body.audioContent, "base64");
}

function spawned(command, args, input) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise(Buffer.concat(stdout));
      else reject(new Error(`${command} zakończył się kodem ${code}: ${Buffer.concat(stderr).toString("utf8")}`));
    });
    child.stdin.end(input);
  });
}

export async function espeakSpeech(input, config = {}) {
  const voice = config.voice ?? process.env.ESPEAK_AUDIO_VOICE ?? "pl";
  const rate = String(config.rate ?? process.env.ESPEAK_AUDIO_RATE ?? "155");
  const wav = await spawned("espeak-ng", ["-v", voice, "-s", rate, "--stdout"], input);
  return spawned(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-f", "wav", "-i", "pipe:0", "-codec:a", "libmp3lame", "-b:a", "64k", "-f", "mp3", "pipe:1"],
    wav,
  );
}

async function combineSegments(outputDir, files) {
  const combined = join(outputDir, "audiobook.mp3");
  if (files.length === 1) {
    await copyFile(join(outputDir, files[0].file), combined);
    return basename(combined);
  }
  const listPath = join(outputDir, ".concat.txt");
  await writeFile(listPath, files.map(({ file }) => `file '${file}'`).join("\n"));
  try {
    await spawned(
      "ffmpeg",
      ["-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", combined],
      Buffer.alloc(0),
    );
  } finally {
    await unlink(listPath).catch(() => {});
  }
  return basename(combined);
}

export async function generateAudio({ inputPath, outputDir, provider }) {
  const raw = await readFile(inputPath, "utf8");
  const text = narrationText(raw);
  if (!text) throw new Error("Źródło nie zawiera tekstu narracji.");
  const chunks = segments(text);
  const speech = {
    openai: openAiSpeech,
    elevenlabs: elevenLabsSpeech,
    google: googleSpeech,
    espeak: espeakSpeech,
  }[provider];
  if (!speech) throw new Error("AUDIO_PROVIDER musi mieć wartość openai, elevenlabs, google albo espeak.");

  await mkdir(outputDir, { recursive: true });
  const files = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const file = `segment-${String(index + 1).padStart(3, "0")}.mp3`;
    const audio = await speech(chunks[index]);
    await writeFile(join(outputDir, file), audio);
    files.push({
      file,
      characters: chunks[index].length,
      bytes: audio.length,
      sha256: createHash("sha256").update(audio).digest("hex"),
    });
    console.log(`${index + 1}/${chunks.length} ${file}`);
  }

  const combined = await combineSegments(outputDir, files);
  const combinedAudio = await readFile(join(outputDir, combined));
  const manifest = {
    schema: "retrospektywa.audio/v1",
    source: basename(inputPath),
    sourceSha256: createHash("sha256").update(raw).digest("hex"),
    provider,
    generatedAt: new Date().toISOString(),
    combined: {
      file: combined,
      bytes: combinedAudio.length,
      sha256: createHash("sha256").update(combinedAudio).digest("hex"),
    },
    segments: files,
    disclosure: "Głos wygenerowany syntetycznie.",
  };
  await writeFile(join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

async function main() {
  const [, , inputArg, outputArg] = process.argv;
  if (!inputArg || !outputArg) {
    console.error("Użycie: npm run audio:generate -- <input.qmd> <output-directory>");
    process.exit(1);
  }
  await generateAudio({
    inputPath: resolve(inputArg),
    outputDir: resolve(outputArg),
    provider: process.env.AUDIO_PROVIDER ?? "openai",
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
