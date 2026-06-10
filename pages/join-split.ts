import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import JoinSplit from "../islands/JoinSplit";

const JoinSplitIsland = await prepareIsland(JoinSplit);

export default function JoinSplitPage() {
  return html`
    <${Layout} title="Rejoindre un groupe — Répartipotes">
      <section>
        <h2>Rejoindre un groupe existant</h2>
        <p class="text-light mb-6">
          Entrez un code de groupe pour voir et gérer les dépenses communes.
        </p>
        <article class="card">
          <${JoinSplitIsland} />
        </article>
      </section>
    </${Layout}>
  `;
}
