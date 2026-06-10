import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { defineIsland } from "noxt";

function ShareSplit() {
  const [splitId, setSplitId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("split_id");
    setSplitId(id);
  }, []);

  const copyToClipboard = async (
    text: string,
    setter: (v: boolean) => void,
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      alert("Échec de la copie dans le presse-papiers");
    }
  };

  if (!splitId) {
    return html`<p>Aucun identifiant de groupe fourni.</p>`;
  }

  const splitUrl = `${window.location.origin}/split?split_id=${splitId}`;

  return html`
    <div class="vstack gap-4">
      <a href="/split?split_id=${splitId}" data-variant="secondary">
        ${"<"} Retour au groupe
      </a>

      <h2>Partager le groupe</h2>

      <article class="card">
        <header>
          <h3>Partager ce groupe</h3>
        </header>
        <div class="vstack">
          <p>
            Partagez ce lien avec vos amis :<br />
            <a href=${splitUrl} target="_blank">${splitUrl}</a>
            <button
              type="button"
              class="outline small"
              onClick=${() => copyToClipboard(splitUrl, setCopiedLink)}
            >
              ${copiedLink ? "Copié !" : "Copier le lien"}
            </button>
          </p>
          <p>
            Ou utilisez ce code :<br />
            <strong>${splitId}</strong>
            <button
              type="button"
              class="outline small"
              onClick=${() => copyToClipboard(splitId, setCopiedCode)}
            >
              ${copiedCode ? "Copié !" : "Copier le code"}
            </button>
          </p>
        </div>
      </article>
    </div>
  `;
}

export default defineIsland(ShareSplit, import.meta.path);
