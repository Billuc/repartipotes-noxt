import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import RecentSplits from "../islands/RecentSplits";

const RecentSplitsIsland = await prepareIsland(RecentSplits);

export default function Home() {
  return html`
    <${Layout} title="Répartipotes — Split expenses with friends" styles=${[]}>
      <section>
        <a href="/create-split">Create a split</a> or <a href="/join-split">Join a split</a>
      </section>

      <hr />

      <${RecentSplitsIsland} />
    </${Layout}>
  `;
}
