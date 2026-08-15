import { h } from "preact";
import { Island } from "noxt";
import Layout from "@/components/Layout";
import EditExpense from "@/islands/EditExpense";

export default function EditExpensePage() {
  return (
    <Layout title="Modifier une dépense — Répartipotes">
      <section>
        <article class="card">
          <Island component={EditExpense} props={{}} />
        </article>
      </section>
    </Layout>
  );
}
