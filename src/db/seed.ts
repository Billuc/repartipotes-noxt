/**
 * Seed script to populate test data
 * Run with: bun run --hot ./lib/seed.ts
 */

import { createSplit, addExpense } from "./db";
import type { CreateSplitInput, AddExpenseInput } from "../types";

console.log("🌱 Seeding database with test data...\n");

try {
  // Create a test split
  const splitInput: CreateSplitInput = {
    description: "Paris Trip 2025",
    participants: ["Alice", "Bob", "Charlie"],
    defaultCurrency: "EUR",
  };

  const split = createSplit(splitInput);
  console.log(`✓ Created split: "${split.description}" (ID: ${split.id})`);
  console.log(`  Participants: ${split.participants.join(", ")}\n`);

  // Add some test expenses
  const expenses: AddExpenseInput[] = [
    {
      splitId: split.id,
      name: "Hotel",
      amount: 300,
      currency: "EUR",
      payedBy: "Alice",
      payedFor: ["Alice", "Bob", "Charlie"],
      splitMethod: "Evenly",
    },
    {
      splitId: split.id,
      name: "Dinner at Michelin Restaurant",
      amount: 150,
      currency: "EUR",
      payedBy: "Bob",
      payedFor: ["Alice", "Bob", "Charlie"],
      splitMethod: "Evenly",
    },
    {
      splitId: split.id,
      name: "Museum Tickets",
      amount: 60,
      currency: "EUR",
      payedBy: "Charlie",
      payedFor: ["Alice", "Bob"], // Only Alice and Bob went
      splitMethod: "Evenly",
    },
    {
      splitId: split.id,
      name: "Train tickets",
      amount: 120,
      currency: "EUR",
      payedBy: "Alice",
      payedFor: ["Alice", "Bob", "Charlie"],
      splitMethod: "Amounts",
      amounts: {
        Alice: 40,
        Bob: 40,
        Charlie: 40,
      },
    },
  ];

  for (const expenseInput of expenses) {
    const expense = addExpense(expenseInput);
    console.log(
      `✓ Added expense: "${expense.name}" - €${expense.amount} (paid by ${expense.payedBy})`,
    );
  }

  console.log(
    `\n✅ Seed complete! Created 1 split with ${expenses.length} expenses`,
  );
  console.log(
    `\nVisit http://localhost:5000/split.html?id=${split.id} to view the split`,
  );

  process.exit(0);
} catch (error) {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
}
