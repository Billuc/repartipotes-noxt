import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import ShareSplit from "../islands/ShareSplit";

const ShareSplitIsland = await prepareIsland(ShareSplit);

export default function ShareSplitPage() {
  return html`
    <${Layout} title="Share split — Répartipotes">
      <section>
        <${ShareSplitIsland} />
      </section>
    </${Layout}>
  `;
}
