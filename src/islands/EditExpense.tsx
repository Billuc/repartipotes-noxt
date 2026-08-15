import { h } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";
import CurrencySelect from "./CurrencySelect.tsx";
import { apiRouter } from "@/lib/runtime.ts";
import { useApi } from "noxt/runtime";
import { buildSplitMethod } from "@/lib/runtime.ts";
import { link } from "noxt:utils";

function timestampToDateTimeLocal(ts: number): string {
  const d = new Date(ts * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateTimeLocalToTimestamp(val: string): number {
  return Math.floor(new Date(val).getTime() / 1000);
}

export default function EditExpense() {
  const { splitId, expenseId } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const splitId = params.get("split_id");
    const expenseId = params.get("expense_id");
    return { splitId, expenseId };
  }, []);

  if (!splitId) {
    return (
      <div role="alert" data-variant="error">
        Identifiant de groupe manquant
      </div>
    );
  }

  const {
    data: splitData,
    error,
    loading,
  } = useApi(apiRouter.api("/api/splits", "GET"), { id: splitId! });

  const [dataError, setDataError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [payedBy, setPayedBy] = useState("");
  const [payedFor, setPayedFor] = useState<string[]>([]);
  const [splitMethod, setSplitMethod] = useState<"Evenly" | "Amounts">(
    "Evenly",
  );
  const [amountsValue, setAmountsValue] = useState<Record<string, string>>({});
  const [dateTime, setDateTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = expenseId !== null;

  useEffect(() => {
    if (!splitData) return;

    setCurrency(splitData.default_currency);
    setPayedFor([...splitData.participants]);
    setDateTime(timestampToDateTimeLocal(Math.floor(Date.now() / 1000)));

    if (expenseId) {
      const found = splitData.expenses.find((e) => e.id === Number(expenseId));
      if (found) {
        setName(found.name);
        setAmount(found.original_amount.toString());
        setCurrency(found.original_currency);
        setPayedBy(found.payed_by);
        setPayedFor([...found.payed_for]);
        setSplitMethod(
          found.split_method.method === "Amounts" ? "Amounts" : "Evenly",
        );
        if (
          found.split_method.method === "Amounts" &&
          found.split_method.details
        ) {
          setAmountsValue(JSON.parse(found.split_method.details));
        }
        setDateTime(timestampToDateTimeLocal(found.expense_date));
      } else {
        setDataError("Dépense introuvable");
      }
    }
  }, [splitData]);

  const toggleParticipant = (participant: string) => {
    setPayedFor((prev) =>
      prev.includes(participant)
        ? prev.filter((p) => p !== participant)
        : [...prev, participant],
    );
  };

  const updateAmountValue = (participant: string, value: string) => {
    setAmountsValue((prev) => ({ ...prev, [participant]: value }));
  };

  const totalAmount = parseFloat(amount) || 0;
  const checkedCount = payedFor.length;
  const perPerson = checkedCount > 0 ? totalAmount / checkedCount : 0;

  const validateAmounts = (): string | null => {
    if (splitMethod === "Amounts") {
      const total = payedFor.reduce(
        (sum, p) => sum + (parseFloat(amountsValue[p] ?? "0") || 0),
        0,
      );
      if (Math.abs(total - totalAmount) > 0.01) {
        return `La somme des montants individuels (${total.toFixed(2)}) doit être égale au montant total (${totalAmount.toFixed(2)})`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const validationError = validateAmounts();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!name.trim() || !amount || !payedBy || payedFor.length === 0) {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const amountsArray = payedFor.map((p) =>
      splitMethod === "Amounts"
        ? parseFloat(amountsValue[p] ?? "0") || 0
        : perPerson,
    );

    const body = {
      split_id: splitId,
      name: name.trim(),
      amount: totalAmount,
      currency,
      payed_by: payedBy,
      payed_for: payedFor,
      split_method: buildSplitMethod(
        totalAmount,
        payedFor,
        splitMethod,
        amountsArray,
      ),
      expense_date: dateTimeLocalToTimestamp(dateTime),
    };

    try {
      if (isEditing) {
        await apiRouter.api(
          "/api/expenses",
          "POST",
        )({
          id: Number(expenseId),
          ...body,
        });
      } else {
        await apiRouter.api("/api/expenses/create", "POST")(body);
      }

      window.location.href = link("/split", { split_id: splitId });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!expenseId) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) return;

    setSubmitting(true);
    try {
      await apiRouter.api(
        "/api/expenses",
        "DELETE",
      )({
        id: Number(expenseId),
        split_id: splitId,
      });

      window.location.href = link("/split", { split_id: splitId });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const getAmountFor = (participant: string): string => {
    if (splitMethod === "Evenly") {
      return checkedCount > 0 ? perPerson.toFixed(2) : "0.00";
    }
    return amountsValue[participant] ?? "0";
  };

  if (loading) {
    return (
      <div class="vstack items-center p-8">
        <div aria-busy="true" data-spinner="large"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || dataError) {
    return (
      <div role="alert" data-variant="error">
        {error ?? dataError}
      </div>
    );
  }

  if (!splitData) {
    return <p>Aucune donnée de groupe trouvée.</p>;
  }

  return (
    <div class="vstack gap-4">
      <a href={link("/split", { split_id: splitId })} data-variant="secondary">
        {"<"} Retour au groupe
      </a>

      <h2>{isEditing ? "Modifier la dépense" : "Nouvelle dépense"}</h2>

      <form onSubmit={handleSubmit}>
        {formError ? (
          <div role="alert" data-variant="error">
            {formError}
          </div>
        ) : null}
        <label data-field>
          Nom :
          <input
            type="text"
            value={name}
            onInput={(e: Event) =>
              setName((e.target as HTMLInputElement).value)
            }
            placeholder="Nom de la dépense"
            required
          />
        </label>
        <label data-field>
          Montant :
          <input
            type="number"
            value={amount}
            onInput={(e: Event) =>
              setAmount((e.target as HTMLInputElement).value)
            }
            step="0.01"
            min="0"
            placeholder="0.00"
            required
          />
        </label>
        <label data-field>
          Devise :
          <CurrencySelect
            selected={currency}
            onChange={(code: string) => setCurrency(code)}
          />
        </label>
        <label data-field>
          Payé par :
          <select
            value={payedBy}
            onChange={(e: Event) =>
              setPayedBy((e.target as HTMLSelectElement).value)
            }
            required
          >
            <option value="">Sélectionner le payeur</option>
            {splitData.participants.map((p) => (
              <option value={p} selected={p === payedBy}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label data-field>
          Méthode de répartition :
          <select
            value={splitMethod}
            onChange={(e: Event) =>
              setSplitMethod(
                (e.target as HTMLSelectElement).value as "Evenly" | "Amounts",
              )
            }
          >
            <option value="Evenly">Équitablement</option>
            <option value="Amounts">Par montant</option>
          </select>
        </label>
        <fieldset>
          <legend>Répartir entre :</legend>
          {splitData.participants.map((p) => (
            <div class="hstack">
              <label>
                <input
                  type="checkbox"
                  checked={payedFor.includes(p)}
                  onChange={() => toggleParticipant(p)}
                />
                {p}
              </label>
              <input
                type="number"
                value={getAmountFor(p)}
                onInput={(e: Event) => {
                  if (splitMethod === "Amounts") {
                    updateAmountValue(p, (e.target as HTMLInputElement).value);
                  }
                }}
                min="0"
                step="0.01"
                disabled={splitMethod === "Evenly" || !payedFor.includes(p)}
                class="w-100px"
              />
            </div>
          ))}
        </fieldset>
        <label data-field>
          Date :
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e: Event) =>
              setDateTime((e.target as HTMLInputElement).value)
            }
          />
        </label>
        <div class="hstack justify-end gap-2 mt-4">
          <button type="submit" disabled={submitting}>
            {submitting
              ? "Enregistrement..."
              : isEditing
                ? "Enregistrer"
                : "Ajouter une dépense"}
          </button>
          {isEditing ? (
            <button
              type="button"
              data-variant="danger"
              onClick={handleDelete}
              disabled={submitting}
            >
              Supprimer
            </button>
          ) : null}
          <a
            href={link("/split", { split_id: splitId })}
            class="outline"
            data-variant="secondary"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}
