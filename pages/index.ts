import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import JoinSplit from "../islands/JoinSplit";
import homeUrl from "../assets/home.css" with { type: "file" };

const JoinSplitIsland = await prepareIsland(JoinSplit);

export default function Home() {
  return html`
    <${Layout} title="Répartipotes — Split expenses with friends" styles=${[homeUrl]}>
      <section>
        <h2>Create a new split</h2>
        <p class="subtitle" style="margin-bottom: 2rem;">
          Start a new group to track shared expenses. Add participants, choose
          a default currency, and share the split link with friends.
        </p>
        <div class="hero-buttons" style="justify-content: start;">
          <a href="/create-split" class="btn btn-primary">New split</a>
        </div>
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
