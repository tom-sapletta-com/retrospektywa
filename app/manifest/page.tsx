import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Manifest",
  description: "Dziesięć zasad efektywnej pracy programisty z AI.",
};

const rules = [
  ["Uwaga jest zasobem krytycznym", "Przepustowość modeli rośnie szybciej niż zdolność człowieka do oceny wyników."],
  ["Human WIP wynosi jeden", "Jedno aktywne zadanie poznawcze; kolejne wyniki AI czekają w jawnej kolejce."],
  ["Capability przed providerem", "Najpierw określ rolę: implementacja, review, test lub research. Model jest wymiennym wykonawcą."],
  ["Dwa modele nie znaczą dwóch projektów", "Równoległość służy niezależnej weryfikacji, a nie mnożeniu przełączeń kontekstu."],
  ["Automatyczna kontrola przed review", "Testy, lint i skan bezpieczeństwa powinny odrzucić słabe wyniki przed angażowaniem człowieka."],
  ["Mierz zaakceptowaną zmianę", "Wygenerowane linie kodu nie są wynikiem. Wynikiem jest bezpiecznie dostarczona wartość."],
  ["Rejestruj metadane, nie sekrety", "Twin potrzebuje decyzji, czasu, kosztu i jakości — nie prywatnego kodu ani pełnych promptów."],
  ["Komunikuj przez linki", "W eskalacjach i decyzjach dziel się odnośnikiem do ticketu lub dowodu, a nie załączonym plikiem."],
  ["Autonomia jest zdobywana", "AI otrzymuje szersze uprawnienia dopiero po serii powtarzalnych, mierzalnych sukcesów."],
  ["Każda delegacja ma wyłącznik", "Limit kosztu, czasu, iteracji i jednoznaczny warunek eskalacji są częścią zadania."],
  ["Retrospektywa zamyka pętlę", "Po wykonaniu zmieniamy proces, nie tylko kolejne polecenie dla modelu."],
];

export default function ManifestPage() {
  return (
    <main>
      <SiteHeader />
      <section className="inner-hero manifesto-hero shell">
        <p className="eyebrow">Manifest / wersja 0.1</p>
        <h1>Dziesięć zasad<br />pracy z AI</h1>
        <p>
          Celem nie jest generowanie większej ilości kodu. Celem jest system,
          który zwiększa tempo bez utraty jakości, bezpieczeństwa i sprawczości
          człowieka.
        </p>
      </section>
      <section className="manifest-list shell">
        {rules.map(([title, text], index) => (
          <article key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="closing-cta">
        <div className="shell">
          <p className="section-kicker">Zacznij od danych</p>
          <h2>Nie zgaduj, jak pracujesz.<br />Zarejestruj pierwszy proces.</h2>
          <Link prefetch={false} className="button button-primary" href="/laboratorium">Otwórz laboratorium</Link>
        </div>
      </section>
    </main>
  );
}
