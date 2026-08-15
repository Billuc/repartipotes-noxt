import { h } from "preact";
import { Island } from "noxt";
import Layout from "@/components/Layout";
import RecentSplits from "@/islands/RecentSplits";
import { link } from "noxt:utils";

export default function Home() {
  return (
    <Layout title="Répartipotes — Partager les dépenses entre amis">
      <section class="hstack gap-4 justify-center">
        <a href={link("/create-split")} class="button outline">
          Créer un groupe
        </a>
        <span class="text-light">ou</span>
        <a href={link("/join-split")} class="button outline">
          Rejoindre un groupe
        </a>
      </section>

      <hr />

      <Island component={RecentSplits} props={{}} />
    </Layout>
  );
}
