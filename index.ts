import { handlers } from "noxt:api";
import routes from "noxt:routes";
import { BASE } from "noxt:utils";

const PORT = Bun.env.PORT ?? "2101";
const noxtRoutes: Record<string, Response> = {};
for (const route in routes) {
  noxtRoutes[route] = new Response(
    Bun.file(routes[route as keyof typeof routes]),
  );
}

Bun.serve({
  port: PORT,
  routes: {
    ...noxtRoutes,
    ...handlers,
  },
  development: process.env.MODE === "development",
});

console.log("Server running on http://localhost:" + PORT + BASE + "/");
