import { html } from "htm/preact";
import { useState } from "preact/hooks";
import { defineIsland } from "noxt";
import CurrencySelect from "./CurrencySelect";

function CreateSplit() {
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState([""]);
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addParticipant = () => {
    setParticipants([...participants, ""]);
  };

  const updateParticipant = (i: number, value: string) => {
    const updated = [...participants];
    updated[i] = value;
    setParticipants(updated);
  };

  const removeParticipant = (i: number) => {
    setParticipants(participants.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const validParticipants = participants
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (!description.trim() || validParticipants.length === 0) {
      setError("Veuillez remplir la description et ajouter au moins un participant.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/splits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          participants: validParticipants,
          default_currency: defaultCurrency,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as any).error ?? "Échec de la création du groupe");
      }

      const data = (await res.json()) as { id: string };
      window.location.href = `/split?split_id=${data.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setSubmitting(false);
    }
  };

  return html`
    <form onSubmit=${handleSubmit}>
      ${error ? html`<div role="alert" data-variant="error">${error}</div>` : null}

      <label data-field>
        Description :
        <input
          type="text"
          value=${description}
          onInput=${(e: Event) =>
            setDescription((e.target as HTMLInputElement).value)}
          placeholder="Voyage à Paris"
          required
        />
      </label>

      <div data-field>
        <label>Participants :</label>
        ${participants.map(
          (p, i) => html`
            <fieldset class="group">
              <input
                type="text"
                value=${p}
                onInput=${(e: Event) =>
                  updateParticipant(i, (e.target as HTMLInputElement).value)}
                placeholder="Nom"
                required
              />
              ${participants.length > 1
                ? html`
                    <button
                      type="button"
                      class="ghost"
                      onClick=${() => removeParticipant(i)}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  `
                : null}
            </fieldset>
          `,
        )}
        <button
          type="button"
          class="outline"
          onClick=${addParticipant}
        >
          + Ajouter un participant
        </button>
      </div>

      <label data-field>
        Devise par défaut :
        <${CurrencySelect}
          selected=${defaultCurrency}
          onChange=${(code: string) => setDefaultCurrency(code)}
        />
      </label>

      <button type="submit" disabled=${submitting}>
        ${submitting ? "Création..." : "Créer le groupe"}
      </button>
    </form>
  `;
}

export default defineIsland(CreateSplit, import.meta.path);
