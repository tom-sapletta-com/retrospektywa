import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const releases = join(root, "public", "releases");
const required = [
  "retrospektywa-0.2.pdf",
  "retrospektywa-0.2.epub",
  "retrospektywa-0.2.docx",
  "retrospektywa-audiobook-preview-0.2.mp3",
  "retrospektywa-process-pack-0.2.zip",
  "manifest.json",
];

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} zakończył się kodem ${code}`));
    });
  });
}

for (const file of required) {
  assert.ok((await stat(join(releases, file))).size > 0, `${file} jest pusty`);
}

const manifest = JSON.parse(await readFile(join(releases, "manifest.json"), "utf8"));
assert.deepEqual(
  manifest.files.map(({ file }) => file).sort(),
  required.filter((file) => file !== "manifest.json").sort(),
);
for (const item of manifest.files) {
  const data = await readFile(join(releases, item.file));
  assert.equal(data.length, item.bytes, `${item.file}: rozmiar nie zgadza się z manifestem`);
  assert.equal(
    createHash("sha256").update(data).digest("hex"),
    item.sha256,
    `${item.file}: SHA-256 nie zgadza się z manifestem`,
  );
}

assert.equal((await readFile(join(releases, required[0]))).subarray(0, 4).toString(), "%PDF");
for (const file of [required[1], required[2], required[4]]) {
  assert.equal(
    (await readFile(join(releases, file))).subarray(0, 2).toString(),
    "PK",
    `${file} nie jest archiwum ZIP`,
  );
}
await run("ffprobe", [
  "-v",
  "error",
  "-select_streams",
  "a:0",
  "-show_entries",
  "stream=codec_name,duration",
  "-of",
  "default=noprint_wrappers=1",
  join(releases, required[3]),
]);

const html = await readFile(join(root, "book", "_book", "index.html"), "utf8");
assert.match(html, /SOA.*POA.*URI Process/s);
assert.match(html, /Cybernetyczny WorkCell/);
assert.match(html, /downloads\/retrospektywa-0\.2\.pdf/);
for (const [releaseFile, canonicalFile] of [
  ["retrospektywa-0.2.pdf", "Retrospektywa.pdf"],
  ["retrospektywa-0.2.epub", "Retrospektywa.epub"],
  ["retrospektywa-0.2.docx", "Retrospektywa.docx"],
]) {
  assert.deepEqual(
    await readFile(join(releases, releaseFile)),
    await readFile(join(root, "book", "_book", canonicalFile)),
    `${canonicalFile}: Quarto powinno udostępniać zatwierdzony plik wydania`,
  );
}
console.log(`release ok: ${required.length} artefaktów`);
