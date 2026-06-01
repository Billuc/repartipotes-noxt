import { prepareRoutes } from "noxt" with { type: "macro" };
import { getDb } from "./lib/database";
import { createCurrencyRepository } from "./lib/repositories/currency_repository";
import {
  createSplitHandlers,
  createExpenseHandlers,
  createCurrencyHandlers,
  wrapApi,
} from "./api";

const db = getDb();

const { handleCreateSplit, handleGetSplit, handleUpdateSplit } = createSplitHandlers(db);
const { handleCreateExpense, handleUpdateExpense, handleDeleteExpense } = createExpenseHandlers(db);
const { handleListCurrencies } = createCurrencyHandlers(createCurrencyRepository());

const PORT = process.env.PORT ?? "2101";
// @ts-ignore - prepareRoutes is a Bun macro, its return type is resolved at build time
const noxtRoutes = (await import(prepareRoutes())).default;

const splits = wrapApi({
  POST: async (req) => {
    const body = await req.json();
    return handleCreateSplit(body);
  },
});

const splitById = wrapApi({
  GET: (req) => handleGetSplit(req.url.split("/").pop()!),
  PUT: async (req) => {
    const id = req.url.split("/").pop()!;
    const body = await req.json();
    return handleUpdateSplit(id, body);
  },
});

const expenses = wrapApi({
  POST: async (req) => {
    const body = await req.json();
    return handleCreateExpense(body);
  },
});

const expenseById = wrapApi({
  PUT: async (req) => {
    const id = Number(req.url.split("/").pop()!);
    const body = await req.json();
    return handleUpdateExpense(id, body);
  },
  DELETE: async (req) => {
    const id = Number(req.url.split("/").pop()!);
    const body = await req.json().catch(() => ({}));
    return handleDeleteExpense(id, body);
  },
});

const currencies = wrapApi({
  GET: () => handleListCurrencies(),
});

Bun.serve({
  port: PORT,
  routes: {
    ...noxtRoutes,
    "/api/splits": splits,
    "/api/splits/:id": splitById,
    "/api/expenses": expenses,
    "/api/expenses/:id": expenseById,
    "/api/currencies": currencies,
  },
  development: process.env.MODE === "development",
});

console.log("Server running on http://localhost:" + PORT);
