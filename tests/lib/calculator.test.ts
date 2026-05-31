import { describe, expect, test } from 'vitest';
import { bmrMifflin, bmrKatchMcArdle, calculateGoals } from '@/lib/calculator';

describe('bmrMifflin', () => {
  test('male reference: 30y, 80kg, 180cm', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(bmrMifflin(80, 180, 30, 'male')).toBe(1780);
  });

  test('female reference: 30y, 65kg, 165cm', () => {
    // 10*65 + 6.25*165 - 5*30 - 161 = 650 + 1031.25 - 150 - 161 = 1370.25
    expect(bmrMifflin(65, 165, 30, 'female')).toBeCloseTo(1370.25);
  });
});

describe('bmrKatchMcArdle', () => {
  test('80kg at 15% body fat: LBM = 68kg, BMR = 370 + 21.6*68 = 1838.8', () => {
    expect(bmrKatchMcArdle(80, 15)).toBeCloseTo(1838.8);
  });

  test('60kg at 22% body fat', () => {
    // LBM = 60 * 0.78 = 46.8, BMR = 370 + 21.6 * 46.8 = 1380.88
    expect(bmrKatchMcArdle(60, 22)).toBeCloseTo(1380.88);
  });
});

describe('calculateGoals - lose weight', () => {
  test('male, 80kg, 180cm, 30y, moderate activity, lose 20%', () => {
    const r = calculateGoals({
      heightCm: 180, weightKg: 80, age: 30, sex: 'male',
      activityLevel: 'moderate', goal: 'lose', goalPace: 'moderate',
    });
    // BMR Mifflin = 1780
    // TDEE = 1780 * 1.55 = 2759
    // target = 2759 * 0.8 = 2207, round10 = 2210
    expect(r.bmr).toBe(1780);
    expect(r.tdee).toBe(2759);
    expect(r.targetCalories).toBe(2210);
    // Protein = 2.2 * 80 = 176, round5 = 175
    expect(r.proteinG).toBe(175);
    // Fat = 0.9 * 80 = 72, round5 = 70
    expect(r.fatG).toBe(70);
    // Carbs = (2210 - 175*4 - 70*9) / 4 = (2210 - 700 - 630) / 4 = 220
    expect(r.carbsG).toBe(220);
  });
});

describe('calculateGoals - maintain', () => {
  test('female, 65kg, 165cm, 30y, light activity, maintain', () => {
    const r = calculateGoals({
      heightCm: 165, weightKg: 65, age: 30, sex: 'female',
      activityLevel: 'light', goal: 'maintain', goalPace: 'moderate',
    });
    // BMR Mifflin = 1370 (rounded from 1370.25)
    // TDEE = 1370 * 1.375 ≈ 1884
    // target = TDEE = 1880 (rounded to 10)
    expect(r.bmr).toBe(1370);
    expect(r.tdee).toBeGreaterThan(1880);
    expect(r.tdee).toBeLessThan(1890);
    expect(r.targetCalories).toBe(r.tdee % 10 === 0 ? r.tdee : Math.round(r.tdee / 10) * 10);
    // Protein = 2.0 * 65 = 130
    expect(r.proteinG).toBe(130);
  });
});

describe('calculateGoals - gain', () => {
  test('male, 70kg, 175cm, 25y, active, gain slow', () => {
    const r = calculateGoals({
      heightCm: 175, weightKg: 70, age: 25, sex: 'male',
      activityLevel: 'active', goal: 'gain', goalPace: 'slow',
    });
    // BMR = 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 ≈ 1674
    expect(r.bmr).toBe(1674);
    // TDEE = 1674 * 1.725 ≈ 2887.65 ≈ 2888
    expect(r.tdee).toBe(2888);
    // target = 2888 * 1.10 = 3176.8, round10 = 3180
    expect(r.targetCalories).toBe(3180);
  });
});

describe('calculateGoals - body fat overrides Mifflin', () => {
  test('uses Katch-McArdle when bodyFatPct provided', () => {
    const withBf = calculateGoals({
      heightCm: 180, weightKg: 80, age: 30, sex: 'male', bodyFatPct: 15,
      activityLevel: 'moderate', goal: 'maintain', goalPace: 'moderate',
    });
    const withoutBf = calculateGoals({
      heightCm: 180, weightKg: 80, age: 30, sex: 'male',
      activityLevel: 'moderate', goal: 'maintain', goalPace: 'moderate',
    });
    // Katch-McArdle for 80kg @ 15% bf = 1839; Mifflin = 1780. Should differ.
    expect(withBf.bmr).not.toBe(withoutBf.bmr);
    expect(withBf.bmr).toBe(1839); // rounded from 1838.8
  });
});

describe('calculateGoals - macros sum to roughly target', () => {
  test('protein*4 + carbs*4 + fat*9 is within 5% of targetCalories', () => {
    const r = calculateGoals({
      heightCm: 170, weightKg: 70, age: 35, sex: 'male',
      activityLevel: 'moderate', goal: 'maintain', goalPace: 'moderate',
    });
    const macroCal = r.proteinG * 4 + r.carbsG * 4 + r.fatG * 9;
    const drift = Math.abs(macroCal - r.targetCalories) / r.targetCalories;
    expect(drift).toBeLessThan(0.05);
  });
});

describe('calculateGoals - sex affects sugar recommendation', () => {
  test('male gets 36g, female gets 25g', () => {
    const male = calculateGoals({
      heightCm: 180, weightKg: 80, age: 30, sex: 'male',
      activityLevel: 'moderate', goal: 'maintain', goalPace: 'moderate',
    });
    const female = calculateGoals({
      heightCm: 165, weightKg: 65, age: 30, sex: 'female',
      activityLevel: 'moderate', goal: 'maintain', goalPace: 'moderate',
    });
    expect(male.sugarG).toBe(36);
    expect(female.sugarG).toBe(25);
  });
});
