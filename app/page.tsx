import Link from "next/link";

const streams = [
  {
    no: "01",
    title: "Książka",
    text: "Pełna metoda: od stanowiska pracy i kolejki AI po metryki autonomii.",
    href: "/ksiazka",
  },
  {
    no: "02",
    title: "Podcast",
    text: "Rozmowy i eksperymenty z pracy programistów wspieranych przez modele.",
    href: "/podcast",
  },
  {
    no: "03",
    title: "Laboratorium",
    text: "Rejestr zdarzeń, pomiary i digital twin uczący się Twojego sposobu pracy.",
    href: "/laboratorium",
  },
  {
    no: "04",
    title: "DSL",
    text: "Intencje zamienione w kontrakty, które można walidować, testować i rozwijać.",
    href: "/dsl",
  },
];

const autonomy = [
  ["L0", "Obserwuje", "Rejestruje zdarzenia i nie podejmuje decyzji."],
  ["L1", "Podpowiada", "Wykrywa wzorce, ale człowiek wybiera działanie."],
  ["L2", "Deleguje", "Przygotowuje i zleca zadania w ustalonych granicach."],
  ["L3", "Wykonuje", "Realizuje powtarzalny proces; człowiek zatwierdza wynik."],
  ["L4", "Optymalizuje", "Porównuje strategie i poprawia proces na podstawie dowodów."],
];

