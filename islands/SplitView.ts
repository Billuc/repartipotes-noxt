import { html } from "htm/preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import { defineIsland } from "noxt";
import ExpensesTab from "../components/ExpensesTab";
import SettlementsTab from "../components/SettlementsTab";
import SettingsTab from "../components/SettingsTab";
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
      setError("No split ID provided");
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
          throw new Error(`Failed to load split (${res.status})`);
        }
        const json = (await res.json()) as SplitData;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load split");
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
    return html`<div
      class="vstack"
      style="align-items:center;padding:var(--space-8)"
    >
      <div aria-busy="true" data-spinner="large"></div>
      <p>Loading split...</p>
    </div>`;
  }

  if (error) {
    return html`<div role="alert" data-variant="error">${error}</div>`;
  }

  if (!data) {
    return html`<p>No split data found.</p>`;
  }

  return html`
    <div class="hstack justify-between mb-4">
      <h2>${data.description}</h2>
      <a href="/share-split?split_id=${data.id}" data-variant="secondary">
        Share
      </a>
    </div>

    <ot-tabs>
      <div role="tablist">
        <button role="tab">Expenses</button>
        <button role="tab">Settlements</button>
        <button role="tab">Settings</button>
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
        <${SettingsTab}
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
