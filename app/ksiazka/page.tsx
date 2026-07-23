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
  ["10", "Cotygodniowa retrospektywa", "Co zachować, co usunąć, co zautomatyzować i jaki test wykonać dalej."],
];

export default function BookPage() {
  return (
    <main>
      <SiteHeader />
      <section className="book-hero shell">
        <div className="book-cover" aria-label="Okładka książki Retrospektywa">
          <span>RETROSPEKTYWA.PL</span>
          <h1>Retro<br />spektywa</h1>
          <p>Jak projektować i mierzyć pracę programisty z AI</p>
          <b>WYDANIE 0.1</b>
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
            <a className="button button-primary" href="#pakiety">Zobacz wydania</a>
            <a className="button button-secondary" href="#spis">Spis treści</a>
          </div>
        </div>
      </section>

      <section className="chapters-section shell" id="spis">
        <p className="section-kicker">Spis treści / wersja robocza</p>
        <div className="chapter-list">
          {chapters.map(([no, title, text]) => (
            <article key={no}><span>{no}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="packages-section" id="pakiety">
        <div className="shell">
          <div className="section-heading">
            <div><p className="section-kicker">Wydania</p><h2>Jedna treść.<br />Trzy sposoby odbioru.</h2></div>
            <p>Moduł płatności zostanie podłączony do wybranego operatora bez zmiany źródeł książki.</p>
          </div>
          <div className="package-grid">
            <article><span>01</span><h3>Cyfrowa</h3><p>EPUB + PDF + aktualizacje wydania 1.x.</p><b>premiera 2026</b><button disabled>Przedsprzedaż wkrótce</button></article>
            <article className="featured"><span>02</span><h3>Pełna</h3><p>Wydanie cyfrowe, audiobook i Process Packi.</p><b>premiera 2026</b><button disabled>Przedsprzedaż wkrótce</button></article>
            <article><span>03</span><h3>Zespół</h3><p>Licencja zespołowa, warsztat i arkusze pomiarów.</p><b>wycena indywidualna</b><a href="mailto:info@softreck.com">Zapytaj o wydanie →</a></article>
          </div>
          <p className="sales-note">Nie pobieramy jeszcze płatności. Najpierw potwierdzimy zakres, cenę i operatora sprzedaży.</p>
        </div>
      </section>

      <section className="book-end shell">
        <p>Książka powstaje publicznie z wyników laboratorium.</p>
        <Link className="text-link" href="/laboratorium">Zobacz metodę pomiaru →</Link>
      </section>
    </main>
  );
}
