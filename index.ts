import { prepareImportMap, serverRender } from "@lib/server";
import { MODE, PORT } from "@lib/env";
import { handleGetSplits } from "./src/api/getSplits";
import { handleCreateSplit } from "./src/api/createSplit";
import { handleAddExpense } from "./src/api/addExpense";

const importMap = await prepareImportMap();

Bun.serve({
  port: PORT,
  routes: {
    // API routes
    "/api/getSplits": handleGetSplits,
    "/api/createSplit": handleCreateSplit,
    "/api/addExpense": handleAddExpense,
    // Page routes
    ...importMap,
  },
  development: MODE === "development",
});

console.log("Server running on http://localhost:" + PORT);
