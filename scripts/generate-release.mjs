import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { stageRelease } from "./stage-release.mjs";

const root = resolve(import.meta.dirname, "..");
const bookOutput = join(root, "book", "_book");
const publicOutput = join(root, "public", "releases");
const quartoCache = join(root, ".quarto-cache");
const version = "0.2";

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        XDG_CACHE_HOME: process.env.XDG_CACHE_HOME ?? quartoCache,
        QUARTO_CACHE_DIR: process.env.QUARTO_CACHE_DIR ?? quartoCache,
      },
      ...options,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} zakończył się kodem ${code}`));
    });
  });
}

async function sha256(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function findBookFormat(extension) {
  const candidates = (await readdir(bookOutput))
    .filter((name) => name.toLowerCase().endsWith(`.${extension}`))
    .sort();
  if (candidates.length !== 1) {
    throw new Error(`Oczekiwano jednego pliku .${extension}, znaleziono: ${candidates.join(", ") || "0"}`);
  }
  return join(bookOutput, candidates[0]);
}

async function copyRelease(source, targetName) {
  const target = join(publicOutput, targetName);
  await copyFile(source, target);
  return targetName;
}

async function main() {
  await mkdir(quartoCache, { recursive: true });
  if (!process.argv.includes("--skip-render")) {
    await run("quarto", ["render", "book"]);
  }

  await rm(publicOutput, { recursive: true, force: true });
  await mkdir(publicOutput, { recursive: true });

  const releaseFiles = [];
  for (const extension of ["pdf", "epub", "docx"]) {
    releaseFiles.push(
      await copyRelease(
        await findBookFormat(extension),
        `retrospektywa-${version}.${extension}`,
      ),
    );
  }

  const audioSource = join(root, "outputs", "audio-preview", "audiobook.mp3");
  releaseFiles.push(
    await copyRelease(audioSource, `retrospektywa-audiobook-preview-${version}.mp3`),
  );

  const packName = `retrospektywa-process-pack-${version}.zip`;
  await run("zip", [
    "-q",
    "-r",
    join(publicOutput, packName),
    "dsl/README.md",
    "dsl/schema",
    "dsl/examples",
  ]);
  releaseFiles.push(packName);

  const files = [];
  for (const file of releaseFiles) {
    const path = join(publicOutput, file);
    files.push({
      file,
      bytes: (await stat(path)).size,
      sha256: await sha256(path),
    });
  }
  const manifest = {
    schema: "retrospektywa.release/v1",
    version,
    generatedAt: new Date().toISOString(),
    source: "book + dsl + content/podcast",
    files,
  };
  await writeFile(
    join(publicOutput, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  await stageRelease(root);
  console.log(`Wydanie ${version}: ${releaseFiles.length} plików + manifest`);
}

await main();
