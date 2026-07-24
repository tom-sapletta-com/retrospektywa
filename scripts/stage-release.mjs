import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const defaultRoot = resolve(import.meta.dirname, "..");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export async function stageRelease(root = defaultRoot) {
  const releases = join(root, "public", "releases");
  const bookOutput = join(root, "book", "_book");
  const downloads = join(bookOutput, "downloads");
  const manifest = JSON.parse(await readFile(join(releases, "manifest.json"), "utf8"));

  await rm(downloads, { recursive: true, force: true });
  await mkdir(downloads, { recursive: true });

  for (const item of manifest.files) {
    const source = join(releases, item.file);
    const data = await readFile(source);
    if (data.length !== item.bytes || sha256(data) !== item.sha256) {
      throw new Error(`${item.file}: plik nie zgadza się z manifestem wydania`);
    }
    await copyFile(source, join(downloads, item.file));
  }
  await copyFile(join(releases, "manifest.json"), join(downloads, "manifest.json"));

  const canonical = {
    "retrospektywa-0.2.pdf": "Retrospektywa.pdf",
    "retrospektywa-0.2.epub": "Retrospektywa.epub",
    "retrospektywa-0.2.docx": "Retrospektywa.docx",
  };
  for (const [source, target] of Object.entries(canonical)) {
    await copyFile(join(releases, source), join(bookOutput, target));
  }

  const bytes = (await Promise.all(
    manifest.files.map(({ file }) => stat(join(releases, file))),
  )).reduce((total, entry) => total + entry.size, 0);
  console.log(`Wystawiono ${manifest.files.length} artefaktów wydania ${manifest.version} (${bytes} B).`);
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await stageRelease();
}
