import { getDb } from "./database";
import { generateKey } from "./keys";
import type { Split, CreateSplitInput, UpdateSplitInput } from "./types";

interface SplitRow {
  id: string;
  description: string;
  participants: string;
  default_currency: string;
}

function rowToSplit(row: SplitRow): Split {
  return {
    id: row.id,
    description: row.description,
    participants: row.participants ? row.participants.split(",") : [],
    default_currency: row.default_currency,
  };
}

export function getSplit(id: string): Split | null {
  const d = getDb();
  const row = d.query<SplitRow, string>(
    "SELECT * FROM splits WHERE id = ?"
  ).get(id);
  return row ? rowToSplit(row) : null;
}

export function createSplit(input: CreateSplitInput): string {
  const d = getDb();
  const id = generateKey();
  d.query<unknown, [string, string, string, string]>(
    "INSERT INTO splits (id, description, participants, default_currency) VALUES (?, ?, ?, ?)"
  ).run(id, input.description, input.participants.join(","), input.default_currency);
  return id;
}

export function updateSplit(input: UpdateSplitInput): void {
  const d = getDb();
  if (input.description !== undefined) {
    d.query<unknown, [string, string]>(
      "UPDATE splits SET description = ? WHERE id = ?"
    ).run(input.description, input.id);
  }
  if (input.participants !== undefined) {
    d.query<unknown, [string, string]>(
      "UPDATE splits SET participants = ? WHERE id = ?"
    ).run(input.participants.join(","), input.id);
  }
  if (input.default_currency !== undefined) {
    d.query<unknown, [string, string]>(
      "UPDATE splits SET default_currency = ? WHERE id = ?"
    ).run(input.default_currency, input.id);
  }
}
