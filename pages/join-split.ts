import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import JoinSplit from "../islands/JoinSplit";

const JoinSplitIsland = await prepareIsland(JoinSplit);

export default function JoinSplitPage() {
  return html`
    <${Layout} title="Join split — Répartipotes" styles=${[]}>
      <section>
        <h2>Join an existing split</h2>
        <p style="margin-bottom: 2rem;">
          Enter a split code to view and manage shared expenses with your group.
        </p>
        <${JoinSplitIsland} />
      </section>
    </${Layout}>
  `;
}
