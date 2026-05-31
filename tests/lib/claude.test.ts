import { describe, expect, test } from 'vitest';
import { parseClaudeResponse } from '@/lib/claude';

describe('parseClaudeResponse', () => {
  test('parses fenced JSON response', () => {
    const raw = `Some preamble.
\`\`\`json
{
  "name": "Grilled chicken with rice",
  "calories": 612,
  "protein_g": 45,
  "carbs_g": 70,
  "fat_g": 12,
  "confidence": 0.78,
  "notes": "oil amount unclear"
}
\`\`\``;
    const out = parseClaudeResponse(raw);
    expect(out.name).toBe('Grilled chicken with rice');
    expect(out.calories).toBe(612);
    expect(out.proteinG).toBe(45);
    expect(out.confidence).toBe(0.78);
    expect(out.notes).toBe('oil amount unclear');
  });

  test('parses bare JSON (no fence)', () => {
    const raw = '{"name":"Apple","calories":95,"protein_g":0,"carbs_g":25,"fat_g":0,"confidence":0.9}';
    expect(parseClaudeResponse(raw).name).toBe('Apple');
  });

  test('rounds non-integer macros', () => {
    const raw = '{"name":"X","calories":100.7,"protein_g":10.4,"carbs_g":20.5,"fat_g":5.1,"confidence":0.5}';
    const out = parseClaudeResponse(raw);
    expect(out.calories).toBe(101);
    expect(out.proteinG).toBe(10);
    expect(out.carbsG).toBe(21);
    expect(out.fatG).toBe(5);
  });

  test('throws on missing required field', () => {
    expect(() => parseClaudeResponse('{"name":"x"}')).toThrow();
  });

  test('throws on invalid JSON', () => {
    expect(() => parseClaudeResponse('definitely not json')).toThrow();
  });
});
