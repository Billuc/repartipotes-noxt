import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import SplitView from "../islands/SplitView";
import splitUrl from "../assets/split.css" with { type: "file" };

const SplitViewIsland = await prepareIsland(SplitView);

export default function SplitPage() {
  return html`
    <${Layout} title="Split — Répartipotes" styles=${[splitUrl]}>
      <${SplitViewIsland} />
    </${Layout}>
  `;
}
