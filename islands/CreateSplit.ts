import { html } from "htm/preact";
import { useState } from "preact/hooks";
import { defineIsland } from "noxt";
import { useFetch } from "noxt/runtime";
import { CurrencySelectRaw } from "./CurrencySelect";

interface Currency {
  code: string;
  name: string;
  country: string;
  country_code: string | null;
}

function CreateSplit() {
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState([""]);
  const [defaultCurrency, setDefaultCurrency] = useState("EUR");
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFetch<Currency[]>("/api/currencies");

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
      setError("Please fill in description and at least one participant.");
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
        throw new Error((errData as any).error ?? "Failed to create split");
      }

      const data = (await res.json()) as { id: string };
      window.location.href = `/split?split_id=${data.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSubmitting(false);
    }
  };

  return html`
    <div class="create-split">
      <button
        type="button"
        class="btn btn-primary"
        onClick=${() => setIsOpen(!isOpen)}
      >
        ${isOpen ? "Cancel" : "New split"}
      </button>

      ${isOpen
        ? html`
            <form onSubmit=${handleSubmit} class="island-form">
              ${error ? html`<p class="form-error">${error}</p>` : null}

              <label>
                Description:
                <input
                  type="text"
                  value=${description}
                  onInput=${(e: Event) =>
                    setDescription((e.target as HTMLInputElement).value)}
                  placeholder="Trip to Paris"
                  required
                />
              </label>

              <label>
                Participants:
                ${participants.map(
                  (p, i) => html`
                    <div class="participant-row">
                      <input
                        type="text"
                        value=${p}
                        onInput=${(e: Event) =>
                          updateParticipant(
                            i,
                            (e.target as HTMLInputElement).value,
                          )}
                        placeholder="Name"
                        required
                      />
                      ${participants.length > 1
                        ? html`
                            <button
                              type="button"
                              class="btn-icon"
                              onClick=${() => removeParticipant(i)}
                              title="Remove"
                            >
                              ×
                            </button>
                          `
                        : null}
                    </div>
                  `,
                )}
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick=${addParticipant}
                >
                  + Add participant
                </button>
              </label>

              <label>
                Default currency:
                <${CurrencySelectRaw}
                  selected=${defaultCurrency}
                  onChange=${(code: string) => setDefaultCurrency(code)}
                />
              </label>

              <button
                type="submit"
                class="btn btn-primary"
                disabled=${submitting}
              >
                ${submitting ? "Creating..." : "Create split"}
              </button>
            </form>
          `
        : null}
    </div>
  `;
}

export default defineIsland(CreateSplit, import.meta.path);
