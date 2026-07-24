import type { Metadata } from "next";
import { EventLab } from "../components/EventLab";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Laboratorium",
  description: "Rejestr zdarzeń i metryki digital twina programisty.",
};

export default function LaboratoryPage() {
  return (
    <main>
      <SiteHeader />
      <section className="inner-hero shell">
        <p className="eyebrow">Laboratorium / Digital Twin</p>
        <h1>Najpierw obserwuj.<br />Potem deleguj.</h1>
        <p>
          Zapisuj metadane pracy, mierz jakość i zwiększaj autonomię tylko wtedy,
          gdy dowody są stabilne. Rejestr nie przechowuje kodu, promptów ani
          sekretów.
        </p>
      </section>
      <section className="shell" style={{ paddingTop: 0, paddingBottom: 20 }}>
        <div className="evidence-box">
          <h2 style={{ marginTop: 0 }}>Format komunikacji operacyjnej</h2>
          <p style={{ marginBottom: 14 }}>
            W decyzjach i eskalacjach operujemy odnośnikiem do dowodu,
            nie załącznikiem. Jeden link = jeden punkt prawdy.
          </p>
          <pre>
            {`Temat: [Escalation] TR-421 — checkpoint nie zakończony
Context: https://repo.example/ticket/TR-421
Evidence: https://repo.example/artifact/TR-421/validation-2026-07-24
Decyzja do podjęcia: rozszerzyć scope działania?`}
          </pre>
        </div>
      </section>
      <div className="shell"><EventLab /></div>
    </main>
  );
}
