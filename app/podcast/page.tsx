import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Podcast",
  description: "Podcast Retrospektywa o efektywnej pracy programisty z AI.",
};

const episodes = [
  ["001", "Programista jako wąskie gardło", "18 min", "Dlaczego szybkość generowania kodu nie jest już najważniejszą metryką."],
  ["002", "Dwa modele, jedna decyzja", "24 min", "Jak podzielić implementację i review bez mnożenia pracy człowieka."],
  ["003", "Digital twin potrzebuje dowodów", "21 min", "Co zapisywać, czego nie przechowywać i kiedy podnieść poziom autonomii."],
  ["004", "Koszt przełączania kontekstu", "27 min", "Eksperyment z dwoma projektami i kolejką wyników AI."],
];

export default function PodcastPage() {
  return (
    <main>
      <SiteHeader />
      <section className="podcast-hero">
        <div className="shell">
          <p className="eyebrow">Podcast / sezon 01</p>
          <h1>Głos<br />retrospektywy</h1>
          <div className="podcast-intro">
            <p>Rozmowy, pomiary i eksperymenty z pracy programistów wspieranych przez AI.</p>
            <div><span>RSS</span><span>YouTube</span><span>Spotify</span><span>Apple Podcasts</span></div>
          </div>
        </div>
      </section>

      <section className="episodes shell">
        <div className="section-heading">
          <div><p className="section-kicker">Odcinki</p><h2>Sezon pierwszy</h2></div>
          <p>Każdy odcinek powstaje z rozdziału i tego samego rejestru dowodów. Transkrypcja pozostaje źródłem dla audio.</p>
        </div>
        <div className="episode-list">
          {episodes.map(([no, title, duration, text]) => (
            <article key={no}>
              <span>{no}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
              <b>{duration}</b>
              <button aria-label={`Odtwórz odcinek ${no}`} disabled>▶</button>
            </article>
          ))}
        </div>
        <p className="sales-note">Odtwarzacze zostaną aktywowane po wygenerowaniu i opublikowaniu pierwszych plików audio.</p>
      </section>

      <section className="audio-pipeline">
        <div className="shell">
          <p className="section-kicker">Audio pipeline</p>
          <h2>Jedna transkrypcja.<br />Dwóch niezależnych providerów.</h2>
          <div className="audio-flow">
            <span>QMD / Markdown</span><i>→</i><span>Skrypt odcinka</span><i>→</i>
            <span>OpenAI Audio</span><b>lub</b><span>ElevenLabs</span><i>→</i><span>MP3 + RSS</span>
          </div>
          <Link className="text-link" href="/ksiazka">Zobacz źródło książki →</Link>
        </div>
      </section>
    </main>
  );
}
