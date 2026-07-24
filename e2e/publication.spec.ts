import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

type ReleaseManifest = {
  schema: string;
  version: string;
  files: Array<{
    file: string;
    bytes: number;
    sha256: string;
  }>;
};

const expectedManifest = JSON.parse(
  await readFile(new URL("../public/releases/manifest.json", import.meta.url), "utf8"),
) as ReleaseManifest;

const routes = [
  ["/", "Programista jako wąskie gardło"],
  ["/ksiazka", "Praktyczny system, nie zbiór promptów"],
  ["/dsl", "Intencja, którą"],
  ["/podcast", "Głos"],
  ["/manifest", "Dziesięć zasad"],
  ["/laboratorium", "Najpierw obserwuj."],
] as const;

test("publiczne strony renderują się bez błędów przeglądarki", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    const text = message.text();
    const expectedUnauthorizedRequest =
      message.type() === "error" && /status of 401 \(Unauthorized\)/.test(text);
    if (message.type() === "error" && !expectedUnauthorizedRequest) runtimeErrors.push(text);
  });

  for (const [path, heading] of routes) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { name: new RegExp(heading, "i") }).first()).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  }

  expect(runtimeErrors).toEqual([]);
});

test("nawigacja prowadzi do książki, DSL i podcastu", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("navigation", { name: "Główna nawigacja" }).getByRole("link", { name: "Książka" }).click();
  await expect(page).toHaveURL(/\/ksiazka$/);
  await expect(page.getByRole("link", { name: "Pobierz PDF" }).first()).toBeVisible();

  await page.getByRole("navigation", { name: "Główna nawigacja" }).getByRole("link", { name: "DSL" }).click();
  await expect(page).toHaveURL(/\/dsl$/);
  await expect(page.getByText("workcell.yaml")).toBeVisible();

  await page.getByRole("navigation", { name: "Główna nawigacja" }).getByRole("link", { name: "Podcast" }).click();
  await expect(page).toHaveURL(/\/podcast$/);
  await expect(page.locator("audio")).toHaveAttribute(
    "src",
    "/releases/retrospektywa-audiobook-preview-0.2.mp3",
  );
});

test("manifest i wszystkie artefakty wydania zgadzają się bajt po bajcie", async ({ request }) => {
  const manifestResponse = await request.get("/releases/manifest.json");
  expect(manifestResponse.status()).toBe(200);
  expect(manifestResponse.headers()["content-type"]).toContain("application/json");

  const publishedManifest = (await manifestResponse.json()) as ReleaseManifest;
  expect(publishedManifest).toEqual(expectedManifest);
  expect(publishedManifest.files).toHaveLength(5);

  for (const artifact of publishedManifest.files) {
    const response = await request.get(`/releases/${artifact.file}`);
    expect(response.status(), artifact.file).toBe(200);
    const body = await response.body();
    expect(body.byteLength, artifact.file).toBe(artifact.bytes);
    expect(createHash("sha256").update(body).digest("hex"), artifact.file).toBe(artifact.sha256);
  }
});

test("API chroni prywatny rejestr bez wykonywania zapisu", async ({ request }) => {
  const readResponse = await request.get("/api/events");
  expect(readResponse.status()).toBe(401);
  expect(await readResponse.json()).toEqual({ error: "Wymagane logowanie." });

  const writeResponse = await request.post("/api/events", {
    data: {
      project: "docker-e2e",
      activity: "próba bez uwierzytelnienia",
      actor: "ai",
      outcome: "pending",
      capability: "testing",
    },
  });
  expect(writeResponse.status()).toBe(401);
  expect(await writeResponse.json()).toEqual({ error: "Wymagane logowanie." });
});
