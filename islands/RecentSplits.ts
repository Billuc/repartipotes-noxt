import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { defineIsland } from "noxt";
import { getStoredIds, removeStoredId } from "../lib/splits";

interface SplitInfo {
  id: string;
  description: string;
}

function RecentSplits() {
  const [recentSplits, setRecentSplits] = useState<SplitInfo[]>([]);
  const [loading, setLoading] = useState(true);

  async function getRecentSplits() {
    const ids = getStoredIds();
    if (ids.length === 0) {
      return [];
    }

    const splitDataPromises = ids.map(async (id) => {
      try {
        const res = await fetch(`/api/splits/${id}`);
        if (!res.ok) return null;
        const data = (await res.json()) as SplitInfo;
        return data;
      } catch {
        return null;
      }
    });

    return await Promise.all(splitDataPromises);
  }

  useEffect(() => {
    setLoading(true);
    getRecentSplits().then((results) => {
      setRecentSplits(results.filter((s): s is SplitInfo => s !== null));
      setLoading(false);
    });
  }, []);

  const handleRemove = (e: Event, id: string) => {
    e.stopPropagation();
    removeStoredId(id);
    setRecentSplits(recentSplits.filter((s) => s.id !== id));
  };

  return html`
    ${recentSplits.length > 0
      ? html`
          <section>
            <h4>Groupes récents</h4>
            <div class="vstack gap-2">
              ${recentSplits.map(
                (s) => html`
                  <div class="card p-4 hstack justify-between">
                    <a href="/split?split_id=${s.id}">${s.description}</a>
                    <button
                      type="button"
                      class="small"
                      data-variant="danger"
                      onClick=${(e: Event) => handleRemove(e, s.id)}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                `,
              )}
            </div>
          </section>
        `
      : null}
    ${loading
      ? html`<div aria-busy="true" data-spinner="small">
          Chargement des groupes récents...
        </div>`
      : null}
    ${!loading && recentSplits.length === 0
      ? html`<p class="text-light">
          Aucun groupe récent. Créez ou rejoignez-en un ci-dessus !
        </p>`
      : null}
  `;
}

export default defineIsland(RecentSplits, import.meta.path);
