import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("landing routes expose the book, audio and examples", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `routes-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const binding = {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };
  const execution = {
    waitUntil() {},
    passThroughOnException() {},
  };

  for (const [path, patterns] of [
    ["/", [/Czytaj książkę/, /cybernetycznym WorkCell/, /retrospektywa-process-pack-0\.2\.zip/]],
    ["/ksiazka", [/WYDANIE 0\.2/, /Cybernetyczny WorkCell/, /retrospektywa-0\.2\.pdf/]],
    ["/podcast", [/Google Cloud/, /audiobook-preview-0\.2\.mp3/]],
  ]) {
    const response = await worker.fetch(
      new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
      binding,
      execution,
    );
    assert.equal(response.status, 200, path);
    const html = await response.text();
    for (const pattern of patterns) assert.match(html, pattern, path);
  }

  for (const file of [
    "retrospektywa-0.2.pdf",
    "retrospektywa-audiobook-preview-0.2.mp3",
    "retrospektywa-process-pack-0.2.zip",
  ]) {
    assert.ok(
      (await stat(new URL(`../dist/client/releases/${file}`, import.meta.url))).size > 0,
      file,
    );
  }
});
