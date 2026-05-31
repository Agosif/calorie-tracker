import { describe, expect, test } from 'vitest';
import { parseClaudeResponse } from '@/lib/claude';

describe('parseClaudeResponse', () => {
  test('parses fenced JSON with all 7 nutrients', () => {
    const raw = `Some preamble.
\`\`\`json
{
  "name": "Grilled chicken with rice",
  "calories": 612,
  "protein_g": 45,
  "carbs_g": 70,
  "fat_g": 12,
  "fiber_g": 3,
  "sugar_g": 2,
  "sodium_mg": 480,
  "sat_fat_g": 3,
  "confidence": 0.78,
  "notes": "oil amount unclear"
}
\`\`\``;
    const out = parseClaudeResponse(raw);
    expect(out.name).toBe('Grilled chicken with rice');
    expect(out.calories).toBe(612);
    expect(out.proteinG).toBe(45);
    expect(out.fiberG).toBe(3);
    expect(out.sugarG).toBe(2);
    expect(out.sodiumMg).toBe(480);
    expect(out.satFatG).toBe(3);
    expect(out.confidence).toBe(0.78);
    expect(out.notes).toBe('oil amount unclear');
  });

  test('parses bare JSON (no fence)', () => {
    const raw = '{"name":"Apple","calories":95,"protein_g":0,"carbs_g":25,"fat_g":0,"fiber_g":4,"sugar_g":19,"sodium_mg":2,"sat_fat_g":0,"confidence":0.9}';
    expect(parseClaudeResponse(raw).name).toBe('Apple');
    expect(parseClaudeResponse(raw).fiberG).toBe(4);
    expect(parseClaudeResponse(raw).sugarG).toBe(19);
  });

  test('rounds non-integer values', () => {
    const raw = '{"name":"X","calories":100.7,"protein_g":10.4,"carbs_g":20.5,"fat_g":5.1,"fiber_g":2.6,"sugar_g":7.3,"sodium_mg":412.8,"sat_fat_g":1.4,"confidence":0.5}';
    const out = parseClaudeResponse(raw);
    expect(out.calories).toBe(101);
    expect(out.proteinG).toBe(10);
    expect(out.carbsG).toBe(21);
    expect(out.fatG).toBe(5);
    expect(out.fiberG).toBe(3);
    expect(out.sugarG).toBe(7);
    expect(out.sodiumMg).toBe(413);
    expect(out.satFatG).toBe(1);
  });

  test('defaults missing micro fields to 0 (backward compat for old responses)', () => {
    const raw = '{"name":"X","calories":100,"protein_g":10,"carbs_g":20,"fat_g":5,"confidence":0.5}';
    const out = parseClaudeResponse(raw);
    expect(out.fiberG).toBe(0);
    expect(out.sugarG).toBe(0);
    expect(out.sodiumMg).toBe(0);
    expect(out.satFatG).toBe(0);
  });

  test('throws on missing required field (name)', () => {
    expect(() => parseClaudeResponse('{"calories":100,"protein_g":10,"carbs_g":20,"fat_g":5,"confidence":0.5}')).toThrow();
  });

  test('throws on invalid JSON', () => {
    expect(() => parseClaudeResponse('definitely not json')).toThrow();
  });
});
