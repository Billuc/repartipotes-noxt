import { h } from "preact";
import { Island } from "noxt";
import Layout from "@/components/Layout";
import ShareSplit from "@/islands/ShareSplit";

export default function ShareSplitPage() {
  return (
    <Layout title="Partager le groupe — Répartipotes">
      <section>
        <Island component={ShareSplit} props={{}} />
      </section>
    </Layout>
  );
}
