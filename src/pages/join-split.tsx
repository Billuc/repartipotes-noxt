import { h } from "preact";
import { Island } from "noxt";
import Layout from "@/components/Layout";
import JoinSplit from "@/islands/JoinSplit";

export default function JoinSplitPage() {
  return (
    <Layout title="Rejoindre un groupe — Répartipotes">
      <section>
        <h2>Rejoindre un groupe existant</h2>
        <p class="text-light mb-6">
          Entrez un code de groupe pour voir et gérer les dépenses communes.
        </p>
        <article class="card">
          <Island component={JoinSplit} props={{}} />
        </article>
      </section>
    </Layout>
  );
}
