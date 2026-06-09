import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import RecentSplits from "../islands/RecentSplits";

const RecentSplitsIsland = await prepareIsland(RecentSplits);

export default function Home() {
  return html`
    <${Layout} title="Répartipotes — Split expenses with friends">
      <section class="hstack gap-4">
        <a href="/create-split" class="button outline">Create a split</a>
        <span class="text-light">or</span>
        <a href="/join-split" class="button outline">Join a split</a>
      </section>

      <hr />

      <${RecentSplitsIsland} />
    </${Layout}>
  `;
}
