/**
 * Form for creating a new split
 * Interactive island with modal dialog
 */

import { html } from "htm/preact";
import { useState } from "preact/hooks";
import { defineIsland } from "@lib/island";

function CreateSplitForm() {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([""]);

  function addParticipantField() {
    setParticipants([...participants, ""]);
  }

  function removeParticipantField(index: number) {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  }

  function updateParticipant(index: number, value: string) {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const description = formData.get("description") as string;
    const currency = formData.get("currency") as string;
    const validParticipants = participants.filter((p) => p.trim());

    if (!description.trim()) {
      setError("Description is required");
      setSubmitting(false);
      return;
    }

    if (validParticipants.length < 2) {
      setError("At least 2 participants are required");
      setSubmitting(false);
      return;
    }

    const finalFormData = new FormData();
    finalFormData.append("description", description);
    finalFormData.append("defaultCurrency", currency);
    validParticipants.forEach((p) => finalFormData.append("participants", p));

    try {
      const response = await fetch("/api/createSplit", {
        method: "POST",
        body: finalFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || "Failed to create split");
        setSubmitting(false);
        return;
      }

      const data = await response.json();
      // Redirect to split detail page
      window.location.href = `/split.html?id=${data.splitId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating split");
      setSubmitting(false);
    }
  }

  return html`
    <div class="create-split-container">
      <button class="btn btn-primary" onclick=${() => setShowModal(true)}>
        + Create New Split
      </button>

      ${showModal
        ? html`
            <div class="modal-overlay" onclick=${() => setShowModal(false)}>
              <div class="modal" onclick=${(e: Event) => e.stopPropagation()}>
                <div class="modal-header">
                  <h3>Create New Split</h3>
                  <button
                    class="modal-close"
                    onclick=${() => setShowModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <form class="split-form" onsubmit=${handleSubmit}>
                  ${error ? html` <div class="form-error">${error}</div> ` : ""}

                  <div class="form-group">
                    <label for="split-description">Description</label>
                    <input
                      id="split-description"
                      type="text"
                      name="description"
                      placeholder="e.g., Paris Trip 2025"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="split-currency">Default Currency</label>
                    <select id="split-currency" name="currency" value="USD">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="CHF">CHF (CHF)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Participants</label>
                    <div class="participants-list">
                      ${participants.map(
                        (participant, index) => html`
                          <div class="participant-row" key=${index}>
                            <input
                              type="text"
                              name="participant"
                              value=${participant}
                              placeholder="Name"
                              onchange=${(e: Event) =>
                                updateParticipant(
                                  index,
                                  (e.target as HTMLInputElement).value,
                                )}
                              required
                            />
                            ${participants.length > 1
                              ? html`
                                  <button
                                    type="button"
                                    class="btn-remove"
                                    onclick=${() =>
                                      removeParticipantField(index)}
                                  >
                                    ✕
                                  </button>
                                `
                              : ""}
                          </div>
                        `,
                      )}
                    </div>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      onclick=${addParticipantField}
                    >
                      + Add Participant
                    </button>
                  </div>

                  <div class="form-actions">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      onclick=${() => setShowModal(false)}
                      disabled=${submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      disabled=${submitting}
                    >
                      ${submitting ? "Creating..." : "Create Split"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          `
        : ""}
    </div>
  `;
}

export default defineIsland(CreateSplitForm, import.meta.path);
