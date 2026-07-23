"use client";

import { FormEvent, useEffect, useState } from "react";

type WorkEvent = {
  id: number;
  occurredAt: string;
  project: string;
  activity: string;
  actor: "human" | "ai" | "pair";
  capability: string;
  outcome: "accepted" | "rework" | "rejected" | "pending";
  durationMinutes: number;
  qualityScore: number | null;
  costCents: number;
};

type TwinMetrics = {
  totalEvents: number;
  acceptedEvents: number;
  acceptanceRate: number;
  averageQuality: number;
  humanMinutes: number;
  aiMinutes: number;
  totalCostCents: number;
  autonomyLevel: number;
  nextLevelNeeds: string;
};

const EMPTY_METRICS: TwinMetrics = {
  totalEvents: 0,
  acceptedEvents: 0,
  acceptanceRate: 0,
  averageQuality: 0,
  humanMinutes: 0,
  aiMinutes: 0,
  totalCostCents: 0,
  autonomyLevel: 0,
  nextLevelNeeds: "Zarejestruj pierwsze pięć zdarzeń.",
};

const actorLabels = { human: "Człowiek", ai: "AI", pair: "Para człowiek + AI" };
const outcomeLabels = {
  accepted: "zaakceptowane",
  rework: "poprawki",
  rejected: "odrzucone",
  pending: "oczekuje",
};

async function fetchEventData() {
  const response = await fetch("/api/events", { cache: "no-store" });
  if (!response.ok) throw new Error("Nie udało się odczytać rejestru.");
  return (await response.json()) as { events: WorkEvent[]; metrics: TwinMetrics };
}

export function EventLab() {
  const [events, setEvents] = useState<WorkEvent[]>([]);
  const [metrics, setMetrics] = useState<TwinMetrics>(EMPTY_METRICS);
  const [state, setState] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetchEventData()
      .then((data) => {
        if (!active) return;
        setEvents(data.events);
        setMetrics(data.metrics);
        setState("ready");
      })
      .catch(() => {
        if (!active) return;
        setState("error");
        setMessage("Rejestr będzie dostępny po zalogowaniu i uruchomieniu bazy projektu.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać zdarzenia.");
      event.currentTarget.reset();
      setMessage("Zdarzenie zapisane. Profil twina został przeliczony.");
      const refreshed = await fetchEventData();
      setEvents(refreshed.events);
      setMetrics(refreshed.metrics);
      setState("ready");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Nie udało się zapisać zdarzenia.");
    }
  }

  return (
    <div className="lab-grid">
      <section className="event-panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">SODL / wpis zdarzenia</p>
            <h2>Co właśnie się wydarzyło?</h2>
          </div>
          <span className="privacy-chip">metadane, bez kodu i promptów</span>
        </div>

        <form className="event-form" onSubmit={submit}>
          <label>
            Projekt
            <input name="project" required maxLength={80} placeholder="np. retrospektywa.pl" />
          </label>
          <label>
            Czynność
            <input name="activity" required maxLength={120} placeholder="np. review zmiany API" />
          </label>
          <label>
            Wykonawca
            <select name="actor" defaultValue="ai">
              <option value="human">Człowiek</option>
              <option value="ai">AI</option>
              <option value="pair">Para człowiek + AI</option>
            </select>
          </label>
          <label>
            Capability
            <select name="capability" defaultValue="implementation">
              <option value="implementation">Implementacja</option>
              <option value="review">Niezależny review</option>
              <option value="testing">Testowanie</option>
              <option value="research">Research</option>
              <option value="documentation">Dokumentacja</option>
              <option value="decision">Decyzja człowieka</option>
            </select>
          </label>
          <label>
            Wynik
            <select name="outcome" defaultValue="accepted">
              <option value="accepted">Zaakceptowane</option>
              <option value="rework">Wymaga poprawek</option>
              <option value="rejected">Odrzucone</option>
              <option value="pending">Oczekuje</option>
            </select>
          </label>
          <label>
            Czas (min)
            <input name="durationMinutes" type="number" required min="1" max="1440" defaultValue="20" />
          </label>
          <label>
            Jakość 1–5
            <input name="qualityScore" type="number" min="1" max="5" defaultValue="4" />
          </label>
          <label>
            Koszt (PLN)
            <input name="costPln" type="number" min="0" max="10000" step="0.01" defaultValue="0" />
          </label>
          <button className="button button-primary submit-event" disabled={state === "saving"}>
            {state === "saving" ? "Zapisuję…" : "Zapisz zdarzenie"}
          </button>
          <p className={`form-message ${state === "error" ? "error" : ""}`} aria-live="polite">
            {message}
          </p>
        </form>
      </section>

      <aside className="twin-panel">
        <div className="panel-head">
          <div>
            <p className="section-kicker">DOQL / sytuacja</p>
            <h2>Twój digital twin</h2>
          </div>
          <span className="level-badge">L{metrics.autonomyLevel}</span>
        </div>
        <div className="metrics-grid">
          <article><span>Zdarzenia</span><b>{metrics.totalEvents}</b></article>
          <article><span>Akceptacja</span><b>{Math.round(metrics.acceptanceRate * 100)}%</b></article>
          <article><span>Śr. jakość</span><b>{metrics.averageQuality.toFixed(1)}</b></article>
          <article><span>Koszt</span><b>{(metrics.totalCostCents / 100).toFixed(2)} zł</b></article>
          <article><span>Czas człowieka</span><b>{metrics.humanMinutes} min</b></article>
          <article><span>Czas AI</span><b>{metrics.aiMinutes} min</b></article>
        </div>
        <div className="evidence-box">
          <span>Następny poziom</span>
          <p>{metrics.nextLevelNeeds}</p>
        </div>
        <div className="autonomy-meter" aria-label={`Poziom autonomii ${metrics.autonomyLevel} z 4`}>
          {[0, 1, 2, 3, 4].map((level) => (
            <i className={level <= metrics.autonomyLevel ? "filled" : ""} key={level} />
          ))}
        </div>
      </aside>

      <section className="event-log">
        <div className="panel-head">
          <div>
            <p className="section-kicker">Rejestr dowodów</p>
            <h2>Ostatnie zdarzenia</h2>
          </div>
          <span>{events.length} wpisów</span>
        </div>
        {events.length === 0 ? (
          <div className="empty-state">
            <b>Brak zdarzeń.</b>
            <p>Zacznij od jednej powtarzalnej czynności i zapisuj wyłącznie metadane procesu.</p>
          </div>
        ) : (
          <div className="log-table">
            {events.map((item) => (
              <article key={item.id}>
                <time>{new Date(item.occurredAt).toLocaleDateString("pl-PL")}</time>
                <div><b>{item.activity}</b><span>{item.project} · {item.capability}</span></div>
                <span>{actorLabels[item.actor]}</span>
                <span className={`outcome ${item.outcome}`}>{outcomeLabels[item.outcome]}</span>
                <b>{item.durationMinutes} min</b>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
