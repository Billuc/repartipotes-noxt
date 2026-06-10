import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import RecentSplits from "../islands/RecentSplits";

const RecentSplitsIsland = await prepareIsland(RecentSplits);

export default function Home() {
  return html`
    <${Layout} title="Répartipotes — Partager les dépenses entre amis">
      <section class="hstack gap-4 justify-center">
        <a href="/create-split" class="button outline">Créer un groupe</a>
        <span class="text-light">ou</span>
        <a href="/join-split" class="button outline">Rejoindre un groupe</a>
      </section>

      <hr />

      <${RecentSplitsIsland} />
    </${Layout}>
  `;
}
