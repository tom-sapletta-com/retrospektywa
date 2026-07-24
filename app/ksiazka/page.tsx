import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Książka",
  description: "Retrospektywa. Jak projektować i mierzyć pracę programisty z AI.",
};

const chapters = [
  ["01", "Programista jako wąskie gardło", "Uwaga, decyzje i weryfikacja jako prawdziwe ograniczenie systemu."],
  ["02", "Stanowisko pracy", "Dwa monitory, terminal, przeglądarka i dwie komplementarne role AI."],
  ["03", "Kolejka zamiast chaosu", "Human WIP = 1, przygotowanie zadań i kontrolowane punkty odbioru."],
  ["04", "Dwa modele, różne role", "Implementacja, niezależny review, research i testowanie."],
  ["05", "Równoległość bez multitaskingu", "Jak utrzymać przepustowość bez płacenia podatku od kontekstu."],
  ["06", "Shell jako centrum operacyjne", "Worktree, sesje, automatyczne testy i powtarzalne polecenia."],
  ["07", "Pomiary efektywności", "Lead time, czas człowieka, rework, defekty i koszt zaakceptowanej zmiany."],
  ["08", "Budżet i ograniczenia modeli", "Limity, degradacja, routing i plan awaryjny dla providerów."],
  ["09", "Digital twin programisty", "Rejestr zdarzeń, profil decyzji i stopniowo zdobywana autonomia."],
  ["10", "DSL: idea, którą można uruchomić", "Formalizacja intencji, walidacja, wersjonowanie i ewolucyjna pętla zmian."],
  ["11", "Cotygodniowa retrospektywa", "Co zachować, co usunąć, co zautomatyzować i jaki test wykonać dalej."],
  ["12", "SOA, POA i URI Process", "Od granic usług do wykonywalnej sieci procesów adresowanych przez URI."],
  ["13", "Wydanie wieloformatowe", "Jeden tekst źródłowy, generator, manifesty i walidacja HTML, PDF, EPUB, DOCX oraz audio."],
  ["14", "Forma współpracy i authority", "UoP, zlecenie, dzieło i B2B jako różne granice kierowania pracą agenta."],
  ["15", "Cybernetyczny WorkCell", "Sprzężenie zwrotne, kolejki, ryzyko, checkpointy i dopasowanie actor–model."],
];

const bookUrl = "https://tom-sapletta-com.github.io/retrospektywa/";
const release = "/releases";

export default function BookPage() {
  return (
    <main>
      <SiteHeader />
      <section className="book-hero shell">
        <div className="book-cover" aria-label="Okładka książki Retrospektywa">
          <span>RETROSPEKTYWA.PL</span>
          <h1>Retro<br />spektywa</h1>
          <p>Jak projektować i mierzyć pracę programisty z AI</p>
          <b>WYDANIE 0.2</b>
        </div>
        <div className="book-copy">
          <p className="eyebrow">Książka jako kod</p>
          <h2>Praktyczny system, nie zbiór promptów</h2>
          <p className="book-lead">
            Każdy rozdział kończy się odtwarzalnym eksperymentem, zestawem
            metryk i małym Process Packiem. Czytelnik nie musi wierzyć autorowi —
            może sprawdzić metodę na własnej pracy.
          </p>
          <div className="format-row">
            <span>PDF</span><span>EPUB</span><span>HTML</span><span>DOCX</span><span>AUDIO</span>
          </div>
          <div className="book-actions">
            <a className="button button-primary" href={bookUrl}>Czytaj online</a>
            <a className="button button-secondary" href={`${release}/retrospektywa-0.2.pdf`}>Pobierz PDF</a>
            <a className="button button-secondary" href="#spis">Spis treści</a>
          </div>
        </div>
      </section>

      <section className="chapters-section shell" id="spis">
        <p className="section-kicker">Spis treści / wydanie 0.2</p>
        <div className="chapter-list">
          {chapters.map(([no, title, text]) => (
            <article key={no}><span>{no}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="packages-section" id="pakiety">
        <div className="shell">
          <div className="section-heading">
            <div><p className="section-kicker">Otwarte wydanie 0.2</p><h2>Jedna treść.<br />Wiele sposobów odbioru.</h2></div>
            <p>Każdy plik powstaje z wersjonowanego źródła, a manifest wydania zawiera rozmiary i sumy SHA-256.</p>
          </div>
          <div className="package-grid">
            <article><span>01</span><h3>Czytaj</h3><p>Responsywna książka HTML oraz wersja PDF do czytania i druku.</p><b>HTML + PDF</b><a href={bookUrl}>Otwórz HTML →</a><a href={`${release}/retrospektywa-0.2.pdf`}>Pobierz PDF →</a></article>
            <article className="featured"><span>02</span><h3>Czytnik</h3><p>EPUB dla czytników oraz edytowalny DOCX do pracy redakcyjnej.</p><b>EPUB + DOCX</b><a href={`${release}/retrospektywa-0.2.epub`}>Pobierz EPUB →</a><a href={`${release}/retrospektywa-0.2.docx`}>Pobierz DOCX →</a></article>
            <article><span>03</span><h3>Uruchom</h3><p>Próbka audiobooka i Process Pack z DSL, schematami i przykładami URI Process.</p><b>MP3 + ZIP</b><a href={`${release}/retrospektywa-audiobook-preview-0.2.mp3`}>Pobierz audio →</a><a href={`${release}/retrospektywa-process-pack-0.2.zip`}>Pobierz przykłady →</a></article>
          </div>
          <p className="sales-note"><a href={`${release}/manifest.json`}>Manifest wydania i sumy kontrolne →</a></p>
        </div>
      </section>

      <section className="book-end shell">
        <p>Książka powstaje publicznie z wyników laboratorium i wersjonowanych przykładów.</p>
        <Link className="text-link" href="/dsl">Zobacz DSL w praktyce →</Link>
      </section>
    </main>
  );
}
