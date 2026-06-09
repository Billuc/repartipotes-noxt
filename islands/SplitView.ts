import { html } from "htm/preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import { defineIsland } from "noxt";
import ExpensesTab from "../components/ExpensesTab";
import SettlementsTab from "../components/SettlementsTab";
import SettingsTab from "../components/SettingsTab";

interface SplitMethod {
  method: "Evenly" | "Amounts";
  details: string;
}

interface Expense {
  id: number;
  split_id: string;
  name: string;
  amount: number;
  currency: string;
  original_amount: number;
  original_currency: string;
  payed_by: string;
  payed_for: string[];
  expense_date: number;
  split_method: SplitMethod;
}

interface Balance {
  debtor: string;
  amount: number;
  currency: string;
  creditor: string;
}

interface SplitData {
  id: string;
  description: string;
  participants: string[];
  default_currency: string;
  expenses: Expense[];
  individualBalances: Record<string, number>;
  balances: Balance[];
}

const SPLITS_KEY = "splits";
const SEPARATOR = ",";

function storeSplitId(id: string) {
  try {
    const raw = localStorage.getItem(SPLITS_KEY) ?? "";
    const ids = new Set(raw.split(SEPARATOR).filter((s) => s.length > 0));
    ids.add(id);
    localStorage.setItem(SPLITS_KEY, Array.from(ids).join(SEPARATOR));
  } catch {}
}

function SplitView() {
  const [splitId, setSplitId] = useState<string | null>(null);
  const [data, setData] = useState<SplitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("split_id");
    if (id) {
      setSplitId(id);
      storeSplitId(id);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy to clipboard");
    }
  };

  const splitUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/split?split_id=${splitId}`
      : "";

  if (loading) {
    return html`<div class="vstack" style="align-items:center;padding:var(--space-8)">
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
    <div class="hstack justify-between">
      <h2>${data.description}</h2>
      <button
        type="button"
        data-variant="secondary"
        onClick=${() => setShowShare(!showShare)}
      >
        Share
      </button>
    </div>

    ${showShare
      ? html`
          <article class="card">
            <header>
              <h3>Share this split</h3>
            </header>
            <div class="vstack">
              <p>
                Share this link with friends:<br />
                <a href=${splitUrl} target="_blank">${splitUrl}</a>
                <button
                  type="button"
                  class="outline small"
                  onClick=${() => copyToClipboard(splitUrl)}
                >
                  ${copied ? "Copied!" : "Copy link"}
                </button>
              </p>
              <p>
                Or use this code:<br />
                <strong>${data.id}</strong>
                <button
                  type="button"
                  class="outline small"
                  onClick=${() => copyToClipboard(data.id)}
                >
                  ${copied ? "Copied!" : "Copy code"}
                </button>
              </p>
            </div>
            <footer>
              <button
                type="button"
                class="ghost small"
                onClick=${() => setShowShare(false)}
              >
                Close
              </button>
            </footer>
          </article>
        `
      : null}

    <ot-tabs>
      <div role="tablist">
        <button role="tab">Expenses</button>
        <button role="tab">Settlements</button>
        <button role="tab">Settings</button>
      </div>
      <div role="tabpanel">
        <${ExpensesTab}
          split=${{ id: data.id, participants: data.participants, default_currency: data.default_currency }}
          expenses=${data.expenses}
          onSaved=${loadData}
        />
      </div>
      <div role="tabpanel">
        <${SettlementsTab}
          balances=${data.balances}
        />
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
