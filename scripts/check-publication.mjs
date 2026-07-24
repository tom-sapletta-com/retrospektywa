import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const siteBase = (process.env.SITE_BASE ?? "https://retrospektywa.softreck.chatgpt.site").replace(/\/$/, "");
const bookBase = (process.env.BOOK_BASE ?? "https://tom-sapletta-com.github.io/retrospektywa").replace(/\/$/, "");
const expectedManifestPath =
  process.env.EXPECTED_MANIFEST_PATH ??
  join(root, "public", "releases", "manifest.json");
const expectedManifest = JSON.parse(await readFile(expectedManifestPath, "utf8"));

function parseBoolean(value, fallback = false) {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

const checkSites = parseBoolean(process.env.CHECK_SITES, false);
const compareManifest = parseBoolean(process.env.CHECK_PUBLICATION_MANIFEST, true);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function get(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "retrospektywa-publication-audit/1.0" },
  });
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  return response;
}

async function retry(label, operation, attempts = 12) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolvePromise) => setTimeout(resolvePromise, 5000));
    }
  }
  throw new Error(`${label}: ${lastError.message}`);
}

async function assertHtml(url, patterns) {
  const response = await get(url);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, url);
  const html = await response.text();
  for (const pattern of patterns) assert.match(html, pattern, url);
}

async function assertChannel(name, base) {
  const manifestResponse = await get(`${base}/manifest.json`);
  const manifest = await manifestResponse.json();
  if (compareManifest) {
    assert.deepEqual(manifest, expectedManifest, `${name}: opublikowano inny manifest`);
  }

  for (const item of manifest.files) {
    const response = await get(`${base}/${item.file}`);
    const data = Buffer.from(await response.arrayBuffer());
    assert.equal(data.length, item.bytes, `${name}/${item.file}: rozmiar`);
    assert.equal(sha256(data), item.sha256, `${name}/${item.file}: SHA-256`);
  }
  console.log(`${name}: PASS (${manifest.files.length} artefaktów)`);
}

await retry("landing page", () =>
  assertHtml(siteBase, [/Czytaj książkę/, /Posłuchaj audiobooka/, /cybernetycznym WorkCell/, /Docker E2E/, /retrospektywa-process-pack-0\.2\.zip/]),
);
await retry("strona książki", () =>
  assertHtml(bookBase, [/SOA, POA i URI Process/, /Forma współpracy, authority i dowód pracy/, /Cybernetyczny WorkCell/]),
);
await retry("artefakty GitHub Pages", () => assertChannel("GitHub Pages", `${bookBase}/downloads`));
if (checkSites) {
  await retry("artefakty Sites", () => assertChannel("Sites", `${siteBase}/releases`));
}

if (checkSites && compareManifest) {
  console.log("publication ok: landing, książka, GitHub Pages i Sites mają identyczne artefakty");
} else if (checkSites) {
  console.log("publication ok: landing, książka i oba kanały działają (manifesty lokalnie nieporównywane)");
} else {
  console.log("publication ok: landing, książka i GitHub Pages działają");
}
