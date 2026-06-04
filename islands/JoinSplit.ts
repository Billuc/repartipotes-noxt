import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { defineIsland } from "noxt";

const SPLITS_KEY = "splits";
const SEPARATOR = ",";

interface SplitInfo {
  id: string;
  description: string;
}

function getStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(SPLITS_KEY);
    return raw ? raw.split(SEPARATOR).filter((s) => s.length > 0) : [];
  } catch {
    return [];
  }
}

function storeId(id: string) {
  const ids = new Set(getStoredIds());
  ids.add(id);
  localStorage.setItem(SPLITS_KEY, Array.from(ids).join(SEPARATOR));
}

function removeStoredId(id: string) {
  const ids = new Set(getStoredIds());
  ids.delete(id);
  localStorage.setItem(SPLITS_KEY, Array.from(ids).join(SEPARATOR));
}

function JoinSplit() {
  const [code, setCode] = useState("");
  const [recentSplits, setRecentSplits] = useState<SplitInfo[]>([]);
  const [loadingSplits, setLoadingSplits] = useState(true);

  useEffect(() => {
    const ids = getStoredIds();
    if (ids.length === 0) {
      setLoadingSplits(false);
      return;
    }

    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/splits/${id}`);
          if (!res.ok) return null;
          const data = (await res.json()) as SplitInfo;
          return data;
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      setRecentSplits(results.filter((s): s is SplitInfo => s !== null));
      setLoadingSplits(false);
    });
  }, []);

  const handleJoin = (e: Event) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    storeId(trimmed);
    window.location.href = `/split?split_id=${trimmed}`;
  };

  const navigateToSplit = (id: string) => {
    window.location.href = `/split?split_id=${id}`;
  };

  const handleRemove = (e: Event, id: string) => {
    e.stopPropagation();
    removeStoredId(id);
    setRecentSplits(recentSplits.filter((s) => s.id !== id));
  };

  return html`
    <div class="join-split">
      <form onSubmit=${handleJoin}>
        <label>
          Split code:
          <input
            type="text"
            value=${code}
            onInput=${(e: Event) =>
              setCode((e.target as HTMLInputElement).value)}
            placeholder="Enter split code"
            required
          />
        </label>
        <button type="submit" class="btn btn-primary">Join split</button>
      </form>

      ${recentSplits.length > 0
        ? html`
            <div class="recent-splits">
              <h4>Recent splits</h4>
              <table class="splits-table">
                ${recentSplits.map(
                  (s) => html`
                    <tr
                      class="split-row"
                      onClick=${() => navigateToSplit(s.id)}
                    >
                      <td>
                        <a href="/split?split_id=${s.id}">${s.description}</a>
                      </td>
                      <td>
                        <button
                          type="button"
                          class="btn-icon"
                          onClick=${(e: Event) => handleRemove(e, s.id)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  `,
                )}
              </table>
            </div>
          `
        : null}
      ${loadingSplits
        ? html`<p class="loading-text">Loading recent splits...</p>`
        : null}
      ${!loadingSplits && recentSplits.length === 0
        ? html`<p class="muted-text">
            No recent splits. Create or join one above!
          </p>`
        : null}
    </div>
  `;
}

export default defineIsland(JoinSplit, import.meta.path);
