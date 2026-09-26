import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { getStoredIds, removeStoredId } from "../lib/splits";
import { useNoxtContext } from "@/lib/runtime";
import type { SplitData } from "@/lib/types";

interface SplitInfo {
  id: string;
  description: string;
}

export default function RecentSplits() {
  const { page, api } = useNoxtContext();

  const [recentSplits, setRecentSplits] = useState<SplitInfo[]>([]);
  const [loading, setLoading] = useState(true);

  async function getRecentSplits() {
    const ids = getStoredIds();
    if (ids.length === 0) {
      return [];
    }

    const splitDataPromises = ids.map(async (id) => {
      try {
        const data = await api("/api/splits", "GET")({ id });
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
      const filteredResults = results.filter((s): s is SplitData => s !== null);
      setRecentSplits(filteredResults);
      setLoading(false);
    });
  }, []);

  const handleRemove = (e: Event, id: string) => {
    e.stopPropagation();
    removeStoredId(id);
    setRecentSplits(recentSplits.filter((s) => s.id !== id));
  };

  return (
    <>
      {recentSplits.length > 0 ? (
        <section>
          <h4>Groupes récents</h4>
          <div class="vstack gap-2">
            {recentSplits.map((s) => (
              <div class="card p-4 hstack justify-between">
                <a href={page("/split", { split_id: s.id })}>{s.description}</a>
                <button
                  type="button"
                  class="small"
                  data-variant="danger"
                  onClick={(e: Event) => handleRemove(e, s.id)}
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {loading ? (
        <div aria-busy="true" data-spinner="small">
          Chargement des groupes récents...
        </div>
      ) : null}
      {!loading && recentSplits.length === 0 ? (
        <p class="text-light">
          Aucun groupe récent. Créez ou rejoignez-en un ci-dessus !
        </p>
      ) : null}
    </>
  );
}