export default function Home() {
  return (
    <main>
      <header className="site-header shell">
        <Link className="wordmark" href="/" aria-label="Retrospektywa — strona główna">
          <span aria-hidden="true" className="signal-mark" />
          RETROSPEKTYWA.PL
        </Link>
        <nav aria-label="Główna nawigacja">
          <Link href="/ksiazka">Książka</Link>
          <Link href="/dsl">DSL</Link>
          <a href="#eseje">Blog</a>
          <Link href="/podcast">Podcast</Link>
          <Link href="/laboratorium">Eksperymenty</Link>
        </nav>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">Manifest / 001</p>
          <h1>Programista jako wąskie gardło</h1>
          <div className="red-rule" />
          <p className="hero-lead">
            System pracy, w którym AI zwiększa przepustowość, ale nie przeciąża
            Twojej uwagi.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="https://tom-sapletta-com.github.io/retrospektywa/">
              Czytaj książkę
            </a>
            <a className="button button-secondary" href="/releases/retrospektywa-audiobook-preview-0.2.mp3">
              Posłuchaj audiobooka
            </a>
          </div>
        </div>

        <div className="flow-plate" aria-label="Schemat przepływu pracy człowieka i AI">
          <div className="flow-heading">
            <span><b>1</b> ŹRÓDŁA AI</span>
            <span><b>2</b> WĄSKIE GARDŁO</span>
            <span><b>3</b> KOLEJKA ODBIORU</span>
          </div>
          <div className="flow-grid">
            <div className="source-stack">
              {["Generowanie kodu", "Refaktoryzacja", "Testy", "Dokumentacja", "Analiza"].map(
                (item) => <div className="flow-card" key={item}><i />{item}</div>,
              )}
            </div>
            <div className="human-node">
              <span className="focus-dot" />
              <span className="person-icon" aria-hidden="true">♙</span>
              <small>UWAGA</small>
            </div>
            <div className="review-stack">
              {["Nowy moduł", "Poprawa walidacji", "Testy integracyjne", "Dokumentacja API"].map(
                (item, index) => (
                  <div className="flow-card review-card" key={item}>
                    <b>{String(index + 1).padStart(2, "0")}</b>{item}<span>◷</span>
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="flow-legend">
            <span><i className="legend-focus" />FOKUS</span>
            <span><i />LIMIT UWAGI</span>
            <span><em />KOSZT PRZEŁĄCZANIA KONTEKSTU</span>
          </div>
        </div>
      </section>

      <section className="packages-section" id="wydanie">
        <div className="shell">
          <div className="section-heading">
            <div><p className="section-kicker">Wydanie 0.2</p><h2>Czytaj, słuchaj<br />albo uruchom.</h2></div>
            <p>Książka, audio i wykonywalne przykłady powstają w jednym, testowanym procesie publikacji.</p>
          </div>
          <div className="package-grid">
            <article><span>01</span><h3>Książka</h3><p>HTML, PDF, EPUB i DOCX z rozdziałami o SOA, POA, URI Process oraz authority.</p><b>otwarte wydanie</b><Link href="/ksiazka">Wybierz format →</Link></article>
            <article className="featured"><span>02</span><h3>Audio</h3><p>Polska próbka audiobooka MP3 z manifestem pochodzenia i sumą kontrolną.</p><b>głos syntetyczny</b><a href="/releases/retrospektywa-audiobook-preview-0.2.mp3">Pobierz MP3 →</a></article>
            <article><span>03</span><h3>Przykłady</h3><p>Process Pack: DSL, JSON Schema, kontrakt authority oraz przepływ URI Process.</p><b>ZIP + źródła</b><a href="/releases/retrospektywa-process-pack-0.2.zip">Pobierz ZIP →</a></article>
          </div>
        </div>
      </section>

      <section className="thesis-section shell" id="manifest">
        <p className="section-kicker">Teza redakcyjna</p>
        <div className="thesis-grid">
          <h2>Nie chodzi o więcej pracy.<br />Chodzi o lepszy system odbioru.</h2>
          <div>
            <p className="large-copy">
              Modele mogą pracować równolegle. Człowiek powinien mieć jedno
              aktywne zadanie wymagające skupienia oraz kontrolowane punkty
              decyzji.
            </p>
            <p>
              Rejestrujemy przebieg pracy, koszt, poprawki i jakość. Dopiero
              powtarzalny wynik daje AI prawo do kolejnego poziomu autonomii.
            </p>
          </div>
        </div>
        <div className="principles">
          <article><b>01</b><h3>Human WIP = 1</h3><p>Jedna decyzja naraz. Reszta trafia do kolejki.</p></article>
          <article><b>02</b><h3>Dwa modele, różne role</h3><p>Jeden tworzy, drugi niezależnie krytykuje lub testuje.</p></article>
          <article><b>03</b><h3>Dowód przed autonomią</h3><p>Przejście wyżej wymaga stabilnej jakości, kosztu i czasu.</p></article>
        </div>
      </section>

      <section className="twin-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Digital twin programisty</p>
              <h2>Od obserwacji do samodzielności</h2>
            </div>
            <p>
              Twin nie kopiuje osobowości. Uczy się decyzji, kryteriów jakości,
              rytmu pracy i granic odpowiedzialności.
            </p>
          </div>

          <div className="autonomy-table">
            {autonomy.map(([level, title, text], index) => (
              <article key={level}>
                <div className="level">{level}</div>
                <div><h3>{title}</h3><p>{text}</p></div>
                <span className={index < 2 ? "status active" : "status"}>
                  {index < 2 ? "gotowe" : "wymaga dowodów"}
                </span>
              </article>
            ))}
          </div>
          <div className="twin-actions">
            <p><b>Warunek awansu:</b> jakość ≥ 95%, brak incydentów krytycznych i 20 powtórzeń procesu.</p>
            <Link className="text-link" href="/laboratorium">Otwórz rejestr zdarzeń →</Link>
          </div>
        </div>
      </section>

      <section className="streams-section shell" id="eseje">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Jedno źródło, wiele formatów</p>
            <h2>Retrospektywa jest systemem publikacji</h2>
          </div>
          <p>
            Eksperyment zasila rozdział, esej, odcinek i kartę metryki. Bez
            przepisywania tej samej wiedzy cztery razy.
          </p>
        </div>
        <div className="stream-grid">
          {streams.map((stream) => (
            <Link href={stream.href} className="stream-card" key={stream.no}>
              <span>{stream.no}</span>
              <h3>{stream.title}</h3>
              <p>{stream.text}</p>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>

      <footer>
        <div className="shell footer-grid">
          <div>
            <span className="footer-mark">R.</span>
            <p>Projektowanie i mierzenie pracy programisty z AI.</p>
          </div>
          <div><b>Czytaj</b><Link href="/manifest">Manifest</Link><Link href="/ksiazka">Książka</Link></div>
          <div><b>Praktykuj</b><Link href="/laboratorium">Laboratorium</Link><Link href="/podcast">Podcast</Link></div>
          <div><b>Subdomeny</b><span>ksiazka.retrospektywa.pl</span><span>podcast.retrospektywa.pl</span></div>
        </div>
      </footer>
    </main>
  );
}
