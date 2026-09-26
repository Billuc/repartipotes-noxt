import { NoxtProdServer, type RouteHandlers } from "noxt";

const PORT = Bun.env.PORT ?? "2101";
const base = "/repartipotes";

const server = new NoxtProdServer(
  async ({ routes }: { routes: RouteHandlers<any> }) => {
    let server = Bun.serve({
      port: PORT,
      routes,
      fetch: (req) => {
        console.log("Could not serve: " + req.url);
        return new Response(undefined, { status: 404 });
      },
    });
    console.log(
      `Demo serving at http://localhost:${PORT}${base}/ (${Object.keys(routes).length} routes)`,
    );
    return server;
  },
);
server.start();
