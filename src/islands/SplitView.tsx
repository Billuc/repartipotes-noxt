import { h, Fragment } from "preact";
import { useMemo } from "preact/hooks";
import ExpensesTab from "../components/ExpensesTab.tsx";
import SettlementsTab from "../components/SettlementsTab.tsx";
import ParticipantsTab from "../components/ParticipantsTab.tsx";
import { storeId } from "../lib/splits.ts";
import { useApi } from "noxt/runtime";
import { useNoxtContext } from "@/lib/runtime.ts";

export default function SplitView() {
  const { page, api } = useNoxtContext();

  const splitId = useMemo(() => {
    const id = new URLSearchParams(window.location.search).get("split_id");
    if (!id) return null;
    storeId(id);
    return id;
  }, []);

  if (!splitId) {
    return (
      <div role="alert" data-variant="error">
        Aucun identifiant de groupe fourni
      </div>
    );
  }

  const { data, error, loading, refresh } = useApi(api("/api/splits", "GET"), {
    id: splitId,
  });

  if (loading) {
    return (
      <div class="vstack items-center p-4">
        <div aria-busy="true" data-spinner="large"></div>
        <p>Chargement du groupe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" data-variant="error">
        {error}
      </div>
    );
  }

  if (!data) {
    return <p>Aucune donnée de groupe trouvée.</p>;
  }

  return (
    <>
      <div class="hstack justify-between mb-4">
        <h2>{data.description}</h2>
        <a
          href={page("/share-split", { split_id: data.id })}
          data-variant="secondary"
        >
          Partager
        </a>
      </div>

      <ot-tabs>
        <div role="tablist">
          <button role="tab">Dépenses</button>
          <button role="tab">Remboursements</button>
          <button role="tab">Participants</button>
        </div>
        <div role="tabpanel">
          <ExpensesTab
            split={{
              id: data.id,
              participants: data.participants,
              default_currency: data.default_currency,
            }}
            expenses={data.expenses}
          />
        </div>
        <div role="tabpanel">
          <SettlementsTab balances={data.balances} />
        </div>
        <div role="tabpanel">
          <ParticipantsTab
            participants={data.participants}
            individualBalances={data.individualBalances}
            defaultCurrency={data.default_currency}
            splitId={splitId}
            onSaved={refresh}
          />
        </div>
      </ot-tabs>
    </>
  );
}
