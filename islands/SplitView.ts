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
  const [activeTab, setActiveTab] = useState<"expenses" | "settlements" | "settings">("expenses");

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
    return html`<div class="split-view"><p class="loading-text">Loading split...</p></div>`;
  }

  if (error) {
    return html`<div class="split-view"><p class="form-error">${error}</p></div>`;
  }

  if (!data) {
    return html`<div class="split-view"><p class="muted-text">No split data found.</p></div>`;
  }

  return html`
    <div class="split-view">
      <div class="split-header">
        <h2>${data.description}</h2>
        <button
          type="button"
          class="btn btn-secondary"
          onClick=${() => setShowShare(!showShare)}
        >
          Share
        </button>
      </div>

      ${showShare
        ? html`
            <div class="share-popover">
              <p>
                Share this link with friends:<br />
                <a href=${splitUrl} target="_blank">${splitUrl}</a>
                <button
                  type="button"
                  class="btn btn-secondary"
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
                  class="btn btn-secondary"
                  onClick=${() => copyToClipboard(data.id)}
                >
                  ${copied ? "Copied!" : "Copy code"}
                </button>
              </p>
              <button
                type="button"
                class="btn-close"
                onClick=${() => setShowShare(false)}
              >
                Close
              </button>
            </div>
          `
        : null}

      <nav class="tabs">
        <button
          type="button"
          class="tab ${activeTab === "expenses" ? "tab-active" : ""}"
          onClick=${() => setActiveTab("expenses")}
        >
          Expenses
        </button>
        <button
          type="button"
          class="tab ${activeTab === "settlements" ? "tab-active" : ""}"
          onClick=${() => setActiveTab("settlements")}
        >
          Settlements
        </button>
        <button
          type="button"
          class="tab ${activeTab === "settings" ? "tab-active" : ""}"
          onClick=${() => setActiveTab("settings")}
        >
          Settings
        </button>
      </nav>

      <div class="tab-content">
        ${activeTab === "expenses"
          ? html`
              <${ExpensesTab}
                split=${{ id: data.id, participants: data.participants, default_currency: data.default_currency }}
                expenses=${data.expenses}
                onSaved=${loadData}
              />
            `
          : null}

        ${activeTab === "settlements"
          ? html`
              <${SettlementsTab}
                balances=${data.balances}
              />
            `
          : null}

        ${activeTab === "settings"
          ? html`
              <${SettingsTab}
                participants=${data.participants}
                individualBalances=${data.individualBalances}
                defaultCurrency=${data.default_currency}
                splitId=${splitId}
                onSaved=${loadData}
              />
            `
          : null}
      </div>
    </div>
  `;
}

export default defineIsland(SplitView, import.meta.path);
