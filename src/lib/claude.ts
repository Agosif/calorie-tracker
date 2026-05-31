import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const responseSchema = z.object({
  name: z.string().min(1),
  calories: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
  fiber_g: z.number().nonnegative().default(0),
  sugar_g: z.number().nonnegative().default(0),
  sodium_mg: z.number().nonnegative().default(0),
  sat_fat_g: z.number().nonnegative().default(0),
  confidence: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export type ParsedMeal = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  satFatG: number;
  confidence: number;
  notes?: string;
};

export function parseClaudeResponse(raw: string): ParsedMeal {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fence ? fence[1].trim() : raw.trim();
  const obj = JSON.parse(jsonStr);
  const parsed = responseSchema.parse(obj);
  return {
    name: parsed.name,
    calories: Math.round(parsed.calories),
    proteinG: Math.round(parsed.protein_g),
    carbsG: Math.round(parsed.carbs_g),
    fatG: Math.round(parsed.fat_g),
    fiberG: Math.round(parsed.fiber_g),
    sugarG: Math.round(parsed.sugar_g),
    sodiumMg: Math.round(parsed.sodium_mg),
    satFatG: Math.round(parsed.sat_fat_g),
    confidence: parsed.confidence,
    notes: parsed.notes,
  };
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const PROMPT = `You are a nutrition estimator. Given a photo of a meal, return ONLY a JSON object with these fields:
{
  "name": "short title, e.g. 'Grilled chicken with rice'",
  "calories": integer total calories,
  "protein_g": integer grams of protein,
  "carbs_g": integer grams of total carbohydrates,
  "fat_g": integer grams of total fat,
  "fiber_g": integer grams of dietary fiber,
  "sugar_g": integer grams of total sugar (natural + added),
  "sodium_mg": integer milligrams of sodium,
  "sat_fat_g": integer grams of saturated fat (subset of total fat),
  "confidence": float 0..1 of how confident you are,
  "notes": "optional, anything ambiguous worth flagging (oil amount, hidden ingredients, portion uncertainty)"
}

Assume the plate is ~25cm unless visible otherwise. Use utensils/hands as scale. Round to whole numbers.
If a value is genuinely zero or trace (e.g. fiber in plain meat), return 0.
If you cannot tell what the food is, return name "Unknown" and confidence below 0.3.
Output ONLY the JSON, no other text.`;

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

export async function analyzeMeal(imageBase64: string, mediaType: ImageMediaType): Promise<ParsedMeal> {
  const msg = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  });

  const text = msg.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('No text in Claude response');
  return parseClaudeResponse(text.text);
}
