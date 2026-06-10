import { html } from "htm/preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import { defineIsland } from "noxt";
import ExpensesTab from "../components/ExpensesTab";
import SettlementsTab from "../components/SettlementsTab";
import ParticipantsTab from "../components/ParticipantsTab.ts";
import { storeId } from "../lib/splits";
import type { SplitData } from "../lib/types.ts";

function SplitView() {
  const [splitId, setSplitId] = useState<string | null>(null);
  const [data, setData] = useState<SplitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("split_id");
    if (id) {
      setSplitId(id);
      storeId(id);
    } else {
      setError("Aucun identifiant de groupe fourni");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!splitId) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/splits/${splitId}`);
        if (!res.ok) {
          throw new Error(`Échec du chargement du groupe (${res.status})`);
        }
        const json = (await res.json()) as SplitData;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Échec du chargement du groupe");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [splitId, refreshCounter]);

  const loadData = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  if (loading) {
    return html`<div class="vstack items-center p-4">
      <div aria-busy="true" data-spinner="large"></div>
      <p>Chargement du groupe...</p>
    </div>`;
  }

  if (error) {
    return html`<div role="alert" data-variant="error">${error}</div>`;
  }

  if (!data) {
    return html`<p>Aucune donnée de groupe trouvée.</p>`;
  }

  return html`
    <div class="hstack justify-between mb-4">
      <h2>${data.description}</h2>
      <a href="/share-split?split_id=${data.id}" data-variant="secondary">
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
        <${ExpensesTab}
          split=${{
            id: data.id,
            participants: data.participants,
            default_currency: data.default_currency,
          }}
          expenses=${data.expenses}
        />
      </div>
      <div role="tabpanel">
        <${SettlementsTab} balances=${data.balances} />
      </div>
      <div role="tabpanel">
        <${ParticipantsTab}
          participants=${data.participants}
          individualBalances=${data.individualBalances}
          defaultCurrency=${data.default_currency}
          splitId=${splitId}
          onSaved=${loadData}
        />
      </div>
    </ot-tabs>
  `;
}

export default defineIsland(SplitView, import.meta.path);
