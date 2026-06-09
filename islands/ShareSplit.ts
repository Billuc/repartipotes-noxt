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
      alert("Failed to copy to clipboard");
    }
  };

  if (!splitId) {
    return html`<p>No split ID provided.</p>`;
  }

  const splitUrl = `${window.location.origin}/split?split_id=${splitId}`;

  return html`
    <div class="vstack gap-4">
      <a href="/split?split_id=${splitId}" data-variant="secondary">
        ${"<"} Return to split
      </a>

      <h2>Share split</h2>

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
              onClick=${() => copyToClipboard(splitUrl, setCopiedLink)}
            >
              ${copiedLink ? "Copied!" : "Copy link"}
            </button>
          </p>
          <p>
            Or use this code:<br />
            <strong>${splitId}</strong>
            <button
              type="button"
              class="outline small"
              onClick=${() => copyToClipboard(splitId, setCopiedCode)}
            >
              ${copiedCode ? "Copied!" : "Copy code"}
            </button>
          </p>
        </div>
      </article>
    </div>
  `;
}

export default defineIsland(ShareSplit, import.meta.path);
