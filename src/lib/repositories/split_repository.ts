import type { IDatabase } from "../database";
import { generateKey } from "../keys";
import type { Split, CreateSplitInput, UpdateSplitInput } from "../types";

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

export interface ISplitRepository {
  getSplit(id: string): Split | null;
  createSplit(input: CreateSplitInput): string;
  updateSplit(input: UpdateSplitInput): void;
}

class SplitRepository implements ISplitRepository {
  constructor(private db: IDatabase) {}

  getSplit(id: string): Split | null {
    const row = this.db.query<SplitRow>(
      "SELECT * FROM splits WHERE id = ?"
    ).get(id);
    return row ? rowToSplit(row) : null;
  }

  createSplit(input: CreateSplitInput): string {
    const id = generateKey();
    this.db.query(
      "INSERT INTO splits (id, description, participants, default_currency) VALUES (?, ?, ?, ?)"
    ).run(id, input.description, input.participants.join(","), input.default_currency);
    return id;
  }

  updateSplit(input: UpdateSplitInput): void {
    if (input.description !== undefined) {
      this.db.query(
        "UPDATE splits SET description = ? WHERE id = ?"
      ).run(input.description, input.id);
    }
    if (input.participants !== undefined) {
      this.db.query(
        "UPDATE splits SET participants = ? WHERE id = ?"
      ).run(input.participants.join(","), input.id);
    }
    if (input.default_currency !== undefined) {
      this.db.query(
        "UPDATE splits SET default_currency = ? WHERE id = ?"
      ).run(input.default_currency, input.id);
    }
  }
}

export function createSplitRepository(db: IDatabase): ISplitRepository {
  return new SplitRepository(db);
}
