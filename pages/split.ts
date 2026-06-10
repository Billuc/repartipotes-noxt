import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import SplitView from "../islands/SplitView";

const SplitViewIsland = await prepareIsland(SplitView);

export default function SplitPage() {
  return html`
    <${Layout} title="Groupe — Répartipotes">
      <${SplitViewIsland} />
    </${Layout}>
  `;
}
