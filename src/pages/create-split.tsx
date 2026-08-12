import { html } from "htm/preact";
import { h } from "preact";
import { Island } from "noxt";
import Layout from "@/components/Layout";
import CreateSplit from "@/islands/CreateSplit";

const CreateSplitIsland = await prepareIsland(CreateSplit);

export default function CreateSplitPage() {
  return (
    <Layout title="Nouveau groupe — Répartipotes">
      <section>
        <h2>Créer un nouveau groupe</h2>
        <p class="text-light mb-6">
          Créez un groupe pour suivre les dépenses communes. Ajoutez des
          participants, choisissez une devise par défaut et partagez le lien
          avec vos amis.
        </p>
        <article class="card">
          <Island component={CreateSplit} props={} />
        </article>
      </section>
    </Layout>
  );
}
