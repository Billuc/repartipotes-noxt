/**
 * API handler for creating a new split
 * POST /api/createSplit
 */

import { createSplit } from "@lib/db";
import type { CreateSplitInput } from "@lib/types";

export async function handleCreateSplit(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await request.formData();
    const description = formData.get("description") as string;
    const defaultCurrency = formData.get("defaultCurrency") as string;
    const participants = formData.getAll("participants") as string[];

    // Validation
    if (!description || !description.trim()) {
      return new Response(
        JSON.stringify({ error: "Description is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!defaultCurrency) {
      return new Response(
        JSON.stringify({ error: "Currency is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (participants.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 participants are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Filter empty participant names
    const validParticipants = participants.filter((p) => p && p.trim());
    if (validParticipants.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 valid participant names are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const input: CreateSplitInput = {
      description: description.trim(),
      participants: validParticipants,
      defaultCurrency,
    };

    const split = createSplit(input);

    return new Response(JSON.stringify({ splitId: split.id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating split:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
