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
      <div className="shell"><EventLab /></div>
    </main>
  );
}
