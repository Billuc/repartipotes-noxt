import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import JoinSplit from "../islands/JoinSplit";

const JoinSplitIsland = await prepareIsland(JoinSplit);

export default function JoinSplitPage() {
  return html`
    <${Layout} title="Join split — Répartipotes">
      <section>
        <h2>Join an existing split</h2>
        <p class="text-light mb-6">
          Enter a split code to view and manage shared expenses with your group.
        </p>
        <article class="card">
          <${JoinSplitIsland} />
        </article>
      </section>
    </${Layout}>
  `;
}
