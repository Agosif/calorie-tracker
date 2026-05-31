import { pgTable, serial, integer, text, real, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const mealTypeEnum = pgEnum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack']);
export const sourceEnum = pgEnum('meal_source', ['photo', 'manual']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  dailyCalorieGoal: integer('daily_calorie_goal').notNull().default(2200),
  dailyProteinGoalG: integer('daily_protein_goal_g').notNull().default(150),
  dailyCarbGoalG: integer('daily_carb_goal_g').notNull().default(250),
  dailyFatGoalG: integer('daily_fat_goal_g').notNull().default(70),
  dailyFiberGoalG: integer('daily_fiber_goal_g').notNull().default(30),
  dailySugarGoalG: integer('daily_sugar_goal_g').notNull().default(50),
  dailySodiumGoalMg: integer('daily_sodium_goal_mg').notNull().default(2300),
  dailySatFatGoalG: integer('daily_sat_fat_goal_g').notNull().default(20),
  heightCm: integer('height_cm'),
  weightKg: real('weight_kg'),
  bodyFatPct: real('body_fat_pct'),
  age: integer('age'),
  sex: text('sex'),
  activityLevel: text('activity_level'),
  goal: text('goal'),
  goalPace: text('goal_pace'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  consumedAt: timestamp('consumed_at').notNull().defaultNow(),
  mealType: mealTypeEnum('meal_type').notNull(),
  name: text('name').notNull(),
  calories: integer('calories').notNull(),
  proteinG: integer('protein_g').notNull(),
  carbsG: integer('carbs_g').notNull(),
  fatG: integer('fat_g').notNull(),
  fiberG: integer('fiber_g').notNull().default(0),
  sugarG: integer('sugar_g').notNull().default(0),
  sodiumMg: integer('sodium_mg').notNull().default(0),
  satFatG: integer('sat_fat_g').notNull().default(0),
  aiConfidence: real('ai_confidence'),
  source: sourceEnum('source').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
