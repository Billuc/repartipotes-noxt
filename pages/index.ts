import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import CreateSplit from "../islands/CreateSplit";
import JoinSplit from "../islands/JoinSplit";

const CreateSplitIsland = await prepareIsland(CreateSplit);
const JoinSplitIsland = await prepareIsland(JoinSplit);

export default function Home() {
  return html`
    <${Layout} title="Répartipotes — Split expenses with friends">
      <section>
        <h2>Create a new split</h2>
        <p class="subtitle" style="margin-bottom: 2rem;">
          Start a new group to track shared expenses. Add participants, choose
          a default currency, and share the split link with friends.
        </p>
        <${CreateSplitIsland} />
      </section>

      <div class="divider"></div>

      <section>
        <h2>Join an existing split</h2>
        <p class="subtitle" style="margin-bottom: 2rem;">
          Enter a split code to view and manage shared expenses with your group.
        </p>
        <${JoinSplitIsland} />
      </section>
    </${Layout}>
  `;
}
