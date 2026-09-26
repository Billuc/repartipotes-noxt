import { h } from "preact";
import { Island } from "noxt";
import Layout from "@/components/Layout";
import RecentSplits from "@/islands/RecentSplits";
import { useNoxtContext } from "@/lib/runtime";

export default function Home() {
  const { page } = useNoxtContext();

  return (
    <Layout title="Répartipotes — Partager les dépenses entre amis">
      <section class="hstack gap-4 justify-center">
        <a href={page("/create-split")} class="button outline">
          Créer un groupe
        </a>
        <span class="text-light">ou</span>
        <a href={page("/join-split")} class="button outline">
          Rejoindre un groupe
        </a>
      </section>

      <hr />

      <Island component={RecentSplits} props={{}} />
    </Layout>
  );
}
