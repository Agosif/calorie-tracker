export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';
export type GoalPace = 'slow' | 'moderate' | 'fast';

export type CalculatorInput = {
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  goalPace: GoalPace;
  bodyFatPct?: number | null;
};

export type CalculatedGoals = {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  satFatG: number;
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT_PCT: Record<Goal, Record<GoalPace, number>> = {
  lose:     { slow: -0.10, moderate: -0.20, fast: -0.25 },
  maintain: { slow:  0.00, moderate:  0.00, fast:  0.00 },
  gain:     { slow:  0.10, moderate:  0.15, fast:  0.20 },
};

/** Mifflin-St Jeor BMR (kcal/day) — used when body fat % is unknown. */
export function bmrMifflin(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/** Katch-McArdle BMR (kcal/day) — uses lean body mass. More accurate when body fat % is known. */
export function bmrKatchMcArdle(weightKg: number, bodyFatPct: number): number {
  const lbm = weightKg * (1 - bodyFatPct / 100);
  return 370 + 21.6 * lbm;
}

export function calculateGoals(input: CalculatorInput): CalculatedGoals {
  const rawBmr = input.bodyFatPct != null && input.bodyFatPct > 0
    ? bmrKatchMcArdle(input.weightKg, input.bodyFatPct)
    : bmrMifflin(input.weightKg, input.heightCm, input.age, input.sex);

  const bmr = Math.round(rawBmr);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[input.activityLevel]);
  const adjustmentPct = GOAL_ADJUSTMENT_PCT[input.goal][input.goalPace];
  const targetCalories = round10(tdee * (1 + adjustmentPct));

  // Protein: 2.0 g/kg body weight for maintain/gain, 2.2 g/kg for lose (preserve LBM)
  const proteinPerKg = input.goal === 'lose' ? 2.2 : 2.0;
  const proteinG = round5(input.weightKg * proteinPerKg);

  // Fat: 0.9 g/kg body weight (~25-30% of calories, in the healthy band)
  const fatG = round5(input.weightKg * 0.9);

  // Carbs: remainder
  const remainingCal = targetCalories - proteinG * 4 - fatG * 9;
  const carbsG = Math.max(0, round5(remainingCal / 4));

  // Micros — public-health guidelines
  const fiberG = round5(14 * (targetCalories / 1000));
  const sugarG = input.sex === 'male' ? 36 : 25; // AHA added-sugar caps
  const sodiumMg = 2300;
  const satFatG = Math.round((targetCalories * 0.07) / 9); // ≤7% of cal from sat fat

  return {
    bmr,
    tdee,
    targetCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    sugarG,
    sodiumMg,
    satFatG,
  };
}

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

function round10(n: number): number {
  return Math.round(n / 10) * 10;
}
