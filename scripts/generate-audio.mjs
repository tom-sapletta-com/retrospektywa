import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error("Użycie: npm run audio:generate -- <input.qmd> <output-directory>");
  process.exit(1);
}

const provider = process.env.AUDIO_PROVIDER ?? "openai";
const inputPath = resolve(inputArg);
const outputDir = resolve(outputArg);
const raw = await readFile(inputPath, "utf8");
const text = raw
  .replace(/^---[\s\S]*?---/m, "")
  .replace(/```[\s\S]*?```/g, "")
  .replace(/[#>*_`[\]]/g, "")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

function segments(value, limit = 3400) {
  const parts = value.split(/\n\n+/);
  const result = [];
  let current = "";
  for (const part of parts) {
    if (!part.trim()) continue;
    if ((current + "\n\n" + part).length <= limit) {
      current = current ? `${current}\n\n${part}` : part;
      continue;
    }
    if (current) result.push(current);
    current = part;
  }
  if (current) result.push(current);
  return result;
}

async function openAiSpeech(input) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Brak OPENAI_API_KEY.");
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_AUDIO_MODEL ?? "gpt-4o-mini-tts",
      voice: process.env.OPENAI_AUDIO_VOICE ?? "marin",
      input,
      instructions:
        process.env.OPENAI_AUDIO_INSTRUCTIONS ??
        "Mów po polsku spokojnym, precyzyjnym głosem narratora technologicznego.",
      response_format: "mp3",
    }),
  });
  if (!response.ok) throw new Error(`OpenAI Audio: ${response.status} ${await response.text()}`);
  return Buffer.from(await response.arrayBuffer());
}

async function elevenLabsSpeech(input) {
  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) throw new Error("Brak ELEVENLABS_API_KEY lub ELEVENLABS_VOICE_ID.");
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        text: input,
        model_id: process.env.ELEVENLABS_AUDIO_MODEL ?? "eleven_multilingual_v2",
      }),
    },
  );
  if (!response.ok) throw new Error(`ElevenLabs: ${response.status} ${await response.text()}`);
  return Buffer.from(await response.arrayBuffer());
}

if (!["openai", "elevenlabs"].includes(provider)) {
  throw new Error("AUDIO_PROVIDER musi mieć wartość openai albo elevenlabs.");
}

await mkdir(outputDir, { recursive: true });
const chunks = segments(text);
const files = [];
for (let index = 0; index < chunks.length; index += 1) {
  const file = `segment-${String(index + 1).padStart(3, "0")}.mp3`;
  const audio = provider === "openai"
    ? await openAiSpeech(chunks[index])
    : await elevenLabsSpeech(chunks[index]);
  await writeFile(join(outputDir, file), audio);
  files.push({ file, characters: chunks[index].length });
  console.log(`${index + 1}/${chunks.length} ${file}`);
}

await writeFile(
  join(outputDir, "manifest.json"),
  JSON.stringify(
    {
      source: basename(inputPath),
      provider,
      generatedAt: new Date().toISOString(),
      segments: files,
      disclosure: "Głos wygenerowany syntetycznie.",
    },
    null,
    2,
  ),
);
