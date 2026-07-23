import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { workEvents } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

const actors = new Set(["human", "ai", "pair"]);
const outcomes = new Set(["accepted", "rework", "rejected", "pending"]);
const capabilities = new Set([
  "implementation",
  "review",
  "testing",
  "research",
  "documentation",
  "decision",
]);

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asNumber(value: unknown, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min;
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Nieznany błąd";
  if (message.includes("no such table") || message.includes("work_events")) {
    return "Rejestr czeka na migrację bazy danych.";
  }
  return "Nie udało się obsłużyć rejestru zdarzeń.";
}

function calculateMetrics(rows: Array<typeof workEvents.$inferSelect>) {
  const finished = rows.filter((row) => row.outcome !== "pending");
  const accepted = finished.filter((row) => row.outcome === "accepted").length;
  const scored = rows.filter((row) => row.qualityScore !== null);
  const acceptanceRate = finished.length ? accepted / finished.length : 0;
  const averageQuality = scored.length
    ? scored.reduce((sum, row) => sum + (row.qualityScore ?? 0), 0) / scored.length
    : 0;
  const humanMinutes = rows
    .filter((row) => row.actor !== "ai")
    .reduce((sum, row) => sum + row.durationMinutes, 0);
  const aiMinutes = rows
    .filter((row) => row.actor !== "human")
    .reduce((sum, row) => sum + row.durationMinutes, 0);
  const totalCostCents = rows.reduce((sum, row) => sum + row.costCents, 0);

  let autonomyLevel = 0;
  let nextLevelNeeds = "Zarejestruj pierwsze pięć zdarzeń.";
  if (rows.length >= 5) {
    autonomyLevel = 1;
    nextLevelNeeds = "Zbierz 20 wyników z akceptacją ≥ 90% i jakością ≥ 4,0.";
  }
  if (rows.length >= 20 && acceptanceRate >= 0.9 && averageQuality >= 4) {
    autonomyLevel = 2;
    nextLevelNeeds = "Zbierz 50 wyników, utrzymując akceptację ≥ 95%.";
  }
  if (rows.length >= 50 && acceptanceRate >= 0.95 && averageQuality >= 4.25) {
    autonomyLevel = 3;
    nextLevelNeeds = "Potwierdź 100 powtórzeń bez incydentu krytycznego.";
  }
  if (rows.length >= 100 && acceptanceRate >= 0.97 && averageQuality >= 4.5) {
    autonomyLevel = 4;
    nextLevelNeeds = "Optymalizuj koszt i czas bez obniżania jakości.";
  }

  return {
    totalEvents: rows.length,
    acceptedEvents: accepted,
    acceptanceRate,
    averageQuality,
    humanMinutes,
    aiMinutes,
    totalCostCents,
    autonomyLevel,
    nextLevelNeeds,
  };
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Wymagane logowanie." }, { status: 401 });

  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(workEvents)
      .where(and(eq(workEvents.ownerEmail, user.email), eq(workEvents.isDeleted, false)))
      .orderBy(desc(workEvents.occurredAt), desc(workEvents.id))
      .limit(200);
    return Response.json({ events: rows.slice(0, 40), metrics: calculateMetrics(rows) });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Wymagane logowanie." }, { status: 401 });

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const project = cleanText(payload.project, 80);
    const activity = cleanText(payload.activity, 120);
    const actor = cleanText(payload.actor, 10);
    const outcome = cleanText(payload.outcome, 12);
    const capability = cleanText(payload.capability, 32);
    if (!project || !activity) {
      return Response.json({ error: "Projekt i czynność są wymagane." }, { status: 400 });
    }
    if (!actors.has(actor) || !outcomes.has(outcome) || !capabilities.has(capability)) {
      return Response.json({ error: "Nieprawidłowy typ zdarzenia." }, { status: 400 });
    }

    const db = await getDb();
    const [saved] = await db
      .insert(workEvents)
      .values({
        ownerEmail: user.email,
        project,
        activity,
        actor: actor as "human" | "ai" | "pair",
        outcome: outcome as "accepted" | "rework" | "rejected" | "pending",
        capability,
        durationMinutes: Math.round(asNumber(payload.durationMinutes, 1, 1440)),
        qualityScore: Math.round(asNumber(payload.qualityScore, 1, 5)),
        costCents: Math.round(asNumber(payload.costPln, 0, 10000) * 100),
      })
      .returning();
    return Response.json({ event: saved }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
