import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "DSL w praktyce",
  description:
    "Jak formalizować intencje, walidować je i rozwijać w ewolucyjnej pętli.",
};

const gains = [
  ["01", "Krótszy opis", "Usuwamy powtórzenia i zostawiamy decyzje, granice oraz dowody."],
  ["02", "Walidacja", "Schemat sprawdza kompletność przed uruchomieniem procesu."],
  ["03", "Wersjonowanie", "Zmiana reguły staje się małym, czytelnym diffem."],
  ["04", "Wdrożenie", "Ten sam kontrakt może zasilać router, test i dokumentację."],
  ["05", "Prototyp", "Można uruchomić wąski przypadek bez budowania całego systemu."],
  ["06", "Ewolucja", "Receipt i metryki wskazują następną zmianę zamiast kolejnej opinii."],
];

const loop = [
  ["1", "Intencja", "Co ma się zmienić i po czym poznamy sukces?"],
  ["2", "Kontrakt", "Granice, role, preconditions i oczekiwany dowód."],
  ["3", "Walidacja", "Schemat, AQL, URI, EQL i test gotowości."],
  ["4", "Prototyp", "Najmniejszy bezpieczny przebieg na realnym przypadku."],
  ["5", "Receipt", "Co naprawdę wykonano, ile to trwało i jaki był wynik?"],
  ["6", "Retrospektywa", "Jedna mierzalna zmiana trafia do następnej wersji."],
];

const intentDsl = `intent:
  goal: route_ticket
  portrait: read_only
  authority: inherited_only

  requires:
    aql_coverage: true
    uri_resolvable: true
    eql_handoff: green

  on_false_ready:
    state: waiting_input
    gate_code: required
    retry_unchanged: false`;

const chainDsl = `VERSION: 1

FLOW ticket_execution_chain:
  STEP portrait doql.snapshot "actor"
    EXPECT autonomy_enabled == false

  STEP route process.select "candidate"
    EXPECT aql_covered == true
    EXPECT uri_resolvable == true

  STEP execute process.run "ticket"
    SAVE terminal_receipt

  STEP handoff process.next "ticket"
    WITH receipt = "$state.terminal_receipt"
    EXPECT eql_handoff == green`;

const readinessDsl = `SUITE routing_readiness:
  TEST portrait "Portret nie nadaje praw":
    EXPECT authority_delta == 0

  TEST false_ready "Odmowa zatrzymuje retry":
    EXPECT waiting_input.gate_code != null
    EXPECT unchanged_retry == false

  TEST handoff "Następca ma dowód":
    EXPECT predecessor.receipt == terminal
    EXPECT handoff.eql == green`;

const workCellDsl = `workcell:
  goal: accepted_report
  actor: { executor: agent, validator: human }

  authority:
    allow: [read_sources, create_draft, run_tests]
    require_approval: [publish, send]

  protocol:
    mode: ping_pong
    checkpoints: [after_plan, before_irreversible_action]

  evidence:
    require: [sources, decisions, test_results, final_artifact]

  escalation:
    when: [authority_missing, budget_exceeded, goal_changed]`;

