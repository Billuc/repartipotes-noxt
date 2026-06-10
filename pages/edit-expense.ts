import { html } from "htm/preact";
import { prepareIsland } from "noxt";
import Layout from "../components/Layout";
import EditExpense from "../islands/EditExpense";

const EditExpenseIsland = await prepareIsland(EditExpense);

export default function EditExpensePage() {
  return html`
    <${Layout} title="Modifier une dépense — Répartipotes">
      <section>
        <article class="card">
          <${EditExpenseIsland} />
        </article>
      </section>
    </${Layout}>
  `;
}
