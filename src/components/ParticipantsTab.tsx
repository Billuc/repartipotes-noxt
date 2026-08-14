import { h } from "preact";
import { useState } from "preact/hooks";
import { apiRouter } from "@/lib/runtime";

interface SettingsTabProps {
  participants: string[];
  individualBalances: Record<string, number>;
  defaultCurrency: string;
  splitId: string | null;
  onSaved: () => void;
}

export default function SettingsTab({
  participants,
  individualBalances,
  defaultCurrency,
  splitId,
  onSaved,
}: SettingsTabProps) {
  const [newParticipant, setNewParticipant] = useState("");
  const [participantError, setParticipantError] = useState<string | null>(null);

  const handleAddParticipant = async (e: Event) => {
    e.preventDefault();
    if (!newParticipant.trim()) return;

    const updated = [...participants, newParticipant.trim()];

    try {
      await apiRouter.api(
        "/api/splits",
        "POST",
      )({
        id: splitId!,
        participants: updated,
      });

      setNewParticipant("");
      setParticipantError(null);
      onSaved();
    } catch (err) {
      setParticipantError(
        err instanceof Error ? err.message : "Échec de l'ajout du participant",
      );
    }
  };

  return (
    <div id="settings">
      <div class="hstack justify-between mb-4">
        <h3>Participants</h3>
      </div>

      <div class="vstack gap-2 mb-6">
        {participants.map((p) => (
          <div class="hstack justify-between p-4 card border-left-primary">
            <span>
              <strong>{p}</strong>
            </span>
            {individualBalances[p] != null
              ? (() => {
                  const displayBalance = -individualBalances[p]!;
                  if (displayBalance === 0) return null;
                  return (
                    <span
                      class="badge"
                      data-variant={displayBalance > 0 ? "success" : "danger"}
                    >
                      {displayBalance > 0 ? "+" : ""}
                      {displayBalance.toFixed(2)}
                      {defaultCurrency}
                    </span>
                  );
                })()
              : null}
          </div>
        ))}
      </div>

      <article class="card">
        <form onSubmit={handleAddParticipant}>
          {participantError ? (
            <div role="alert" data-variant="error">
              {participantError}
            </div>
          ) : null}
          <fieldset class="group">
            <input
              type="text"
              value={newParticipant}
              onInput={(e: Event) =>
                setNewParticipant((e.target as HTMLInputElement).value)
              }
              placeholder="Nom du nouveau participant"
              required
            />
            <button type="submit">Ajouter</button>
          </fieldset>
        </form>
      </article>
    </div>
  );
}
