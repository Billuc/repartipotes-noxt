import { h } from "preact";
import { Island } from "noxt";
import Layout from "@/components/Layout";
import SplitView from "@/islands/SplitView";

export default function SplitPage() {
  return (
    <Layout title="Groupe — Répartipotes">
      <Island component={SplitView} props={{}} />
    </Layout>
  );
}
