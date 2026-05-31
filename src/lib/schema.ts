import { pgTable, serial, integer, text, real, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const mealTypeEnum = pgEnum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack']);
export const sourceEnum = pgEnum('meal_source', ['photo', 'manual']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  dailyCalorieGoal: integer('daily_calorie_goal').notNull().default(2200),
  dailyProteinGoalG: integer('daily_protein_goal_g').notNull().default(150),
  dailyCarbGoalG: integer('daily_carb_goal_g').notNull().default(250),
  dailyFatGoalG: integer('daily_fat_goal_g').notNull().default(70),
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
  aiConfidence: real('ai_confidence'),
  source: sourceEnum('source').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
