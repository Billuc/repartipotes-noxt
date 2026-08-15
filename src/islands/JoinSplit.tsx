import { h } from "preact";
import { useState } from "preact/hooks";
import { storeId } from "../lib/splits";
import { link } from "noxt:utils";

export default function JoinSplit() {
  const [code, setCode] = useState("");

  const handleJoin = (e: Event) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    storeId(trimmed);
    window.location.href = link("/split", { split_id: trimmed });
  };

  return (
    <form onSubmit={handleJoin}>
      <label data-field>
        Code du groupe :
        <input
          type="text"
          value={code}
          onInput={(e: Event) => setCode((e.target as HTMLInputElement).value)}
          placeholder="Entrez le code du groupe"
          required
        />
      </label>
      <button type="submit">Rejoindre le groupe</button>
    </form>
  );
}
