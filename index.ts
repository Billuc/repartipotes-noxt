import { handlers } from "noxt:api";

const PORT = Bun.env.PORT ?? "2101";

Bun.serve({
  port: PORT,
  routes: {
    ...noxtRoutes,
    ...handlers,
  },
  development: process.env.MODE === "development",
});

console.log("Server running on http://localhost:" + PORT);
