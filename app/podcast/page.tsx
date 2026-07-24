import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Audiobook i podcast",
  description: "Audiobook i podcast Retrospektywa o efektywnej pracy programisty z AI.",
};

const audioUrl = "/releases/retrospektywa-audiobook-preview-0.2.mp3";

const episodes = [
  ["001", "Programista jako wąskie gardło", "próbka", "Dlaczego szybkość generowania kodu nie jest już najważniejszą metryką."],
];

export default function PodcastPage() {
  return (
    <main>
      <SiteHeader />
      <section className="podcast-hero">
        <div className="shell">
          <p className="eyebrow">Audiobook / podcast / wydanie 0.2</p>
          <h1>Głos<br />retrospektywy</h1>
          <div className="podcast-intro">
            <p>Rozmowy, pomiary i eksperymenty z pracy programistów wspieranych przez AI.</p>
            <div><span>MP3</span><span>polski</span><span>TTS</span><span>jawny manifest</span></div>
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
              <a className="button button-secondary" aria-label={`Pobierz odcinek ${no}`} href={audioUrl}>MP3</a>
            </article>
          ))}
        </div>
        <audio controls preload="metadata" src={audioUrl}>
          <a href={audioUrl}>Pobierz próbkę audiobooka MP3</a>
        </audio>
        <p className="sales-note">Głos został wygenerowany syntetycznie. Scenariusz QMD pozostaje audytowalnym źródłem nagrania.</p>
      </section>

      <section className="audio-pipeline">
        <div className="shell">
          <p className="section-kicker">Audio pipeline</p>
          <h2>Jedna transkrypcja.<br />Czterech wymiennych providerów.</h2>
          <div className="audio-flow">
            <span>QMD / Markdown</span><i>→</i><span>Skrypt odcinka</span><i>→</i>
            <span>Google Cloud</span><b>lub</b><span>OpenAI</span><b>lub</b>
            <span>ElevenLabs</span><b>lub</b><span>eSpeak NG</span><i>→</i><span>MP3 + manifest</span>
          </div>
          <Link prefetch={false} className="text-link" href="/ksiazka">Zobacz źródło książki →</Link>
        </div>
      </section>
    </main>
  );
}
