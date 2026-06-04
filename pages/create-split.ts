import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import CreateSplit from "../islands/CreateSplit";
import createSplitUrl from "../assets/create-split.css" with { type: "file" };

const CreateSplitIsland = await prepareIsland(CreateSplit);

export default function CreateSplitPage() {
  return html`
    <${Layout} title="New split — Répartipotes" styles=${[createSplitUrl]}>
      <section>
        <h2>Create a new split</h2>
        <p class="subtitle" style="margin-bottom: 2rem;">
          Start a new group to track shared expenses. Add participants, choose
          a default currency, and share the split link with friends.
        </p>
        <${CreateSplitIsland} />
      </section>
    </${Layout}>
  `;
}