export default function DslPage() {
  return (
    <main>
      <SiteHeader />

      <section className="dsl-hero shell">
        <p className="eyebrow">DSL / Idea as executable value</p>
        <h1>Intencja, którą<br />można sprawdzić</h1>
        <div className="dsl-hero-bottom">
          <p>
            DSL skraca opis nie dlatego, że używa mniej słów. Zwiększa wartość
            idei, ponieważ zamienia ją w kontrakt łatwy do zmiany,
            wersjonowania, wdrożenia, testowania i prototypowania.
          </p>
          <span>opis → kontrakt → dowód → v+1</span>
        </div>
      </section>

      <section className="compression-section shell">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Kompresja bez utraty znaczenia</p>
            <h2>Od akapitu<br />do kontraktu</h2>
          </div>
          <p>
            Proza tłumaczy sens człowiekowi. DSL izoluje decyzje, które system
            ma potrafić jednoznacznie zweryfikować.
          </p>
        </div>

        <div className="before-after">
          <article className="prose-card">
            <span>Opis narracyjny</span>
            <h3>Digital Twin i routing</h3>
            <p>
              Digital Twin jest portretem aktora tylko do odczytu. Router może
              użyć go przy wyborze wykonawcy, ale nie może na jego podstawie
              rozszerzyć uprawnień. Kandydat musi mieć pokrycie AQL i
              rozwiązywalny URI. Handoff wymaga terminalnego receiptu oraz
              zielonego EQL. Brak gotowości zmienia stan na waiting_input i
              zapisuje dokładny kod bramki, aby scheduler nie ponawiał
              niezmienionej odmowy.
            </p>
          </article>
          <div className="compression-mark" aria-hidden="true">
            <b>↓</b>
            <span>formalizacja</span>
          </div>
          <article className="code-card">
            <div><span>intent.yaml</span><b>walidowalne</b></div>
            <pre><code>{intentDsl}</code></pre>
          </article>
        </div>
      </section>

      <section className="dsl-value-section">
        <div className="shell">
          <p className="section-kicker">Wartość formalizacji</p>
          <div className="gain-grid">
            {gains.map(([no, title, text]) => (
              <article key={no}>
                <span>{no}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="subactor-case shell">
        <div className="case-head">
          <div>
            <p className="section-kicker">Studium wdrożenia / Subactor.com</p>
            <h2>Portret, router<br />i łańcuch ticketów</h2>
          </div>
          <p>
            Poniższa demonstracja formalizuje rozwiązanie opisane w materiałach
            Subactora z 24 lipca 2026. Kanoniczna implementacja i składnia
            pozostają w repozytorium projektu.
          </p>
        </div>

        <div className="router-flow" aria-label="Przepływ routingu Digital Twin">
          <article><span>01</span><b>Intent</b><small>cel + granice</small></article>
          <i>→</i>
          <article><span>02</span><b>DOQL portrait</b><small>read-only</small></article>
          <i>→</i>
          <article><span>03</span><b>Router</b><small>AQL + URI</small></article>
          <i>→</i>
          <article><span>04</span><b>Executor</b><small>human / bot / service</small></article>
          <i>→</i>
          <article><span>05</span><b>Handoff</b><small>receipt + EQL</small></article>
        </div>

        <div className="dsl-code-grid">
          <article className="code-card">
            <div><span>execution-chain.oql</span><b>proces</b></div>
            <pre><code>{chainDsl}</code></pre>
          </article>
          <article className="code-card">
            <div><span>readiness.testql</span><b>bramki</b></div>
            <pre><code>{readinessDsl}</code></pre>
          </article>
          <article className="code-card wide">
            <div><span>workcell.yaml</span><b>cybernetyczny kontrakt</b></div>
            <pre><code>{workCellDsl}</code></pre>
          </article>
        </div>

        <div className="evidence-strip">
          <div><span>55</span><p>ticketów przeskanowanych</p></div>
          <div><span>33</span><p>kandydatów rozważonych</p></div>
          <div><span>5</span><p>waiting_input sprawdzonych</p></div>
          <div><span>0</span><p>promocji bez zielonych bramek</p></div>
          <div><span>18,8 s</span><p>czas queue_execution</p></div>
        </div>
        <p className="evidence-caption">
          Wyniki próby produkcyjnej według dostarczonego raportu. Kontroler
          wykonuje sweep co 300 s; zdarzenie błędu może zlecić cykl po 1 s, ale
          obowiązuje deduplikacja i cooldown 5 minut. Błąd nie rozszerza
          authority.
        </p>
      </section>

      <section className="evolution-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Pętla ewolucyjna</p>
              <h2>Każda wersja<br />musi wiedzieć więcej</h2>
            </div>
            <p>
              Pętla nie optymalizuje narracji. Optymalizuje sprawdzalny proces,
              zachowując historię decyzji i możliwość cofnięcia zmiany.
            </p>
          </div>
          <div className="evolution-loop">
            {loop.map(([no, title, text]) => (
              <article key={no}><span>{no}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
          <div className="evolution-guard">
            <b>Niezmiennik:</b>
            <span>portret opisuje aktora</span>
            <span>router wybiera kandydata</span>
            <span>AQL nadaje granice</span>
            <span>EQL dopuszcza handoff</span>
          </div>
        </div>
      </section>

      <section className="dsl-end shell">
        <div>
          <p className="section-kicker">Następny krok</p>
          <h2>Zacznij od jednej<br />walidowalnej intencji</h2>
        </div>
        <div>
          <p>
            Process Pack zawiera Intent, AQL, OQL, DOQL, EQL, TestQL, SODL,
            URI Process oraz walidowalny kontrakt WorkCell.
          </p>
          <div className="evidence-box" style={{ marginBottom: 14 }}>
            <h3 style={{ marginTop: 0 }}>Operacyjnie: jak pisać eskalację</h3>
            <p style={{ marginBottom: 12 }}>
              Komunikacja o stanie pracy i decyzjach powinna wskazywać referencje
              do dowodu, nie załączony plik.
            </p>
            <pre>
              {`Temat: [Escalation] TR-421 — checkpoint nie zakończony
Context: https://repo.example/ticket/TR-421
Evidence: https://repo.example/artifact/TR-421/validation-2026-07-24
Decyzja do podjęcia: rozszerzyć scope działania?`}
            </pre>
          </div>
          <a className="button button-primary" href="/releases/retrospektywa-process-pack-0.2.zip">
            Pobierz Process Pack
          </a>
        </div>
      </section>
    </main>
  );
}
