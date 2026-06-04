import { html } from "htm/preact";
import { useState } from "preact/hooks";

interface SettingsTabProps {
  participants: string[];
  individualBalances: Record<string, number>;
  defaultCurrency: string;
  splitId: string | null;
  onSaved: () => void;
}

export default function SettingsTab({ participants, individualBalances, defaultCurrency, splitId, onSaved }: SettingsTabProps) {
  const [newParticipant, setNewParticipant] = useState("");
  const [participantError, setParticipantError] = useState<string | null>(null);

  const handleAddParticipant = async (e: Event) => {
    e.preventDefault();
    if (!newParticipant.trim()) return;

    const updated = [...participants, newParticipant.trim()];

    try {
      const res = await fetch(`/api/splits/${splitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants: updated }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        throw new Error((errData.error as string) ?? "Failed to add participant");
      }

      setNewParticipant("");
      setParticipantError(null);
      onSaved();
    } catch (err) {
      setParticipantError(err instanceof Error ? err.message : "Failed to add participant");
    }
  };

  return html`
    <div id="settings">
      <h3>Participants</h3>
      <ul>
        ${participants.map(
          (p) => html`
            <li>
              ${p}
              ${individualBalances[p] != null
                ? (() => {
                    const displayBalance = -individualBalances[p]!;
                    if (displayBalance === 0) return null;
                    return html`
                      <span
                        class="individual-balance ${displayBalance > 0
                          ? "positive"
                          : "negative"}"
                      >
                        (${displayBalance > 0 ? "+" : ""}${displayBalance.toFixed(2)}${defaultCurrency})
                      </span>
                    `;
                  })()
                : null}
            </li>
          `,
        )}
      </ul>

      <form
        onSubmit=${handleAddParticipant}
        class="island-form add-participant-form"
      >
        ${participantError
          ? html`<p class="form-error">${participantError}</p>`
          : null}
        <div class="participant-row">
          <input
            type="text"
            value=${newParticipant}
            onInput=${(e: Event) =>
              setNewParticipant((e.target as HTMLInputElement).value)}
            placeholder="New participant name"
            required
          />
          <button type="submit" class="btn btn-primary">Add</button>
        </div>
      </form>
    </div>
  `;
}
