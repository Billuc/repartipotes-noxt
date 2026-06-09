import { html } from "htm/preact";
import { useState } from "preact/hooks";
import { defineIsland } from "noxt";
import { storeId } from "../lib/splits";

function JoinSplit() {
  const [code, setCode] = useState("");

  const handleJoin = (e: Event) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    storeId(trimmed);
    window.location.href = `/split?split_id=${trimmed}`;
  };

  return html`
    <form onSubmit=${handleJoin}>
      <label data-field>
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
      <button type="submit">Join split</button>
    </form>
  `;
}

export default defineIsland(JoinSplit, import.meta.path);
