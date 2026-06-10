export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function wrapApi(handlers: Record<string, (req: Request) => Response | Promise<Response>>) {
  return async (req: Request): Promise<Response> => {
    const handler = handlers[req.method];
    if (!handler) {
      return jsonResponse({ error: "Méthode non autorisée" }, 405);
    }
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return jsonResponse({ error: err.message }, 404);
      }
      if (err instanceof BadRequestError) {
        return jsonResponse({ error: err.message }, 400);
      }
      const message = err instanceof Error ? err.message : "Erreur interne du serveur";
      return jsonResponse({ error: message }, 500);
    }
  };
}
