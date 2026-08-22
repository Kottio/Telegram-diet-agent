import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { Meal } from "../schema";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY
export const PROMPT_VERSION = "v1";

const SYSTEM = `Tu convertis la description d'un repas en données structurées.

Règles:
- Une entrée par aliment distinct. Sépare les descriptions composées.
- Garde les noms dans la langue de l'utilisateur.
- quantity et unit exactement comme énoncés; si non énoncés, assume un portion normale. 
- grams: estime seulement si tu es confiant, sinon null.
- kcal et macros pour la quantité TOTALE consommée, pas pour 100g. null si incertain.
- confidence: "high" si un poids explicite est donné, "medium" pour une portion
  standard courante, "low" si c'est une vraie supposition.
- N'invente jamais un aliment non mentionné.`;

/** Returns the model's RAW output. Validation is a separate step, on purpose. */
export async function parseMeal(text: string) {
  const msg = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL!,
    max_tokens: 1024,
    temperature: 0,
    system: SYSTEM,
    tools: [
      {
        name: "log_meal",
        description: "Enregistre le contenu structuré d'un repas.",
        input_schema: z.toJSONSchema(Meal) as never, // derived — never written twice
      },
    ],
    tool_choice: { type: "tool", name: "log_meal" }, // forces structure
    messages: [{ role: "user", content: text }],
  });

  const block = msg.content.find((c) => c.type === "tool_use");
  if (!block || block.type !== "tool_use")
    throw new Error("no tool_use block returned");

  return {
    raw: block.input,
    model: msg.model,
    promptVersion: PROMPT_VERSION,
    usage: msg.usage, // capture from day one — M10 needs it
  };
}
